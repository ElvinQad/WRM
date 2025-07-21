#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run

/**
 * Database Seeder for Hosted Supabase
 * 
 * This script helps you populate your hosted Supabase database with seed data.
 */

import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// Load environment variables
const _env = await load({
  envPath: "../../.env",
  export: true
});

async function readSeedFile(): Promise<string> {
  try {
    const seedContent = await Deno.readTextFile('./supabase/seed.sql');
    return seedContent;
  } catch (error) {
    console.error("❌ Error reading seed file:", (error as Error).message);
    console.log("💡 Make sure supabase/seed.sql exists");
    Deno.exit(1);
  }
}

function validateEnvironment(): boolean {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  for (const envVar of requiredVars) {
    if (!Deno.env.get(envVar)) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      return false;
    }
  }
  
  return true;
}

async function testConnection(): Promise<boolean> {
  console.log("🧪 Testing database connection...");
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  try {
    // Test basic connection
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log("✅ Database connection successful");
      return true;
    } else {
      console.error(`❌ Database connection failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Connection error:", (error as Error).message);
    return false;
  }
}

async function listAvailableTables(): Promise<void> {
  console.log("📋 Checking what tables are available via REST API...");
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  // Try to get the OpenAPI spec to see available tables
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Accept': 'application/openapi+json'
      }
    });
    
    if (response.ok) {
      const spec = await response.json();
      if (spec.paths) {
        const tables = Object.keys(spec.paths)
          .filter(path => path.startsWith('/') && !path.includes('{'))
          .map(path => path.substring(1))
          .filter(table => table && !table.includes('/'));
        
        console.log("📋 Available tables via REST API:");
        tables.forEach(table => console.log(`   • ${table}`));
      }
    } else {
      console.log("⚠️ Could not retrieve available tables list");
    }
  } catch (error) {
    console.log("⚠️ Could not check available tables:", (error as Error).message);
  }
}

async function checkTablesExist(): Promise<boolean> {
  console.log("🔍 Checking if tables exist...");
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const requiredTables = ['ticket_types', 'agents'];
  
  for (const table of requiredTables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Table '${table}' not accessible: ${response.status} ${response.statusText}`);
        console.error(`   Response: ${errorText}`);
        
        if (response.status === 401) {
          console.log("💡 Authentication issue - check your SUPABASE_SERVICE_ROLE_KEY");
        } else if (response.status === 403) {
          console.log("💡 Permission denied - RLS policies may need service_role access");
          console.log("   Run the fix-rls-permissions.sql script first");
        } else if (response.status === 404) {
          console.log("💡 Table not found - run the database migrations first:");
          console.log("   deno task setup (or apply migrations manually)");
        } else if (response.status === 406) {
          console.log("💡 Schema issue - the table might exist but have RLS enabled");
          console.log("   Try applying the migrations to enable proper access");
        }
        return false;
      }
    } catch (error) {
      console.error(`❌ Error checking table '${table}':`, (error as Error).message);
      return false;
    }
  }
  
  console.log("✅ All required tables exist and are accessible");
  return true;
}

async function clearExistingData(): Promise<boolean> {
  console.log("🧹 Clearing existing seed data...");
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  // Clear data in dependency order (agents first, then ticket_types)
  const clearOrder = ['agents', 'ticket_types'];
  
  for (const table of clearOrder) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: 'DELETE',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      });
      
      if (response.ok) {
        console.log(`✅ Cleared ${table} table`);
      } else {
        console.warn(`⚠️ Could not clear ${table} table: ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ Error clearing ${table}:`, (error as Error).message);
    }
  }
  
  return true;
}

async function main() {
  console.log(`
🌱 WRM Database Seeder
======================
`);

  // Step 1: Validate environment
  console.log("1️⃣  Checking environment...");
  if (!validateEnvironment()) {
    console.error("❌ Environment validation failed");
    Deno.exit(1);
  }
  console.log("✅ Environment validated");

  // Step 2: Test connection
  console.log("\n2️⃣  Testing database connection...");
  if (!(await testConnection())) {
    console.error("❌ Database connection failed");
    Deno.exit(1);
  }

  // Step 2.5: List available tables for debugging
  await listAvailableTables();

  // Step 3: Check tables exist
  console.log("\n3️⃣  Checking database schema...");
  if (!(await checkTablesExist())) {
    console.error("❌ Required tables not found");
    Deno.exit(1);
  }

  // Step 4: Read seed file
  console.log("\n4️⃣  Reading seed data...");
  const seedSQL = await readSeedFile();
  console.log(`✅ Seed file loaded (${seedSQL.length} characters)`);

  // Step 5: Clear existing data
  console.log("\n5️⃣  Clearing existing seed data...");
  await clearExistingData();

  // Step 6: Apply seed data
  console.log("\n6️⃣  Applying seed data...");
  console.log("📋 Please run this SQL in your Supabase dashboard:");
  console.log("─".repeat(50));
  console.log(seedSQL);
  console.log("─".repeat(50));
  console.log("Press Enter when done...");
  
  const buffer = new Uint8Array(1024);
  await Deno.stdin.read(buffer);

  console.log(`
🎉 Seeding Complete!
====================

Your database has been populated with:
• Default ticket types (Meeting, Development, Personal, Review)
• AI agents (Code Assistant, Meeting Facilitator, Documentation Writer, QA)

You can now:
1. Start development: deno task dev
2. Test the API endpoints
3. Create tickets with the seeded types
4. Collaborate with the seeded agents

Need to re-seed? Run: deno task db:seed
`);
}

if (import.meta.main) {
  main();
}
