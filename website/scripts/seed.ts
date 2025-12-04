import { getDb, closeDb } from '../lib/db/mongodb'
import seedData from '../../seed-data.json'
import { ObjectId } from 'mongodb'

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    const db = await getDb()

    // Clear existing data
    console.log('🗑️  Clearing existing prompts...')
    await db.collection('prompts').deleteMany({})

    // Transform seed data
    const prompts = seedData.map((prompt) => ({
      ...prompt,
      _id: new ObjectId(),
      authorId: new ObjectId(), // Generate new ObjectIds for users
      parentPromptId: prompt.parentPromptId ? new ObjectId() : null,
      starredBy: [],
      createdAt: new Date(prompt.createdAt),
      updatedAt: new Date(prompt.updatedAt),
    }))

    // Insert prompts
    console.log(`📝 Inserting ${prompts.length} prompts...`)
    await db.collection('prompts').insertMany(prompts)

    console.log('✅ Seed completed successfully!')
    console.log(`   Inserted ${prompts.length} prompts`)

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await closeDb()
  }
}

seed()
