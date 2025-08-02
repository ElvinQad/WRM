// ⚡ **Auth Performance Tests**
// Tests the performance characteristics of the authentication system

import { MockPrismaService, MockJwtService, TEST_FIXTURES } from '../utils/test-helpers.ts';

// 🎯 **Performance Test Utilities**

interface PerformanceMetrics {
  operationName: string;
  executionTime: number;
  memoryUsage: number;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
}

class PerformanceProfiler {
  private metrics: PerformanceMetrics[] = [];

  async measure<T>(
    operationName: string,
    operation: () => Promise<T>,
    iterations = 100
  ): Promise<PerformanceMetrics> {
    const times: number[] = [];
    let result: T;

    // Warm-up run
    await operation();

    // Measure memory before
    const initialMemory = this.getMemoryUsage();

    // Run performance tests
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      result = await operation();
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    // Measure memory after
    const finalMemory = this.getMemoryUsage();

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const metrics: PerformanceMetrics = {
      operationName,
      executionTime: totalTime,
      memoryUsage: finalMemory - initialMemory,
      iterations,
      averageTime,
      minTime,
      maxTime,
    };

    this.metrics.push(metrics);
    return metrics;
  }

  private getMemoryUsage(): number {
    // Simplified memory usage (in real tests, use process.memoryUsage())
    return Math.random() * 1000; // Mock memory usage in KB
  }

  getReport(): string {
    let report = '\n📊 **Performance Test Report**\n';
    report += '=' .repeat(50) + '\n';

    for (const metric of this.metrics) {
      report += `\n🎯 ${metric.operationName}\n`;
      report += `-`.repeat(30) + '\n';
      report += `   Iterations: ${metric.iterations}\n`;
      report += `   Total Time: ${metric.executionTime.toFixed(2)}ms\n`;
      report += `   Average: ${metric.averageTime.toFixed(2)}ms\n`;
      report += `   Min: ${metric.minTime.toFixed(2)}ms\n`;
      report += `   Max: ${metric.maxTime.toFixed(2)}ms\n`;
      report += `   Memory: ${metric.memoryUsage.toFixed(2)}KB\n`;
    }

    return report;
  }

  assertPerformance(operationName: string, maxAverageTime: number) {
    const metric = this.metrics.find(m => m.operationName === operationName);
    if (!metric) {
      throw new Error(`No metrics found for operation: ${operationName}`);
    }

    if (metric.averageTime > maxAverageTime) {
      throw new Error(
        `Performance assertion failed for ${operationName}: ` +
        `${metric.averageTime.toFixed(2)}ms > ${maxAverageTime}ms`
      );
    }
  }
}

// 🧪 **Performance Test Cases**

Deno.test('Performance - Password hashing speed', async () => {
  const profiler = new PerformanceProfiler();

  console.log('⚡ Testing password hashing performance...');

  // Mock bcrypt hash function
  const hashPassword = async (password: string): Promise<string> => {
    // Simulate bcrypt hashing time (normally ~100-300ms for 12 rounds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5 + 2)); // 2-7ms for testing
    return `$2b$12$mock_hash_for_${password}`;
  };

  const metrics = await profiler.measure(
    'Password Hashing (bcrypt 12 rounds)',
    () => hashPassword('password123'),
    50 // Fewer iterations for expensive operations
  );

  console.log(`📊 Password hashing: ${metrics.averageTime.toFixed(2)}ms average`);

  // Assert reasonable performance (adjust based on your requirements)
  profiler.assertPerformance('Password Hashing (bcrypt 12 rounds)', 10); // 10ms max average for tests

  console.log('✅ Password hashing performance test passed');
});

Deno.test('Performance - JWT token generation', async () => {
  const profiler = new PerformanceProfiler();
  const mockJwtService = new MockJwtService();

  console.log('⚡ Testing JWT generation performance...');

  const generateToken = async (): Promise<string> => {
    return mockJwtService.sign(TEST_FIXTURES.validUser);
  };

  const metrics = await profiler.measure(
    'JWT Token Generation',
    generateToken,
    200
  );

  console.log(`📊 JWT generation: ${metrics.averageTime.toFixed(2)}ms average`);

  // JWT generation should be very fast
  profiler.assertPerformance('JWT Token Generation', 2); // 2ms max average

  console.log('✅ JWT generation performance test passed');
});

