#!/usr/bin/env -S deno run --allow-run

/**
 * Check if Deno is properly installed and working
 */

async function checkDeno() {
  console.log("🦕 Checking Deno installation...\n");
  
  try {
    const process = new Deno.Command("deno", {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    });
    
    const { code, stdout, stderr } = await process.output();
    
    if (code === 0) {
      const version = new TextDecoder().decode(stdout);
      console.log("✅ Deno is installed!");
      console.log(version);
      
      console.log("\n🚀 Ready to run Deno tasks:");
      console.log("  deno task dev     # Start development servers");
      console.log("  deno task build   # Build all packages");
      console.log("  deno task test    # Run tests");
      console.log("  deno task lint    # Lint code");
      console.log("  deno task format  # Format code");
      
    } else {
      const error = new TextDecoder().decode(stderr);
      console.log("❌ Deno is not installed or not in PATH");
      console.log("Error:", error);
      console.log("\n📦 Install Deno:");
      console.log("  curl -fsSL https://deno.land/x/install/install.sh | sh");
      console.log("  # or");
      console.log("  brew install deno");
    }
  } catch (error) {
    console.log("❌ Deno is not installed");
    console.log("\n📦 Install Deno:");
    console.log("  curl -fsSL https://deno.land/x/install/install.sh | sh");
    console.log("  # or"); 
    console.log("  brew install deno");
  }
}

if (import.meta.main) {
  await checkDeno();
}
