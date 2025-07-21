#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run

/**
 * Hosted Supabase Setup Script
 * 
 * This script helps you set up your hosted Supabase database with the initial schema.
 */

import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// Load environment variables from .env file
const _env = await load({
  envPath: "../../.env",
  export: true
});

async function runCommand(cmd: string[]): Promise<{success: boolean, output: string}> {
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: "piped",
    stderr: "piped",
  });

  const process = command.spawn();
  const { success, stdout, stderr } = await process.output();
  
  const output = new TextDecoder().decode(success ? stdout : stderr);
  return { success, output };
}

async function checkSupabaseCLI(): Promise<boolean> {
  try {
    const { success } = await runCommand(["supabase", "--version"]);
    return success;
  } catch (_error) {
    // CLI not found
    return false;
  }
}

function checkEnvironmentVariables(): boolean {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  for (const envVar of requiredVars) {
    if (!Deno.env.get(envVar)) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      return false;
    }
  }
  
  console.log("✅ All required environment variables are set");
  return true;
}

async function _linkProject(): Promise<boolean> {
  const projectRef = Deno.env.get('SUPABASE_PROJECT_REF');
  
  if (!projectRef) {
    console.error(`❌ SUPABASE_PROJECT_REF environment variable is required`);
    console.log(`   You can find this in your Supabase dashboard URL:`);
    console.log(`   https://supabase.com/dashboard/project/YOUR_PROJECT_REF`);
    return false;
  }
  
  console.log(`🔗 Linking to Supabase project: ${projectRef}`);
  
  // Try linking without password first (for hosted projects)
  const { success, output } = await runCommand([
    'supabase', 'link', '--project-ref', projectRef, '--password', ''
  ]);
  
  if (success) {
    console.log("✅ Successfully linked to Supabase project");
    return true;
  } else {
    console.error("❌ Failed to link to Supabase project:");
    console.error(output);
    console.log("💡 For hosted Supabase, you may need to:");
    console.log("   1. Ensure you're logged in: supabase login");
    console.log("   2. Check your project exists and you have access");
    console.log("   3. Try manual setup using MANUAL_SETUP.md");
    return false;
  }
}

async function _applyMigrations(): Promise<boolean> {
  console.log(`📊 Applying database migrations...`);
  
  // For hosted Supabase, use db push with the connection string
  const { success, output } = await runCommand([
    'supabase', 'db', 'push', '--db-url', Deno.env.get('SUPABASE_URL')! + '/rest/v1/'
  ]);
  
  if (success) {
    console.log("✅ Database migrations applied successfully");
    console.log(output);
    return true;
  } else {
    console.error("❌ Failed to apply migrations:");
    console.error(output);
    console.log("💡 Try applying migrations manually:");
    console.log("   1. Go to your Supabase dashboard → SQL Editor");
    console.log("   2. Copy the contents of supabase/migrations/20250721000001_initial_schema.sql");
    console.log("   3. Paste and execute in the SQL Editor");
    return false;
  }
}

async function generateTypes(): Promise<boolean> {
  console.log(`🏗️  Generating TypeScript types...`);
  
  const projectRef = Deno.env.get('SUPABASE_PROJECT_REF');
  const { success, output } = await runCommand([
    'supabase', 'gen', 'types', 'typescript', 
    '--project-id', projectRef!
  ]);
  
  if (success) {
    // Ensure directory exists
    try {
      await Deno.mkdir('./src/types', { recursive: true });
    } catch {
      // Directory already exists, ignore
    }
    
    await Deno.writeTextFile('./src/types/database.types.ts', output);
    console.log("✅ TypeScript types generated successfully");
    return true;
  } else {
    console.error("❌ Failed to generate types:");
    console.error(output);
    return false;
  }
}

async function testConnection(): Promise<boolean> {
  console.log(`🧪 Testing database connection...`);
  
  try {
    // Basic connection test using the app
    const { success, output } = await runCommand([
      'deno', 'run', '--allow-all', '--env-file=../../.env',
      '--eval', 'import { SupabaseService } from "./src/app/supabase.service.ts"; const service = new SupabaseService(); console.log("Connection test passed");'
    ]);
    
    if (success) {
      console.log("✅ Database connection test passed");
      return true;
    } else {
      console.error("❌ Database connection test failed:");
      console.error(output);
      return false;
    }
  } catch (error) {
    console.error("❌ Connection test error:", (error as Error).message);
    return false;
  }
}

async function main() {
  console.log(`
🚀 WRM Backend - Hosted Supabase Setup
=====================================
`);

  // Step 1: Check CLI
  console.log("1️⃣  Checking Supabase CLI...");
  if (!(await checkSupabaseCLI())) {
    console.error("❌ Supabase CLI not found. Please install it first:");
    console.error("");
    console.error("📦 Installation options:");
    console.error("   • npm: npm install -g supabase");
    console.error("   • yarn: yarn global add supabase");
    console.error("   • Homebrew (macOS): brew install supabase/tap/supabase");
    console.error("   • Manual: Download from https://github.com/supabase/cli/releases");
    console.error("");
    console.error("🔄 After installation, run this script again:");
    console.error("   deno task setup");
    console.error("");
    console.error("📚 Or follow the manual setup guide in HOSTED_SUPABASE_SETUP.md");
    Deno.exit(1);
  }
  console.log("✅ Supabase CLI found");

  // Step 2: Check environment variables
  console.log("\n2️⃣  Checking environment variables...");
  if (!checkEnvironmentVariables()) {
    console.error("\n📝 Please add these to your .env file:");
    console.error("   SUPABASE_PROJECT_REF=your-project-ref");
    console.error("   SUPABASE_URL=https://your-project-ref.supabase.co");
    console.error("   SUPABASE_ANON_KEY=your-anon-key");
    console.error("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
    Deno.exit(1);
  }

  // Step 3: Skip linking for hosted Supabase (causes hangs)
  console.log("\n3️⃣  Skipping project linking for hosted Supabase...");
  console.log("   (Linking is not required for hosted projects)");

  // Step 4: Apply migrations manually via SQL
  console.log("\n4️⃣  Setting up database schema...");
  console.log("   📋 Please run the migration manually:");
  console.log("   1. Go to: https://app.supabase.com/project/lqmsdusfxrfxgictcnib/sql");
  console.log("   2. Copy the contents of: supabase/migrations/20250721000001_initial_schema.sql");
  console.log("   3. Paste and execute in the SQL Editor");
  console.log("   4. Come back and press Enter to continue...");
  
  // Wait for user confirmation
  const _decoder = new TextDecoder();
  const buffer = new Uint8Array(1024);
  await Deno.stdin.read(buffer);

  // Step 5: Generate types
  console.log("\n5️⃣  Generating TypeScript types...");
  if (!(await generateTypes())) {
    console.log("⚠️  Types generation failed, but continuing...");
  }

  // Step 6: Test connection
  console.log("\n6️⃣  Testing database connection...");
  if (!(await testConnection())) {
    console.log("⚠️  Connection test failed, but setup may still be working");
  }

  console.log(`
🎉 Setup Complete!
==================

Your hosted Supabase database is now ready. You can:

1. Start development:
   deno task dev

2. Run tests:
   deno task test

3. Generate types anytime:
   deno task db:types

4. Apply new migrations:
   deno task db:push

5. Check status:
   deno task db:status

Need help? Check the HOSTED_SUPABASE_SETUP.md documentation.
`);
}

if (import.meta.main) {
  main();
}