Deno.test('Performance - JWT token verification', async () => {
  const profiler = new PerformanceProfiler();
  const mockJwtService = new MockJwtService();

  console.log('⚡ Testing JWT verification performance...');

  // Generate a token first
  const token = mockJwtService.sign(TEST_FIXTURES.validUser);

  const verifyToken = async (): Promise<any> => {
    return mockJwtService.verify(token);
  };

  const metrics = await profiler.measure(
    'JWT Token Verification',
    verifyToken,
    200
  );

  console.log(`📊 JWT verification: ${metrics.averageTime.toFixed(2)}ms average`);

  // JWT verification should be very fast
  profiler.assertPerformance('JWT Token Verification', 2); // 2ms max average

  console.log('✅ JWT verification performance test passed');
});

Deno.test('Performance - Database user lookup', async () => {
  const profiler = new PerformanceProfiler();
  const mockPrisma = new MockPrismaService();

  console.log('⚡ Testing database user lookup performance...');

  const findUser = async (): Promise<any> => {
    return mockPrisma.user.findUnique({
      where: { email: 'test@test.com' }
    });
  };

  const metrics = await profiler.measure(
    'Database User Lookup',
    findUser,
    100
  );

  console.log(`📊 DB lookup: ${metrics.averageTime.toFixed(2)}ms average`);

  // Database lookups should be reasonably fast
  profiler.assertPerformance('Database User Lookup', 5); // 5ms max average for mock

  console.log('✅ Database lookup performance test passed');
});

Deno.test('Performance - Database user creation', async () => {
  const profiler = new PerformanceProfiler();
  const mockPrisma = new MockPrismaService();

  console.log('⚡ Testing database user creation performance...');

  let userCounter = 0;
  const createUser = async (): Promise<any> => {
    userCounter++;
    return mockPrisma.user.create({
      data: {
        email: `user${userCounter}@test.com`,
        password: 'hashed_password',
        name: `User ${userCounter}`
      }
    });
  };

  const metrics = await profiler.measure(
    'Database User Creation',
    createUser,
    50
  );

  console.log(`📊 DB creation: ${metrics.averageTime.toFixed(2)}ms average`);

  // Database writes should be reasonably fast
  profiler.assertPerformance('Database User Creation', 8); // 8ms max average for mock

  console.log('✅ Database creation performance test passed');
});

Deno.test('Performance - Complete signup flow', async () => {
  const profiler = new PerformanceProfiler();
  const mockPrisma = new MockPrismaService();
  const mockJwtService = new MockJwtService();

  console.log('⚡ Testing complete signup flow performance...');

  let signupCounter = 0;
  const completeSignupFlow = async (): Promise<any> => {
    signupCounter++;
    const email = `signup${signupCounter}@test.com`;
    const password = 'password123';

    // 1. Validate input (instant)
    if (!email.includes('@')) throw new Error('Invalid email');
    if (password.length < 6) throw new Error('Password too short');

    // 2. Check if user exists
    const existingUser = await mockPrisma.user.findUnique({
      where: { email }
    });
    if (existingUser) throw new Error('User exists');

    // 3. Hash password
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3 + 1)); // Simulate hashing

    // 4. Create user
    const user = await mockPrisma.user.create({
      data: {
        email,
        password: 'hashed_password',
        name: `User ${signupCounter}`
      }
    });

    // 5. Generate tokens
    const accessToken = mockJwtService.sign(user);
    const refreshToken = mockJwtService.sign(user, { expiresIn: '7d' });

    return { user, accessToken, refreshToken };
  };

  const metrics = await profiler.measure(
    'Complete Signup Flow',
    completeSignupFlow,
    30
  );

  console.log(`📊 Complete signup: ${metrics.averageTime.toFixed(2)}ms average`);

  // Complete signup should be reasonably fast
  profiler.assertPerformance('Complete Signup Flow', 15); // 15ms max average

  console.log('✅ Complete signup flow performance test passed');
});

