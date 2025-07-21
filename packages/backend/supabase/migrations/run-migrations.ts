#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run

/**
 * Migration Runner for Hosted Supabase
 * 
 * This script helps you apply multiple migrations to your hosted Supabase database.
 */

import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// Load environment variables
const _env = await load({
  envPath: "../../.env",
  export: true
});

interface Migration {
  filename: string;
  timestamp: string;
  description: string;
  content: string;
  path: string;
}

async function getMigrations(): Promise<Migration[]> {
  const migrations: Migration[] = [];
  const migrationDir = "./supabase/migrations";
  
  try {
    // Read the migrations directory
    const entries = Deno.readDir(migrationDir);
    
    for await (const entry of entries) {
      if (entry.isFile && entry.name.endsWith('.sql')) {
        const filename = entry.name;
        const match = filename.match(/^(\d{14})_(.+)\.sql$/);
        
        if (match) {
          const [, timestamp, description] = match;
          const path = `${migrationDir}/${filename}`;
          const content = await Deno.readTextFile(path);
          
          migrations.push({
            filename,
            timestamp,
            description: description.replace(/_/g, ' '),
            content,
            path
          });
        }
      }
    }
  } catch (error) {
    console.error("❌ Error reading migrations directory:", (error as Error).message);
    Deno.exit(1);
  }
  
  // Sort by timestamp
  return migrations.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

async function checkMigrationTable(): Promise<boolean> {
  console.log("🔍 Checking if migration tracking table exists...");
  
  const _checkTableSQL = `
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'schema_migrations'
    );
  `;
  
  // For hosted Supabase, we'll create a simple tracking mechanism
  const createTableSQL = `
    -- Create migration tracking table
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  console.log("📋 Please run this SQL in your Supabase dashboard first:");
  console.log("─".repeat(50));
  console.log(createTableSQL);
  console.log("─".repeat(50));
  console.log("Press Enter when done...");
  
  const buffer = new Uint8Array(1024);
  await Deno.stdin.read(buffer);
  
  return true;
}

async function getAppliedMigrations(): Promise<string[]> {
  console.log("📋 Please run this SQL to check applied migrations:");
  console.log("─".repeat(50));
  console.log("SELECT version FROM schema_migrations ORDER BY version;");
  console.log("─".repeat(50));
  console.log("Copy the results and paste them here (one per line, or press Enter if empty):");
  
  const applied: string[] = [];
  
  // Read user input for applied migrations
  while (true) {
    const buffer = new Uint8Array(1024);
    const bytesRead = await Deno.stdin.read(buffer);
    if (!bytesRead) break;
    
    const input = new TextDecoder().decode(buffer.subarray(0, bytesRead)).trim();
    if (input === '') break;
    
    applied.push(...input.split('\n').map(line => line.trim()).filter(line => line));
    break;
  }
  
  return applied;
}

function generateMigrationSQL(pendingMigrations: Migration[]): string {
  let combinedSQL = `-- Combined Migration Script
-- Generated: ${new Date().toISOString()}
-- Migrations to apply: ${pendingMigrations.length}

BEGIN;

`;

  for (const migration of pendingMigrations) {
    combinedSQL += `
-- ===================================================================
-- Migration: ${migration.filename}
-- Description: ${migration.description}
-- Timestamp: ${migration.timestamp}
-- ===================================================================

${migration.content}

-- Record this migration as applied
INSERT INTO schema_migrations (version) VALUES ('${migration.timestamp}');

`;
  }
  
  combinedSQL += `
COMMIT;

-- Verification: Check applied migrations
SELECT version, applied_at FROM schema_migrations ORDER BY version;
`;

  return combinedSQL;
}

async function main() {
  console.log(`
🚀 WRM Migration Runner
=======================
`);

  // Step 1: Get all migrations
  console.log("1️⃣  Scanning for migrations...");
  const migrations = await getMigrations();
  
  if (migrations.length === 0) {
    console.log("✅ No migrations found");
    return;
  }
  
  console.log(`✅ Found ${migrations.length} migrations:`);
  migrations.forEach(m => {
    console.log(`   📄 ${m.filename} - ${m.description}`);
  });

  // Step 2: Check migration tracking
  console.log("\n2️⃣  Setting up migration tracking...");
  await checkMigrationTable();

  // Step 3: Get applied migrations
  console.log("\n3️⃣  Checking applied migrations...");
  const appliedMigrations = await getAppliedMigrations();
  
  console.log(`✅ Applied migrations: ${appliedMigrations.length}`);
  if (appliedMigrations.length > 0) {
    appliedMigrations.forEach(version => {
      const migration = migrations.find(m => m.timestamp === version);
      console.log(`   ✅ ${migration?.filename || version}`);
    });
  }

  // Step 4: Find pending migrations
  const pendingMigrations = migrations.filter(m => 
    !appliedMigrations.includes(m.timestamp)
  );
  
  if (pendingMigrations.length === 0) {
    console.log("\n🎉 All migrations are up to date!");
    return;
  }
  
  console.log(`\n4️⃣  Pending migrations: ${pendingMigrations.length}`);
  pendingMigrations.forEach(m => {
    console.log(`   ⏳ ${m.filename} - ${m.description}`);
  });

  // Step 5: Generate combined SQL
  console.log("\n5️⃣  Generating migration SQL...");
  const migrationSQL = generateMigrationSQL(pendingMigrations);
  
  // Save to file
  const outputFile = `./migrations_to_apply_${Date.now()}.sql`;
  await Deno.writeTextFile(outputFile, migrationSQL);
  
  console.log(`✅ Migration SQL saved to: ${outputFile}`);
  
  console.log(`
🎯 Next Steps:
==============

1. Open your Supabase dashboard: 
   https://app.supabase.com/project/${Deno.env.get('SUPABASE_PROJECT_REF')}/sql

2. Copy the contents of: ${outputFile}

3. Paste and execute in the SQL Editor

4. The script will apply all pending migrations and track them

📋 Migration Summary:
${pendingMigrations.map(m => `   • ${m.description}`).join('\n')}

⚠️  Always backup your database before applying migrations!
`);
}

if (import.meta.main) {
  main();
}
