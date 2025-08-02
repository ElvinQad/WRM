#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env

// 🚀 **Comprehensive Auth Test Runner**
// Orchestrates all authentication system tests with reporting and analysis

import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  output: string;
  error?: string;
}

interface TestSuite {
  name: string;
  description: string;
  files: string[];
  category: 'unit' | 'integration' | 'e2e' | 'performance';
}

class AuthTestRunner {
  private results: TestResult[] = [];
  private startTime = 0;

  private testSuites: TestSuite[] = [
    {
      name: 'Backend Unit Tests',
      description: 'Core authentication logic and validation',
      files: ['auth/backend/auth-core.test.ts'],
      category: 'unit'
    },
    {
      name: 'Frontend Unit Tests', 
      description: 'Authentication components and state management',
      files: ['auth/frontend/auth-components.test.ts'],
      category: 'unit'
    },
    {
      name: 'Integration Tests',
      description: 'Full-stack authentication flow testing',
      files: ['integration/auth-integration.test.ts'],
      category: 'integration'
    },
    {
      name: 'End-to-End Tests',
      description: 'Complete user journey simulation',
      files: ['e2e/auth-user-journeys.test.ts'],
      category: 'e2e'
    },
    {
      name: 'Performance Tests',
      description: 'Authentication system performance analysis',
      files: ['performance/auth-performance.test.ts'],
      category: 'performance'
    }
  ];

  async runAllTests(options: {
    verbose?: boolean;
    category?: string;
    pattern?: string;
    parallel?: boolean;
  } = {}): Promise<void> {
    this.startTime = Date.now();
    
    console.log('🧪 **WRM Authentication System Test Suite**');
    console.log('=' .repeat(60));
    console.log(`📅 Started: ${new Date().toISOString()}`);
    console.log(`🎯 Running comprehensive auth system tests...\n`);

    // Filter test suites based on options
    let suitesToRun = this.testSuites;
    
    if (options.category && options.category !== 'all') {
      suitesToRun = suitesToRun.filter(suite => 
        suite.category === options.category
      );
    }

    if (options.pattern) {
      suitesToRun = suitesToRun.filter(suite =>
        suite.name.toLowerCase().includes(options.pattern.toLowerCase()) ||
        suite.description.toLowerCase().includes(options.pattern.toLowerCase())
      );
    }

    console.log(`📋 Found ${suitesToRun.length} test suite(s) to run:\n`);
    
    for (const suite of suitesToRun) {
      console.log(`   ${this.getCategoryIcon(suite.category)} ${suite.name}`);
      console.log(`     ${suite.description}`);
    }
    console.log('');

    // Run test suites
    if (options.parallel && suitesToRun.length > 1) {
      await this.runSuitesInParallel(suitesToRun, options);
    } else {
      await this.runSuitesSequentially(suitesToRun, options);
    }

    // Generate final report
    this.generateReport();
  }

  private async runSuitesSequentially(
    suites: TestSuite[], 
    options: { verbose?: boolean }
  ): Promise<void> {
    for (const suite of suites) {
      await this.runTestSuite(suite, options);
    }
  }

  private async runSuitesInParallel(
    suites: TestSuite[],
    options: { verbose?: boolean }
  ): Promise<void> {
    console.log('🔄 Running test suites in parallel...\n');
    
    const promises = suites.map(suite => this.runTestSuite(suite, options));
    await Promise.all(promises);
  }

  private async runTestSuite(
    suite: TestSuite,
    options: { verbose?: boolean }
  ): Promise<void> {
    console.log(`${this.getCategoryIcon(suite.category)} **${suite.name}**`);
    console.log(`   ${suite.description}`);
    console.log('-'.repeat(50));

    for (const file of suite.files) {
      await this.runTestFile(file, options);
    }

    console.log('');
  }

