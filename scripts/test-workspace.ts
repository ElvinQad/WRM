#!/usr/bin/env -S deno run --allow-read

/**
 * Test the Deno workspace configuration
 */

import { exists } from "https://deno.land/std@0.211.0/fs/exists.ts";

async function testWorkspace() {
  console.log("🧪 Testing Deno workspace configuration...\n");
  
  const requiredFiles = [
    "deno.json",
    "packages/types/deno.json", 
    "packages/backend/deno.json",
    "packages/frontend/deno.json",
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const fileExists = await exists(file);
    if (fileExists) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Missing!`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log("\n🎉 All required Deno configuration files are present!");
    console.log("\nNext steps:");
    console.log("1. Install Deno: https://deno.land/manual/getting_started/installation");
    console.log("2. Run: deno task dev");
  } else {
    console.log("\n❌ Some configuration files are missing. Please check the setup.");
  }
}

if (import.meta.main) {
  await testWorkspace();
}
