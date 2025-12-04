import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 5000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

/**
 * Get the MongoDB database instance
 */
export async function getDb(dbName: string = 'promptaries'): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}

/**
 * Close the MongoDB connection (useful for cleanup in tests)
 */
export async function closeDb() {
  const client = await clientPromise
  await client.close()
}

/**
 * Ensures all required MongoDB indexes exist
 *
 * Creates indexes for:
 * - users: email (unique), webexId (unique), orgId, provider
 * - accounts: provider + providerAccountId (NextAuth)
 * - sessions: sessionToken, expires (TTL)
 *
 * Should be called on application startup or via deployment script.
 *
 * @returns Object with index creation results
 */
export async function ensureIndexes(): Promise<{
  users: string[];
  accounts: string[];
  sessions: string[];
  authAuditLogs: string[];
}> {
  const db = await getDb();

  // Users collection indexes
  const usersCollection = db.collection('users');
  const userIndexes = await Promise.all([
    // Email index (unique) - for user lookup
    usersCollection.createIndex(
      { email: 1 },
      {
        unique: true,
        name: 'email_unique',
        background: true,
      }
    ),

    // Webex ID index (unique) - for OAuth user matching
    usersCollection.createIndex(
      { webexId: 1 },
      {
        unique: true,
        sparse: true, // Allow documents without webexId
        name: 'webexId_unique',
        background: true,
      }
    ),

    // Organization ID index - for access control queries
    usersCollection.createIndex(
      { orgId: 1 },
      {
        name: 'orgId_1',
        background: true,
      }
    ),

    // Provider index - for multi-provider support (future)
    usersCollection.createIndex(
      { provider: 1 },
      {
        name: 'provider_1',
        background: true,
      }
    ),

    // Compound index: provider + orgId - for efficient filtering
    usersCollection.createIndex(
      { provider: 1, orgId: 1 },
      {
        name: 'provider_orgId',
        background: true,
      }
    ),
  ]);

  // Accounts collection indexes (managed by NextAuth adapter)
  const accountsCollection = db.collection('accounts');
  const accountIndexes = await Promise.all([
    // Provider + providerAccountId (unique) - NextAuth requirement
    accountsCollection.createIndex(
      { provider: 1, providerAccountId: 1 },
      {
        unique: true,
        name: 'provider_providerAccountId_unique',
        background: true,
      }
    ),

    // userId index - for looking up user's accounts
    accountsCollection.createIndex(
      { userId: 1 },
      {
        name: 'userId_1',
        background: true,
      }
    ),
  ]);

  // Sessions collection indexes (if using database sessions)
  const sessionsCollection = db.collection('sessions');
  const sessionIndexes = await Promise.all([
    // Session token (unique) - for session lookup
    sessionsCollection.createIndex(
      { sessionToken: 1 },
      {
        unique: true,
        name: 'sessionToken_unique',
        background: true,
      }
    ),

    // Expires index with TTL - auto-delete expired sessions
    sessionsCollection.createIndex(
      { expires: 1 },
      {
        name: 'expires_ttl',
        expireAfterSeconds: 0, // Delete at expire time
        background: true,
      }
    ),
  ]);

  // Auth audit logs collection indexes
  const authAuditLogsCollection = db.collection('auth_audit_logs');
  const authAuditLogIndexes = await Promise.all([
    // Timestamp index with TTL - auto-delete logs after 1 year
    authAuditLogsCollection.createIndex(
      { timestamp: 1 },
      {
        name: 'timestamp_ttl',
        expireAfterSeconds: 365 * 24 * 60 * 60, // 1 year retention
        background: true,
      }
    ),

    // User ID index - for querying user's audit history
    authAuditLogsCollection.createIndex(
      { userId: 1 },
      {
        name: 'userId_1',
        background: true,
      }
    ),

    // Email index - for querying by email (includes failed attempts)
    authAuditLogsCollection.createIndex(
      { email: 1 },
      {
        name: 'email_1',
        background: true,
      }
    ),

    // Action index - for filtering by action type
    authAuditLogsCollection.createIndex(
      { action: 1 },
      {
        name: 'action_1',
        background: true,
      }
    ),

    // Compound index: timestamp + action - for efficient filtering
    authAuditLogsCollection.createIndex(
      { timestamp: -1, action: 1 },
      {
        name: 'timestamp_action',
        background: true,
      }
    ),

    // IP address index - for tracking suspicious activity
    authAuditLogsCollection.createIndex(
      { ipAddress: 1 },
      {
        name: 'ipAddress_1',
        background: true,
      }
    ),
  ]);

  console.log('[DB] Indexes ensured successfully');
  console.log(`[DB] Users indexes: ${userIndexes.length}`);
  console.log(`[DB] Accounts indexes: ${accountIndexes.length}`);
  console.log(`[DB] Sessions indexes: ${sessionIndexes.length}`);
  console.log(`[DB] Auth audit logs indexes: ${authAuditLogIndexes.length}`);

  return {
    users: userIndexes,
    accounts: accountIndexes,
    sessions: sessionIndexes,
    authAuditLogs: authAuditLogIndexes,
  };
}

/**
 * Gets user by email
 *
 * @param email - User's email address
 * @returns User document or null
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  return db.collection('users').findOne({ email });
}

/**
 * Gets user by Webex ID
 *
 * @param webexId - Webex People ID
 * @returns User document or null
 */
export async function getUserByWebexId(webexId: string) {
  const db = await getDb();
  return db.collection('users').findOne({ webexId });
}

/**
 * Updates user's Webex OAuth fields
 *
 * @param userId - MongoDB user ID (string)
 * @param data - Webex OAuth data to update
 * @returns Update result
 */
export async function updateUserWebexData(
  userId: string,
  data: {
    webexId: string;
    orgId: string;
    provider: 'webex';
  }
) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  return db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );
}