  private async runTestFile(
    file: string,
    options: { verbose?: boolean }
  ): Promise<void> {
    const filePath = join(Deno.cwd(), file);
    const testName = file.replace('.test.ts', '').replace(/\//g, ' → ');
    
    console.log(`   🧪 Running: ${testName}`);
    
    const startTime = performance.now();
    
    try {
      // Check if file exists
      try {
        await Deno.stat(filePath);
      } catch {
        throw new Error(`Test file not found: ${filePath}`);
      }

      // Run the test file
      const args = [
        'test',
        '--allow-all',
        '--quiet',
        filePath
      ];
      
      // Add --no-check if it was passed to the runner
      if (Deno.args.includes('--no-check')) {
        args.push('--no-check');
      }

      const process = new Deno.Command('deno', {
        args,
        stdout: 'piped',
        stderr: 'piped'
      });

      const { code, stdout, stderr } = await process.output();
      const output = new TextDecoder().decode(stdout);
      const error = new TextDecoder().decode(stderr);

      const duration = performance.now() - startTime;

      if (code === 0) {
        this.results.push({
          name: testName,
          status: 'passed',
          duration,
          output
        });
        console.log(`      ✅ PASSED (${duration.toFixed(0)}ms)`);
        
        if (options.verbose && output) {
          console.log(`         Output: ${output.substring(0, 100)}...`);
        }
      } else {
        this.results.push({
          name: testName,
          status: 'failed',
          duration,
          output,
          error
        });
        console.log(`      ❌ FAILED (${duration.toFixed(0)}ms)`);
        console.log(`         Error: ${error || 'Unknown error'}`);
      }

    } catch (err) {
      const duration = performance.now() - startTime;
      this.results.push({
        name: testName,
        status: 'failed',
        duration,
        output: '',
        error: err.message
      });
      console.log(`      ❌ ERROR: ${err.message}`);
    }
  }

  private getCategoryIcon(category: string): string {
    const icons = {
      'unit': '🔬',
      'integration': '🔗',
      'e2e': '🎭',
      'performance': '⚡'
    };
    return icons[category as keyof typeof icons] || '🧪';
  }

  private generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 **TEST EXECUTION SUMMARY**');
    console.log('='.repeat(60));
    
    console.log(`\n🎯 **Overall Results:**`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`   ⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

    if (failed > 0) {
      console.log(`\n❌ **Failed Tests:**`);
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`   • ${result.name}`);
          if (result.error) {
            console.log(`     Error: ${result.error}`);
          }
        });
    }

    console.log(`\n⚡ **Performance Summary:**`);
    if (this.results.length > 0) {
      const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;
      const slowestTest = this.results.reduce((slowest, current) => 
        current.duration > slowest.duration ? current : slowest
      );
      
      console.log(`   Average Test Duration: ${avgDuration.toFixed(0)}ms`);
      console.log(`   Slowest Test: ${slowestTest.name} (${slowestTest.duration.toFixed(0)}ms)`);
    } else {
      console.log(`   No tests were executed`);
    }

    console.log(`\n🎉 **Test Categories Coverage:**`);
    const categories = ['unit', 'integration', 'e2e', 'performance'];
    categories.forEach(category => {
      const categoryTests = this.results.filter(r => 
        r.name.toLowerCase().includes(category) || 
        r.name.toLowerCase().includes(this.getCategoryName(category))
      );
      const categoryPassed = categoryTests.filter(r => r.status === 'passed').length;
      console.log(`   ${this.getCategoryIcon(category)} ${this.getCategoryName(category)}: ${categoryPassed}/${categoryTests.length} passed`);
    });

    console.log(`\n📋 **Recommendations:**`);
    
    if (failed === 0) {
      console.log(`   ✅ All tests passing! Your auth system is solid.`);
    if (total > 0) {
      console.log(`   🚀 Consider adding more edge case tests.`);
      console.log(`   📊 Monitor performance in production environment.`);
    } else {
      console.log(`   🔧 Fix failing tests before deployment.`);
      console.log(`   🔍 Review error messages and stack traces.`);
      console.log(`   📝 Update tests if business logic has changed.`);
    }

    console.log(`\n📅 Completed: ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    // Exit with appropriate code
    if (failed > 0) {
      console.log(`\n❌ Tests failed. Exiting with code 1.`);
      Deno.exit(1);
    } else {
      console.log(`\n✅ All tests passed. Exiting with code 0.`);
    }
  }

  private getCategoryName(category: string): string {
    const names = {
      'unit': 'Unit Tests',
      'integration': 'Integration Tests', 
      'e2e': 'E2E Tests',
      'performance': 'Performance Tests'
    };
    return names[category as keyof typeof names] || category;
  }
}

// 🚀 **CLI Interface**

async function main() {
  const args = Deno.args;
  const runner = new AuthTestRunner();

  // Parse command line arguments
  const options: {
    verbose?: boolean;
    category?: string;
    pattern?: string;
    parallel?: boolean;
    help?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      
      case '--category':
      case '-c':
        options.category = args[++i];
        break;
      
      case '--pattern':
      case '-p':
        options.pattern = args[++i];
        break;
      
      case '--parallel':
        options.parallel = true;
        break;
      
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  if (options.help) {
    console.log('🧪 **Auth Test Runner - Help**');
    console.log('Usage: deno run --allow-all run-tests.ts [options]');
    console.log('');
    console.log('Options:');
    console.log('  -v, --verbose      Show detailed test output');
    console.log('  -c, --category     Run tests of specific category (unit|integration|e2e|performance)');
    console.log('  -p, --pattern      Run tests matching pattern');
    console.log('  --parallel         Run test suites in parallel');
    console.log('  -h, --help         Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  deno run --allow-all run-tests.ts');
    console.log('  deno run --allow-all run-tests.ts --category unit');
    console.log('  deno run --allow-all run-tests.ts --pattern backend');
    console.log('  deno run --allow-all run-tests.ts --parallel --verbose');
    return;
  }

  await runner.runAllTests(options);
}

if (import.meta.main) {
  main().catch(console.error);
}
