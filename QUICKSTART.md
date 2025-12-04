# Quick Start Guide - Promptaries Development Server

> Get the Promptaries prompt library running locally in under 5 minutes

## Prerequisites

- **Node.js** 20.x or later ([Download](https://nodejs.org/))
- **MongoDB Atlas** account (free tier) or local MongoDB instance
- **Git** (to clone the repository)
- **Code editor** (VS Code recommended)

## Quick Setup (5 Steps)

### 1. Clone and Navigate

```bash
git clone <your-repo-url>
cd promptaries/website
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages (~430 dependencies including Next.js 16, React 19, MongoDB driver, etc.)

### 3. Configure Environment Variables

Create `.env.local` file in the `website/` directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# NextAuth Configuration (for future authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
```

**Getting your MongoDB URI:**
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database credentials
6. Replace the database name if needed (default: `prompt_library`)

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Seed the Database (Optional but Recommended)

The project includes 20 example prompts in `../seed-data.json`:

```bash
npm run seed
```

This populates your database with test data so you can see the UI in action immediately.

### 5. Start the Development Server

```bash
npm run dev
```

The server will start on **http://localhost:3000**

You should see:
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 2.3s
```

## 🎉 You're Ready!

Open your browser to **http://localhost:3000** and you should see:
- **Home page** with prompt cards (if seeded)
- **Search bar** and category filters
- **Library** page (My Prompts, Starred, Forked tabs)
- **Leaderboard** page with top prompts
- **Create New** prompt button

## Project Structure

```
website/
├── app/                    # Next.js 15 App Router pages
│   ├── page.tsx           # Home page with search/filters
│   ├── library/           # User's prompt library
│   ├── leaderboard/       # Top prompts leaderboard
│   └── prompts/           # Prompt detail, create, edit pages
├── components/            # React components
│   ├── prompts/          # PromptCard, PromptGrid, PromptForm
│   ├── filters/          # SearchBar, CategoryFilter, SortDropdown
│   └── ui/               # Shadcn/ui components (Button, Input, etc.)
├── lib/                   # Utilities and database
│   ├── db/               # MongoDB connection and models
│   ├── validations/      # Zod validation schemas
│   └── constants.ts      # Categories, limits, platform URLs
├── types/                 # TypeScript type definitions
├── public/               # Static assets
└── .env.local            # Environment variables (you create this)
```

## Available Scripts

```bash
npm run dev          # Start development server (with hot reload)
npm run build        # Create production build
npm run start        # Start production server (after build)
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler (no emit)
npm run seed         # Seed database with test data
```

## Common Issues & Solutions

### ❌ "Invalid/Missing environment variable: MONGODB_URI"

**Problem:** `.env.local` file is missing or `MONGODB_URI` is not set.

**Solution:**
1. Make sure you created `.env.local` in the `website/` directory
2. Check that your MongoDB URI is correct (test it with MongoDB Compass)
3. Restart the dev server after changing `.env.local`

### ❌ "MongoServerError: bad auth"

**Problem:** Wrong username/password in MongoDB connection string.

**Solution:**
1. Go to MongoDB Atlas → Database Access
2. Verify your database user credentials
3. You may need to create a new database user
4. Update your connection string in `.env.local`

### ❌ "Error: Cannot find module '@/components/...'"

**Problem:** Dependencies not installed or import paths incorrect.

**Solution:**
```bash
cd website
rm -rf node_modules package-lock.json
npm install
```

### ❌ Port 3000 already in use

**Problem:** Another service is using port 3000.

**Solution:**
```bash
# Kill the process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### ❌ Build fails with TypeScript errors

**Problem:** Type checking errors prevent build.

**Solution:**
```bash
npm run type-check  # See all errors
npm run build       # Should succeed after fixes
```

All TypeScript errors have been fixed as of 2025-11-24. If you see new ones, check git status.

## Database Setup Details

### MongoDB Atlas (Recommended)

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (M0 Free tier is sufficient)
3. Add your IP address to Network Access (or use `0.0.0.0/0` for development)
4. Create database user with read/write permissions
5. Get connection string and add to `.env.local`

### Local MongoDB (Alternative)

If you prefer running MongoDB locally:

```bash
# Install MongoDB (Mac with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Use local connection string
MONGODB_URI=mongodb://localhost:27017/prompt_library
```

## Seeding the Database

The seed script (`scripts/seed.ts`) populates your database with:
- **20 example prompts** across 6 categories
- **Realistic data** including titles, descriptions, tags
- **Engagement metrics** (stars, forks, views)
- **Sample authors** and timestamps

After seeding, you'll have data to:
- Test search and filtering
- Verify prompt cards display correctly
- Check leaderboard scoring algorithm
- Test CRUD operations

## Next Steps After Setup

1. **Browse prompts** at http://localhost:3000
2. **Test search** and category filtering
3. **Create a new prompt** via the "Create New" button
4. **View leaderboard** to see top prompts by engagement
5. **Implement authentication** (NextAuth.js)
6. **Customize** categories, tags, or styling

## Technology Stack

- **Next.js 16.0.3** with App Router and Server Components
- **React 19.2.0** with Server Actions
- **TypeScript 5** for type safety
- **Tailwind CSS v4** for styling
- **MongoDB Native Driver 6.21** (not Mongoose)
- **Shadcn/ui** components (Radix UI primitives)
- **Zod** for validation
- **Date-fns** for date formatting

## Development Tips

### Hot Reload
The dev server automatically reloads when you save files:
- **Fast Refresh** for React components
- **Server restart** for API routes and server components

### Type Safety
The project uses strict TypeScript. Run type checking:
```bash
npm run type-check
```

### Database Queries
All database operations are in `lib/db/models/prompt.ts`:
- `getPublicPrompts()` - Search and filter
- `getPromptById()` - Single prompt fetch
- `createPrompt()` - Create new prompt
- `updatePrompt()` - Edit existing prompt
- `deletePrompt()` - Remove prompt
- `forkPrompt()` - Create a copy
- `toggleStar()` - Star/unstar
- `getLeaderboard()` - Top prompts with scoring

### Server Actions
CRUD operations use Next.js Server Actions in `app/actions/prompt-actions.ts`

### Debugging
Add breakpoints in VS Code or use:
```typescript
console.log('Debug:', { variable })
```

## Getting Help

- **Issues:** File issues in the repository
- **MongoDB:** [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- **Next.js:** [Next.js Documentation](https://nextjs.org/docs)

## Security Notes

⚠️ **For Development Only:**
- Never commit `.env.local` to git (it's in `.gitignore`)
- Use strong, unique values for `NEXTAUTH_SECRET` in production
- Restrict MongoDB Network Access to your IP in production
- Enable MongoDB authentication and use strong passwords

## Production Deployment

When ready to deploy to Vercel:

```bash
# Build and test locally first
npm run build
npm run start

# Deploy to Vercel (after connecting repo)
# Set environment variables in Vercel dashboard
# MONGODB_URI, NEXTAUTH_URL, NEXTAUTH_SECRET
```


---

**Happy coding! 🚀**

