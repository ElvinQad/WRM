#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Migration script to convert from pnpm to Deno
 * This script will:
 * 1. Remove old package.json files
 * 2. Update import statements to use .ts extensions
 * 3. Update import paths to use Deno-style imports
 */

import { walk } from "https://deno.land/std@0.211.0/fs/walk.ts";

console.log("🚀 Starting migration from pnpm to Deno...");

// Function to update import statements in TypeScript files
async function updateImports(filePath: string) {
  const content = await Deno.readTextFile(filePath);
  let updatedContent = content;

  // Update local imports to include .ts extension
  updatedContent = updatedContent.replace(
    /from\s+['"]([^'"]*?)(?<!\.ts)['"];?/g,
    (match, importPath) => {
      // Skip external imports and already-correct imports
      if (importPath.startsWith("npm:") || 
          importPath.startsWith("https://") ||
          importPath.startsWith("@") ||
          importPath.includes("node_modules") ||
          importPath.endsWith(".ts") ||
          importPath.endsWith(".tsx") ||
          importPath.endsWith(".js") ||
          importPath.endsWith(".jsx")) {
        return match;
      }
      
      // Add .ts extension to relative imports
      if (importPath.startsWith("./") || importPath.startsWith("../")) {
        return match.replace(importPath, importPath + ".ts");
      }
      
      return match;
    }
  );

  // Update @wrm/types imports to relative paths
  updatedContent = updatedContent.replace(
    /from\s+['"]@wrm\/types['"];?/g,
    'from "@wrm/types";'
  );

  if (content !== updatedContent) {
    await Deno.writeTextFile(filePath, updatedContent);
    console.log(`✅ Updated imports in ${filePath}`);
  }
}

// Update all TypeScript files in backend
console.log("📁 Updating backend imports...");
for await (const entry of walk("packages/backend/src", { exts: [".ts"] })) {
  if (entry.isFile) {
    await updateImports(entry.path);
  }
}

// Update all TypeScript files in frontend
console.log("📁 Updating frontend imports...");
for await (const entry of walk("packages/frontend/src", { exts: [".ts", ".tsx"] })) {
  if (entry.isFile) {
    await updateImports(entry.path);
  }
}

// Update all TypeScript files in types
console.log("📁 Updating types imports...");
for await (const entry of walk("packages/types/src", { exts: [".ts"] })) {
  if (entry.isFile) {
    await updateImports(entry.path);
  }
}

console.log("🎉 Migration to Deno completed!");
console.log("\nNext steps:");
console.log("1. Remove old package.json files: rm package.json packages/*/package.json");
console.log("2. Remove node_modules: rm -rf node_modules packages/*/node_modules");
console.log("3. Remove lock files: rm pnpm-lock.yaml* bun.lock");
console.log("4. Install Deno: https://deno.land/manual/getting_started/installation");
console.log("5. Run: deno task dev");
