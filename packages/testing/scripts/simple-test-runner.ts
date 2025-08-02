#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env

// 🧪 Simple Auth Test Runner
// Quick runner for all auth tests

console.log('🧪 **WRM Authentication System Test Suite**');
console.log('=' .repeat(60));
console.log(`📅 Started: ${new Date().toISOString()}`);
console.log(`🎯 Running all auth system tests...\n`);

const tests = [
  {
    name: 'Backend Auth Core Tests',
    file: 'auth/backend/auth-core.test.ts',
    icon: '🔧'
  },
  {
    name: 'Frontend Auth Component Tests', 
    file: 'auth/frontend/auth-components.test.ts',
    icon: '⚛️'
  },
  {
    name: 'Auth Integration Tests',
    file: 'integration/auth-integration.test.ts',
    icon: '🔗'
  },
  {
    name: 'E2E Auth User Journey Tests',
    file: 'e2e/auth-user-journeys.test.ts',
    icon: '🎭'
  },
  {
    name: 'Auth Performance Tests',
    file: 'performance/auth-performance.test.ts',
    icon: '⚡'
  }
];

let totalPassed = 0;
let totalFailed = 0;
let totalTime = 0;

for (const test of tests) {
  console.log(`\n${test.icon} Running: ${test.name}`);
  console.log(`   File: ${test.file}`);
  
  const startTime = Date.now();
  
  try {
    const cmd = new Deno.Command('deno', {
      args: ['test', '--allow-all', test.file],
      cwd: '/home/elvin/Desktop/Dev/WRM/packages/testing',
      stdout: 'piped',
      stderr: 'piped'
    });
    
    const result = await cmd.output();
    const duration = Date.now() - startTime;
    totalTime += duration;
    
    const output = new TextDecoder().decode(result.stdout);
    const error = new TextDecoder().decode(result.stderr);
    
    if (result.code === 0) {
      // Extract passed count from output
      const passedMatch = output.match(/(\d+) passed/);
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      totalPassed += passed;
      
      console.log(`   ✅ ${passed} tests passed (${duration}ms)`);
    } else {
      totalFailed++;
      console.log(`   ❌ Tests failed (${duration}ms)`);
      if (error) {
        console.log(`   Error: ${error.split('\n')[0]}`);
      }
    }
  } catch (err) {
    totalFailed++;
    console.log(`   ❌ Error running test: ${err.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 **TEST EXECUTION SUMMARY**');
console.log('='.repeat(60));
console.log(`\n🎯 **Overall Results:**`);
console.log(`   Total Tests: ${totalPassed + totalFailed}`);
console.log(`   ✅ Passed: ${totalPassed}`);
console.log(`   ❌ Failed: ${totalFailed}`);
console.log(`   📈 Success Rate: ${totalPassed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) : 0}%`);
console.log(`   ⏱️  Total Duration: ${(totalTime / 1000).toFixed(2)}s`);

if (totalFailed === 0) {
  console.log(`\n✅ All auth tests passed successfully!`);
  console.log(`🚀 Authentication system is working correctly`);
} else {
  console.log(`\n❌ Some tests failed`);
  console.log(`🔧 Review failed tests and fix issues`);
}

console.log(`\n📅 Completed: ${new Date().toISOString()}`);
console.log('='.repeat(60));
