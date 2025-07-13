#!/usr/bin/env -S deno run --allow-read --allow-write

import { emptyDir } from "https://deno.land/x/dnt@0.40.0/mod.ts";

console.log("Cleaning dist directory...");
await emptyDir("./dist");
console.log("✅ Clean completed");
