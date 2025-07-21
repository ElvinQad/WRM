# Quick Start Guide - Hosted Supabase

This guide will get you up and running with your hosted Supabase database in minutes.

## Prerequisites

1. **Supabase Project**: You already have a hosted Supabase project
2. **Supabase CLI**: Install if you haven't already:
   ```bash
   npm install -g supabase
   ```

## Step 1: Environment Variables

Create or update your `.env` file in the project root with your Supabase credentials:

```bash
# Find these in your Supabase Dashboard > Settings > API
SUPABASE_PROJECT_REF=your-project-ref-here
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-hereplugin
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these values:**
- Go to your [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to "Settings" → "API"
- Copy the Project URL, anon key, and service_role key

## Step 2: Run Setup Script

We've created an automated setup script that will:
- Link your local project to hosted Supabase
- Apply the database schema
- Generate TypeScript types
- Test the connection

```bash
cd packages/backend
deno task setup
```

This script will guide you through the setup process and show you any issues.

## Step 3: Verify Setup

Check that everything is working:

```bash
# Check database connection
deno task db:status

# Run a quick test
deno task test src/tests/integration.test.ts

# Start your development server
deno task dev
```

## Step 4: Development Workflow

### Making Database Changes

1. **Create a migration:**
   ```bash
   supabase migration new add_new_feature
   ```

2. **Edit the migration file** in `supabase/migrations/`

3. **Apply to your hosted database:**
   ```bash
   deno task db:push
   ```

4. **Update TypeScript types:**
   ```bash
   deno task db:types
   ```

### Testing

```bash
# Run all tests
deno task test

# Run tests in watch mode
deno task test:watch

# Run with coverage
deno task test:coverage
```

## Common Commands

```bash
# Database Management
deno task db:status     # Check connection
deno task db:push       # Apply migrations
deno task db:pull       # Pull remote schema
deno task db:types      # Generate TS types
deno task db:diff       # See differences

# Development
deno task dev           # Start dev server
deno task build         # Build for production
deno task test          # Run tests

# Utilities
deno task setup         # Re-run setup
deno task lint          # Lint code
deno task type-check    # Check types
```

## Troubleshooting

### "Project not linked" error
```bash
# Re-run the setup
deno task setup

# Or manually link
deno task db:link
```

### "Permission denied" errors
- Check your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify the key has the right permissions in Supabase dashboard

### Migration conflicts
```bash
# See what's different
deno task db:diff

# Pull remote changes first
deno task db:pull

# Then push your changes
deno task db:push
```

### Type generation issues
```bash
# Make sure you're connected
deno task db:status

# Generate fresh types
deno task db:types
```

## Next Steps

1. **Explore the API**: Check out the OpenAPI docs at `/docs` when running
2. **Add features**: Start building your ticket management features
3. **Set up CI/CD**: Use the migration scripts in your deployment pipeline
4. **Monitor**: Set up alerts in your Supabase dashboard

## Need Help?

- Check the detailed guides:
  - `HOSTED_SUPABASE_SETUP.md` - Comprehensive database guide
  - `TESTING_INFRASTRUCTURE.md` - Testing strategies
  - `ROLLBACK_STRATEGY.md` - Emergency procedures
- Review Supabase docs: https://supabase.com/docs
- Check your Supabase dashboard for monitoring and logs

You're all set! Your hosted Supabase backend is ready for development. 🚀
