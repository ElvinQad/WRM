# Hosted Supabase Database Management

This document outlines database management for the WRM Backend using hosted Supabase.

## Setup

### 1. Initial Configuration

First, you need to link your local project to your hosted Supabase project:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your hosted project
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Add these environment variables to your `.env` file:
```bash
# Hosted Supabase Configuration
SUPABASE_PROJECT_REF=your-project-ref-here
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Available Commands

```bash
# Link to hosted project
deno task db:link

# Check connection status (shows linked projects)
deno task db:status

# Apply migrations to hosted database
deno task db:push

# Pull schema from hosted database
deno task db:pull

# Generate TypeScript types from hosted database
deno task db:types

# View differences between local and remote
deno task db:diff

# Seed the database with initial data
deno task db:seed

# Run migration scripts manually
deno task migrate
```

## Migration Workflow for Hosted Supabase

### 1. Creating Schema Changes

**Option A: Use Supabase Dashboard (Recommended for beginners)**
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Write and execute your SQL
4. Pull changes to local: `deno task db:pull`

**Option B: Local-first approach (Recommended for teams)**
1. Create migration file manually:
   ```bash
   # Create migration file
   supabase migration new add_feature_name
   ```

2. Edit the generated migration file in `supabase/migrations/`

3. Apply to hosted database:
   ```bash
   deno task db:push
   ```

### 2. Initial Schema Setup

Since you're using hosted Supabase, you can apply the initial schema directly:

1. **Apply the initial migration:**
   ```bash
   # First, make sure you're linked
   deno task db:link
   
   # Apply all pending migrations
   deno task db:push
   ```

2. **Verify the setup:**
   ```bash
   # Check status
   deno task db:status
   
   # Generate types
   deno task db:types
   ```

### 3. Team Collaboration

When working with a team on hosted Supabase:

1. **Before starting work:**
   ```bash
   # Pull latest schema changes
   deno task db:pull
   
   # Generate updated types
   deno task db:types
   ```

2. **After making changes:**
   ```bash
   # Apply your migrations
   deno task db:push
   
   # Commit migration files to git
   git add supabase/migrations/
   git commit -m "Add: new database feature"
   ```

## Testing with Hosted Supabase

### 1. Test Database Setup

For testing, you have a few options:

**Option A: Use the same hosted instance (simple)**
- Create test data that can be easily cleaned up
- Use transactions that rollback for tests

**Option B: Separate test project (recommended)**
- Create a separate Supabase project for testing
- Use different environment variables for test

**Option C: Local testing (advanced)**
- Keep local Supabase for testing only
- Use hosted for development/production

### 2. Test Environment Configuration

Create a separate environment file for testing:

```bash
# .env.test
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key
```

Update your test command:
```json
// deno.json
"test": "deno test --allow-all --env-file=.env.test"
```

## Production Deployment

### 1. Environment Variables

Ensure these are set in your production environment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 2. Migration Deployment

**Manual Approach:**
```bash
# From your local machine
deno task db:push
```

**CI/CD Approach:**
```yaml
# .github/workflows/deploy.yml
- name: Deploy database migrations
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  run: |
    supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
    supabase db push
```

## Rollback Strategy for Hosted Supabase

### 1. Point-in-Time Recovery

Supabase provides automatic backups:

1. Go to your Supabase dashboard
2. Navigate to "Settings" → "Database"
3. Use "Point in time recovery" feature
4. Select the timestamp before the issue

### 2. Migration Rollback

Create rollback migrations:

```bash
# Create rollback migration
supabase migration new rollback_feature_name
```

Example rollback migration:
```sql
-- Migration: Rollback add user preferences
-- Created: 2025-07-21T12:00:00Z

-- Remove the table added in the forward migration
DROP TABLE IF EXISTS user_preferences;

-- Remove any columns added
ALTER TABLE users DROP COLUMN IF EXISTS preference_settings;
```

### 3. Emergency Procedures

**Immediate Response:**
1. Check Supabase dashboard for any ongoing issues
2. Review recent migrations in the dashboard
3. Use point-in-time recovery if data corruption occurred

**For Schema Issues:**
1. Create and apply rollback migration
2. Update application code to handle schema changes
3. Deploy application update

## Monitoring and Maintenance

### 1. Dashboard Monitoring

Regular checks in Supabase dashboard:
- Database usage and performance
- Recent queries and slow queries
- Authentication metrics
- Storage usage

### 2. Automated Monitoring

Set up alerts for:
- High database CPU usage
- Slow query performance
- Connection limit approaches
- Storage space usage

### 3. Regular Maintenance

**Weekly:**
- Review slow queries
- Check index usage
- Monitor table sizes

**Monthly:**
- Review and optimize queries
- Check backup retention
- Update Supabase CLI if needed

## Best Practices for Hosted Supabase

### 1. Schema Management
- Always use migrations for schema changes
- Never edit the database directly in production
- Keep migration files in version control

### 2. Security
- Use Row Level Security (RLS) for all tables
- Regularly rotate service role keys
- Monitor access logs in dashboard

### 3. Performance
- Add appropriate indexes for your queries
- Monitor query performance in dashboard
- Use connection pooling in production

### 4. Backup Strategy
- Rely on Supabase's automatic backups
- Periodically test point-in-time recovery
- Export critical data separately for redundancy

## Troubleshooting Common Issues

### Connection Issues
```bash
# Check if you're linked correctly
deno task db:status

# Re-link if needed
supabase logout
supabase login
deno task db:link
```

### Migration Conflicts
```bash
# Check what's different
deno task db:diff

# Pull remote changes
deno task db:pull

# Resolve conflicts in migration files
```

### Type Generation Issues
```bash
# Make sure you're connected
deno task db:status

# Generate types from remote
deno task db:types
```

This setup gives you all the benefits of version-controlled migrations while working with your hosted Supabase instance!
