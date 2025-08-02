# 🧪 WRM Authentication Testing Package

A comprehensive testing suite for the WRM authentication system, featuring unit tests, integration tests, E2E tests, and performance testing.

## 📁 Package Structure

```
packages/testing/
├── auth/                           # Authentication-specific tests
│   ├── backend/                   # Backend auth logic tests
│   │   └── auth-core.test.ts     # Core authentication functions
│   └── frontend/                  # Frontend auth component tests  
│       └── auth-components.test.ts # React auth components
├── integration/                   # Cross-system integration tests
│   └── auth-integration.test.ts  # Full-stack auth flow
├── e2e/                          # End-to-end user journey tests
│   └── auth-user-journeys.test.ts # Complete user scenarios
├── performance/                   # Performance and load tests
│   └── auth-performance.test.ts  # Auth system performance
├── utils/                        # Shared testing utilities
│   └── test-helpers.ts          # Mocks, fixtures, and helpers
├── fixtures/                     # Test data and fixtures
├── scripts/                      # Test execution scripts
│   └── run-tests.ts            # Comprehensive test runner
└── README.md                    # This file
```

## 🚀 Quick Start

### Run All Tests
```bash
# From the testing package directory
deno run --allow-all scripts/run-tests.ts

# Or from project root
deno run --allow-all packages/testing/scripts/run-tests.ts
```

### Run Specific Test Categories

```bash
# Unit tests only
deno run --allow-all scripts/run-tests.ts --category unit

# Integration tests only  
deno run --allow-all scripts/run-tests.ts --category integration

# E2E tests only
deno run --allow-all scripts/run-tests.ts --category e2e

# Performance tests only
deno run --allow-all scripts/run-tests.ts --category performance
```

### Run Tests with Pattern Matching

```bash
# Run backend-related tests
deno run --allow-all scripts/run-tests.ts --pattern backend

# Run frontend-related tests
deno run --allow-all scripts/run-tests.ts --pattern frontend

# Run auth-specific tests
deno run --allow-all scripts/run-tests.ts --pattern auth
```

### Advanced Options

```bash
# Verbose output
deno run --allow-all scripts/run-tests.ts --verbose

# Parallel execution
deno run --allow-all scripts/run-tests.ts --parallel

# Combined options
deno run --allow-all scripts/run-tests.ts --category unit --verbose --parallel
```

## 🧪 Test Categories

### 🔬 Unit Tests
- **Backend**: Core authentication logic, validation, JWT handling
- **Frontend**: React components, hooks, state management
- **Coverage**: Individual functions and components in isolation

### 🔗 Integration Tests  
- **Full-Stack Flow**: Frontend ↔ Backend communication
- **Database Integration**: Prisma service integration
- **API Endpoints**: Complete request/response cycles

### 🎭 End-to-End Tests
- **User Journeys**: Complete signup/signin/logout flows
- **Error Handling**: Invalid credentials, form validation
- **Browser Simulation**: Mock user interactions

### ⚡ Performance Tests
- **Speed Analysis**: Password hashing, JWT operations, DB queries
- **Load Testing**: Concurrent user operations
- **Memory Usage**: Resource consumption monitoring

## 🛠️ Testing Utilities

### MockPrismaService
```typescript
import { MockPrismaService } from './utils/test-helpers.ts';

const mockPrisma = new MockPrismaService();
const user = await mockPrisma.user.findUnique({ where: { email: 'test@test.com' } });
```

### MockJwtService  
```typescript
import { MockJwtService } from './utils/test-helpers.ts';

const mockJwt = new MockJwtService();
const token = mockJwt.sign({ id: 1, email: 'test@test.com' });
const payload = mockJwt.verify(token);
```

### Test Fixtures
```typescript
import { TEST_FIXTURES } from './utils/test-helpers.ts';

// Use predefined test data
const validUser = TEST_FIXTURES.validUser;
const invalidCredentials = TEST_FIXTURES.invalidCredentials;
```

## 📊 Test Reports

The test runner generates comprehensive reports including:

- ✅ **Pass/Fail Summary**: Overall test results
- ⏱️ **Performance Metrics**: Execution times and bottlenecks  
- 📈 **Coverage Analysis**: Test category completion
- 🔍 **Detailed Errors**: Failed test diagnostics
- 💡 **Recommendations**: Actionable improvement suggestions

## 🏗️ Adding New Tests

### 1. Unit Test Example
```typescript
// packages/testing/auth/backend/new-feature.test.ts
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test('New feature - should work correctly', () => {
  // Test implementation
  assertEquals(result, expected);
});
```

### 2. Integration Test Example
```typescript
// packages/testing/integration/new-integration.test.ts
import { MockPrismaService, MockJwtService } from '../utils/test-helpers.ts';

Deno.test('Integration - new feature flow', async () => {
  // Test full-stack integration
});
```

### 3. Performance Test Example
```typescript
// packages/testing/performance/new-performance.test.ts
import { PerformanceProfiler } from '../utils/test-helpers.ts';

Deno.test('Performance - new feature speed', async () => {
  // Performance analysis
});
```

## 🔧 Configuration

### Test Environment Variables
```bash
# Set test database URL
export TEST_DATABASE_URL="postgresql://..."

# Set test JWT secret
export TEST_JWT_SECRET="test-secret-key"

# Enable debug logging
export TEST_DEBUG=true
```

### Deno Configuration
Tests run with the following Deno permissions:
- `--allow-read`: File system access for test files
- `--allow-write`: Test report generation
- `--allow-net`: Network access for database connections
- `--allow-env`: Environment variable access

## 📋 Best Practices

### ✅ Do's
- **Isolate Tests**: Each test should be independent
- **Use Mocks**: Mock external dependencies 
- **Clear Names**: Descriptive test names and descriptions
- **Fast Execution**: Keep unit tests under 100ms
- **Clean Data**: Reset state between tests

### ❌ Don'ts  
- **No External Dependencies**: Don't rely on external services
- **No Shared State**: Avoid test interdependencies
- **No Production Data**: Use only test fixtures
- **No Slow Tests**: Keep performance tests reasonable

## 🚨 Troubleshooting

### Common Issues

**Test File Not Found**
```bash
Error: Test file not found: /path/to/test.ts
```
*Solution*: Ensure test files exist and paths are correct

**Permission Denied**
```bash
Error: Permission denied
```
*Solution*: Run with `--allow-all` or specific permissions

**Mock Service Errors**
```bash
Error: MockPrismaService not properly initialized
```
*Solution*: Check mock service setup in test-helpers.ts

**Performance Test Failures**
```bash
Performance assertion failed: 150ms > 100ms
```
*Solution*: Review performance thresholds or optimize code

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
name: Auth Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      - name: Run Auth Tests
        run: deno run --allow-all packages/testing/scripts/run-tests.ts
```

### Local Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
deno run --allow-all packages/testing/scripts/run-tests.ts --category unit
```

## 🎯 Test Coverage Goals

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All critical user flows  
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Sub-second response times

## 📚 References

- [Deno Testing Guide](https://deno.land/manual/testing)
- [WRM Project Documentation](../../docs/)
- [Authentication Best Practices](../../docs/auth-security.md)
- [Performance Guidelines](../../docs/performance.md)

---

**🧪 Happy Testing!** - The WRM Authentication Testing Suite
