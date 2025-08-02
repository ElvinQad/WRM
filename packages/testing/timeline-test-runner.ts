#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env

// 🧪 **Timeline Drag & Drop Test Runner**
// Executes frontend timeline drag and drop tests using Vitest

import { join, resolve } from "https://deno.land/std@0.208.0/path/mod.ts";

interface TimelineTestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  output: string;
  error?: string;
}

interface TimelineTestSuite {
  name: string;
  description: string;
  testType: 'drag-drop' | 'resize' | 'integration' | 'performance';
  command: string;
}

class TimelineTestRunner {
  private projectRoot: string;
  private frontendPath: string;
  private testResults: TimelineTestResult[] = [];

  constructor() {
    this.projectRoot = resolve(import.meta.url.replace('file://', ''), '../../../..');
    this.frontendPath = join(this.projectRoot, 'packages/frontend');
  }

  private async runCommand(command: string, cwd: string): Promise<{ success: boolean; output: string; duration: number }> {
    const startTime = Date.now();
    
    try {
      console.log(`🔥 Running: ${command}`);
      console.log(`📁 Working Directory: ${cwd}`);
      
      const process = new Deno.Command("sh", {
        args: ["-c", command],
        cwd,
        stdout: "piped",
        stderr: "piped",
      });

      const { code, stdout, stderr } = await process.output();
      const output = new TextDecoder().decode(stdout);
      const error = new TextDecoder().decode(stderr);
      const duration = Date.now() - startTime;

      return {
        success: code === 0,
        output: output + (error ? `\nSTDERR: ${error}` : ''),
        duration
      };
    } catch (error) {
      return {
        success: false,
        output: `Command execution failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime
      };
    }
  }

  private getTimelineTestSuites(): TimelineTestSuite[] {
    return [
      {
        name: "Timeline Drag & Drop",
        description: "Tests drag and drop functionality for timeline tickets",
        testType: "drag-drop",
        command: "deno run -A npm:vitest run src/components/timeline/hooks/useTimelineDrag.test.ts --reporter=verbose"
      },
      {
        name: "Timeline Resize",
        description: "Tests ticket resizing functionality on timeline",
        testType: "resize", 
        command: "deno run -A npm:vitest run src/components/timeline/hooks/useTimelineDrag.test.ts --reporter=verbose --grep 'resize'"
      },
      {
        name: "Timeline Wheel Navigation",
        description: "Tests wheel navigation and zoom functionality",
        testType: "integration",
        command: "deno run -A npm:vitest run src/components/timeline/hooks/useTimeline.wheel.test.ts --reporter=verbose"
      },
      {
        name: "Timeline Header Components",
        description: "Tests timeline header components and controls",
        testType: "integration",
        command: "deno run -A npm:vitest run src/components/timeline/components/TimelineHeader.test.tsx --reporter=verbose"
      },
      {
        name: "Timeline State Management",
        description: "Tests timeline Redux slice and state management",
        testType: "integration",
        command: "deno run -A npm:vitest run src/store/slices/timelineSlice.test.ts --reporter=verbose"
      },
      {
        name: "All Timeline Tests",
        description: "Runs all timeline-related tests",
        testType: "integration",
        command: "deno run -A npm:vitest run src/components/timeline/ src/store/slices/timelineSlice.test.ts --reporter=verbose"
      }
    ];
  }

  private async installDependencies(): Promise<boolean> {
    console.log("📦 Installing frontend dependencies...");
    
    const result = await this.runCommand("deno install", this.frontendPath);
    
    if (!result.success) {
      console.error("❌ Failed to install dependencies:");
      console.error(result.output);
      return false;
    }
    
    console.log("✅ Dependencies installed successfully");
    return true;
  }

  private async runTestSuite(suite: TimelineTestSuite): Promise<TimelineTestResult> {
    console.log(`\n🧪 Running: ${suite.name}`);
    console.log(`📝 Description: ${suite.description}`);
    
    const result = await this.runCommand(suite.command, this.frontendPath);
    
    const testResult: TimelineTestResult = {
      name: suite.name,
      status: result.success ? 'passed' : 'failed',
      duration: result.duration,
      output: result.output,
      error: result.success ? undefined : result.output
    };

    this.testResults.push(testResult);
    
    if (result.success) {
      console.log(`✅ ${suite.name} passed in ${result.duration}ms`);
    } else {
      console.log(`❌ ${suite.name} failed in ${result.duration}ms`);
      console.log(`Error output: ${result.output}`);
    }
    
    return testResult;
  }

  private printSummary(): void {
    console.log("\n" + "=".repeat(80));
    console.log("🏁 TIMELINE TEST SUMMARY");
    console.log("=".repeat(80));
    
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const total = this.testResults.length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    
    if (failed > 0) {
      console.log("\n💥 FAILED TESTS:");
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`  • ${r.name} (${r.duration}ms)`);
        });
    }
    
    console.log("\n🎯 TIMELINE TESTING COMPLETE");
    console.log("=".repeat(80));
  }

  async runAll(): Promise<boolean> {
    console.log("🚀 Starting Timeline Test Suite");
    console.log("=".repeat(50));
    
    // Install dependencies first
    const depsInstalled = await this.installDependencies();
    if (!depsInstalled) {
      return false;
    }
    
    const testSuites = this.getTimelineTestSuites();
    
    // Run each test suite
    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }
    
    this.printSummary();
    
    const allPassed = this.testResults.every(r => r.status === 'passed');
    return allPassed;
  }

  async runSpecific(testType: string): Promise<boolean> {
    console.log(`🎯 Running specific timeline tests: ${testType}`);
    
    const depsInstalled = await this.installDependencies();
    if (!depsInstalled) {
      return false;
    }
    
    const testSuites = this.getTimelineTestSuites().filter(suite => 
      suite.testType === testType || suite.name.toLowerCase().includes(testType.toLowerCase())
    );
    
    if (testSuites.length === 0) {
      console.log(`❌ No tests found for type: ${testType}`);
      console.log("Available test types: drag-drop, resize, integration, performance");
      return false;
    }
    
    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }
    
    this.printSummary();
    
    const allPassed = this.testResults.every(r => r.status === 'passed');
    return allPassed;
  }
}

// Main execution
if (import.meta.main) {
  const runner = new TimelineTestRunner();
  const args = Deno.args;
  
  let success = false;
  
  if (args.length === 0) {
    // Run all timeline tests
    success = await runner.runAll();
  } else if (args[0] === '--type' && args[1]) {
    // Run specific test type
    success = await runner.runSpecific(args[1]);
  } else if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
🧪 Timeline Test Runner

Usage:
  deno run --allow-all timeline-test-runner.ts                    # Run all timeline tests
  deno run --allow-all timeline-test-runner.ts --type drag-drop   # Run drag & drop tests
  deno run --allow-all timeline-test-runner.ts --type resize      # Run resize tests
  deno run --allow-all timeline-test-runner.ts --type integration # Run integration tests
  deno run --allow-all timeline-test-runner.ts --help             # Show this help

Available test types:
  • drag-drop     - Timeline ticket drag and drop functionality
  • resize        - Timeline ticket resizing functionality  
  • integration   - Timeline component integration tests
  • performance   - Timeline performance tests
`);
    Deno.exit(0);
  } else {
    console.log("❌ Invalid arguments. Use --help for usage information.");
    Deno.exit(1);
  }
  
  Deno.exit(success ? 0 : 1);
}
