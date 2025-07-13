#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

import { build, emptyDir } from "https://deno.land/x/dnt@0.40.0/mod.ts";

await emptyDir("./dist");

await build({
  entryPoints: ["./src/index.ts"],
  outDir: "./dist",
  shims: {
    deno: false,
  },
  package: {
    name: "@wrm/types",
    version: "0.0.1",
    description: "Shared types for WRM workspace",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/your-org/wrm.git",
    },
    bugs: {
      url: "https://github.com/your-org/wrm/issues",
    },
  },
  postBuild() {
    // Copy additional files
    Deno.copyFileSync("README.md", "dist/README.md");
  },
});