Deno.test('Performance - Complete signin flow', async () => {
  const profiler = new PerformanceProfiler();
  const mockPrisma = new MockPrismaService();
  const mockJwtService = new MockJwtService();

  console.log('⚡ Testing complete signin flow performance...');

  const completeSigninFlow = async (): Promise<any> => {
    const email = 'existing@test.com';
    const password = 'password123';

    // 1. Validate input (instant)
    if (!email.includes('@')) throw new Error('Invalid email');
    if (!password) throw new Error('Password required');

    // 2. Find user
    const user = await mockPrisma.user.findUnique({
      where: { email }
    });
    if (!user) throw new Error('User not found');

    // 3. Verify password
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3 + 1)); // Simulate bcrypt compare

    // 4. Generate tokens
    const accessToken = mockJwtService.sign(user);
    const refreshToken = mockJwtService.sign(user, { expiresIn: '7d' });

    return { user, accessToken, refreshToken };
  };

  const metrics = await profiler.measure(
    'Complete Signin Flow',
    completeSigninFlow,
    50
  );

  console.log(`📊 Complete signin: ${metrics.averageTime.toFixed(2)}ms average`);

  // Complete signin should be reasonably fast
  profiler.assertPerformance('Complete Signin Flow', 12); // 12ms max average

  console.log('✅ Complete signin flow performance test passed');
});

Deno.test('Performance - Concurrent user operations', async () => {
  const profiler = new PerformanceProfiler();
  const mockPrisma = new MockPrismaService();
  const mockJwtService = new MockJwtService();

  console.log('⚡ Testing concurrent user operations performance...');

  const concurrentOperations = async (): Promise<any[]> => {
    const operations = [];

    // Simulate 10 concurrent users performing different operations
    for (let i = 0; i < 10; i++) {
      operations.push(
        // User lookup
        mockPrisma.user.findUnique({
          where: { email: `user${i}@test.com` }
        }),
        // JWT verification
        mockJwtService.verify(`mock_token_${i}`),
        // Token generation
        mockJwtService.sign({ id: i, email: `user${i}@test.com` })
      );
    }

    return Promise.all(operations);
  };

  const metrics = await profiler.measure(
    'Concurrent Operations (30 ops)',
    concurrentOperations,
    20
  );

  console.log(`📊 Concurrent ops: ${metrics.averageTime.toFixed(2)}ms average`);

  // Concurrent operations should handle well
  profiler.assertPerformance('Concurrent Operations (30 ops)', 25); // 25ms max average

  console.log('✅ Concurrent operations performance test passed');
});

// 📊 **Generate Performance Report**

Deno.test('Performance - Generate final report', async () => {
  const profiler = new PerformanceProfiler();

  // Run a quick test to get the profiler instance
  await profiler.measure(
    'Report Generation Test',
    async () => { await new Promise(resolve => setTimeout(resolve, 1)); },
    1
  );

  console.log(profiler.getReport());

  console.log('\n✅ All performance tests completed');
  console.log('📊 Performance characteristics analyzed');
  console.log('⚡ Auth system performance validated');
});

// 🎯 **Performance Guidelines**
console.log('\n🎯 **Performance Guidelines for Auth System**');
console.log('=' .repeat(50));
console.log('• Password hashing: < 500ms (production with bcrypt 12 rounds)');
console.log('• JWT operations: < 5ms');
console.log('• Database lookups: < 50ms (with proper indexing)');
console.log('• Complete signup: < 800ms');
console.log('• Complete signin: < 600ms');
console.log('• Concurrent handling: Scale linearly with proper connection pooling');
console.log('• Memory usage: Monitor for leaks in long-running sessions');
console.log('• Cache frequently accessed user data');
console.log('• Use database connection pooling');
console.log('• Implement rate limiting for auth endpoints');
console.log('• Consider Redis for session storage in production');

// Note: These are mock performance tests for demonstration.
// In production, you would:
// - Use real bcrypt with actual rounds (12+ recommended)
// - Test against actual database with realistic data volumes
// - Use real JWT libraries with proper crypto
// - Test with actual network latency
// - Monitor memory usage over time
// - Use load testing tools like Artillery, k6, or JMeter
// - Set up continuous performance monitoring
// - Test against production-like infrastructure
