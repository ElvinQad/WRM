#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run

/**
 * Database Migration Manager for WRM Backend
 * 
 * This script helps manage database migrations using Supabase CLI.
 * It can create new migrations, apply migrations, and reset the database.
 */

import { parseArgs } from "https://deno.land/std@0.224.0/cli/parse_args.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/exists.ts";

const MIGRATIONS_DIR = "./supabase/migrations";

async function runCommand(cmd: string[], cwd?: string): Promise<{success: boolean, output: string}> {
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    stdout: "piped",
    stderr: "piped",
  });

  const process = command.spawn();
  const { success, stdout, stderr } = await process.output();
  
  const output = new TextDecoder().decode(success ? stdout : stderr);
  return { success, output };
}

async function checkSupabaseCLI(): Promise<boolean> {
  const { success } = await runCommand(["supabase", "--version"]);
  return success;
}

async function createMigration(name: string): Promise<void> {
  console.log(`Creating migration: ${name}`);
  
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
  const filepath = `${MIGRATIONS_DIR}/${filename}`;
  
  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Don't forget to add indexes and RLS policies if needed
`;

  await Deno.writeTextFile(filepath, template);
  console.log(`✅ Created migration file: ${filepath}`);
}

async function applyMigrations(): Promise<void> {
  console.log("Applying migrations...");
  
  const { success, output } = await runCommand(["supabase", "db", "push"]);
  
  if (success) {
    console.log("✅ Migrations applied successfully");
    console.log(output);
  } else {
    console.error("❌ Failed to apply migrations:");
    console.error(output);
    Deno.exit(1);
  }
}

async function resetDatabase(): Promise<void> {
  console.log("⚠️  Resetting database (this will destroy all data)...");
  
  const confirm = prompt("Are you sure? Type 'yes' to confirm: ");
  if (confirm !== "yes") {
    console.log("Cancelled.");
    return;
  }
  
  const { success, output } = await runCommand(["supabase", "db", "reset"]);
  
  if (success) {
    console.log("✅ Database reset successfully");
    console.log(output);
  } else {
    console.error("❌ Failed to reset database:");
    console.error(output);
    Deno.exit(1);
  }
}

async function startLocal(): Promise<void> {
  console.log("Starting local Supabase instance...");
  
  const { success, output } = await runCommand(["supabase", "start"]);
  
  if (success) {
    console.log("✅ Local Supabase started successfully");
    console.log(output);
  } else {
    console.error("❌ Failed to start local Supabase:");
    console.error(output);
    Deno.exit(1);
  }
}

async function stopLocal(): Promise<void> {
  console.log("Stopping local Supabase instance...");
  
  const { success, output } = await runCommand(["supabase", "stop"]);
  
  if (success) {
    console.log("✅ Local Supabase stopped successfully");
    console.log(output);
  } else {
    console.error("❌ Failed to stop local Supabase:");
    console.error(output);
    Deno.exit(1);
  }
}

async function generateTypes(): Promise<void> {
  console.log("Generating TypeScript types from database schema...");
  
  const { success, output } = await runCommand([
    "supabase", "gen", "types", "typescript", "--local"
  ]);
  
  if (success) {
    await Deno.writeTextFile("./src/types/database.types.ts", output);
    console.log("✅ Database types generated successfully");
  } else {
    console.error("❌ Failed to generate types:");
    console.error(output);
    Deno.exit(1);
  }
}

async function seedDatabase(): Promise<void> {
  console.log("Seeding database with initial data...");
  
  if (!(await exists("./supabase/seed.sql"))) {
    console.log("No seed file found, skipping...");
    return;
  }
  
  const { success, output } = await runCommand([
    "supabase", "db", "seed"
  ]);
  
  if (success) {
    console.log("✅ Database seeded successfully");
    console.log(output);
  } else {
    console.error("❌ Failed to seed database:");
    console.error(output);
    Deno.exit(1);
  }
}

async function main() {
  const args = parseArgs(Deno.args, {
    string: ["name"],
    boolean: ["help", "reset", "start", "stop", "types", "seed"],
    alias: {
      h: "help",
      n: "name",
      r: "reset",
      s: "start",
      t: "types"
    }
  });

  if (args.help) {
    console.log(`
WRM Database Migration Manager

Usage: deno run --allow-read --allow-write --allow-env --allow-net --allow-run migrate.ts [command] [options]

Commands:
  create --name <name>    Create a new migration file
  apply                   Apply all pending migrations
  --reset                 Reset database (destroys all data)
  --start                 Start local Supabase instance
  --stop                  Stop local Supabase instance
  --types                 Generate TypeScript types from schema
  --seed                  Seed database with initial data

Examples:
  deno run --allow-read --allow-write --allow-env --allow-net --allow-run migrate.ts create --name "add_user_preferences"
  deno run --allow-read --allow-write --allow-env --allow-net --allow-run migrate.ts apply
  deno run --allow-read --allow-write --allow-env --allow-net --allow-run migrate.ts --reset
  deno run --allow-read --allow-write --allow-env --allow-net --allow-run migrate.ts --start
  deno run --allow-read --allow-write --allow-env --allow-net --allow-run migrate.ts --types
`);
    return;
  }

  // Check if Supabase CLI is installed
  if (!(await checkSupabaseCLI())) {
    console.error("❌ Supabase CLI not found. Please install it first:");
    console.error("npm install -g supabase");
    Deno.exit(1);
  }

  const command = args._[0] as string;

  try {
    switch (command) {
      case "create":
        if (!args.name) {
          console.error("❌ Migration name is required. Use --name option.");
          Deno.exit(1);
        }
        await createMigration(args.name);
        break;
        
      case "apply":
        await applyMigrations();
        break;
        
      default:
        if (args.reset) {
          await resetDatabase();
        } else if (args.start) {
          await startLocal();
        } else if (args.stop) {
          await stopLocal();
        } else if (args.types) {
          await generateTypes();
        } else if (args.seed) {
          await seedDatabase();
        } else {
          console.error("❌ Unknown command. Use --help for usage information.");
          Deno.exit(1);
        }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ An error occurred:", error.message);
    } else {
      console.error("❌ An unknown error occurred:", error);
    }
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
