// 🔧 **Shared Testing Utilities**
// Common mocks, fixtures, and helpers for auth testing

export interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface TestAuthResponse {
  user: Omit<TestUser, 'password'>;
  accessToken: string;
  refreshToken: string;
}

// 📋 **Test Data Fixtures**
export const testUsers = {
  validUser: {
    id: 'user-123',
    email: 'test@test.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as TestUser & { name: string },
  
  existingUser: {
    id: 'existing-user',
    email: 'existing@test.com', 
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as TestUser & { name: string },

  newUser: {
    id: 'new-user-id',
    email: 'newuser@test.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Johnson',
    name: 'Alice Johnson',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as TestUser & { name: string },
};

// Export TEST_FIXTURES for compatibility
export const TEST_FIXTURES = {
  validUser: testUsers.validUser,
  existingUser: testUsers.existingUser,
  newUser: testUsers.newUser,
  invalidCredentials: {
    email: 'wrong@test.com',
    password: 'wrongpassword',
  },
  invalidEmails: [
    'invalid-email',
    '@test.com',
    'test@',
    'test.com',
  ],
  invalidPasswords: [
    '', // empty
    '123', // too short
    'password', // no numbers
    '12345', // no letters
  ],
};

export const testTokens = {
  valid: {
    accessToken: 'access_token_user-123',
    refreshToken: 'refresh_token_user-123',
    expiresIn: 900, // 15 minutes
  } as TestTokens,
  
  expired: {
    accessToken: 'expired_access_token',
    refreshToken: 'expired_refresh_token',
    expiresIn: -1,
  } as TestTokens,
  
  invalid: {
    accessToken: 'invalid_token',
    refreshToken: 'invalid_refresh_token',
    expiresIn: 900,
  } as TestTokens,
};

// 🔄 **Mock Services**
export class MockPrismaService {
  private users: Map<string, TestUser> = new Map();

  constructor() {
    // Pre-populate with test users
    this.users.set(testUsers.existingUser.email, testUsers.existingUser);
    this.users.set(testUsers.validUser.email, testUsers.validUser);
  }

  user = {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      if (where.email) {
        return this.users.get(where.email) || null;
      }
      if (where.id) {
        return Array.from(this.users.values()).find(u => u.id === where.id) || null;
      }
      return null;
    },
    
    create: async ({ data }: { data: Partial<TestUser> & { name?: string } }) => {
      const newUser = {
        id: data.id || 'new-user-id',
        email: data.email!,
        password: data.password!,
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(newUser.email, newUser);
      return newUser;
    },
    
    update: async ({ where, data }: { where: { id: string }, data: Partial<TestUser> }) => {
      const user = Array.from(this.users.values()).find(u => u.id === where.id);
      if (!user) return null;
      
      const updatedUser = { ...user, ...data, updatedAt: new Date() };
      this.users.set(user.email, updatedUser);
      return updatedUser;
    },
    
    delete: async ({ where }: { where: { id: string } }) => {
      const user = Array.from(this.users.values()).find(u => u.id === where.id);
      if (!user) return null;
      
      this.users.delete(user.email);
      return user;
    },
  };
}

export class MockJwtService {
  signAsync = async (payload: { sub: string; email: string }, options: { secret?: string }) => {
    if (options.secret === 'your-secret-key' || options.secret === Deno.env.get('JWT_SECRET')) {
      return `access_token_${payload.sub}`;
    }
    return `refresh_token_${payload.sub}`;
  };

  sign = (payload: any, options?: { expiresIn?: string }) => {
    const userId = payload.id || payload.sub || 'user-123';
    if (options?.expiresIn === '7d') {
      return `refresh_token_${userId}`;
    }
    return `access_token_${userId}`;
  };

  verify = (token: string) => {
    if (token.includes('invalid') || token.includes('expired')) {
      throw new Error('Invalid token');
    }
    return { sub: 'user-123', email: 'test@test.com' };
  };
}

// 🧪 **Test Assertion Helpers**
export function assertUserResponse(user: any, expected: Partial<TestUser>) {
  if (user.id !== expected.id) throw new Error(`Expected user id ${expected.id}, got ${user.id}`);
  if (user.email !== expected.email) throw new Error(`Expected email ${expected.email}, got ${user.email}`);
  if (expected.firstName && user.firstName !== expected.firstName) {
    throw new Error(`Expected firstName ${expected.firstName}, got ${user.firstName}`);
  }
  if (expected.lastName && user.lastName !== expected.lastName) {
    throw new Error(`Expected lastName ${expected.lastName}, got ${user.lastName}`);
  }
  // Ensure password is not in response
  if ('password' in user) throw new Error('Password should not be in user response');
}

export function assertTokenResponse(tokens: any, expectedUserId: string) {
  if (!tokens.accessToken) throw new Error('Access token should be present');
  if (!tokens.refreshToken) throw new Error('Refresh token should be present');
  if (!tokens.accessToken.includes(expectedUserId)) {
    throw new Error(`Access token should include user ID ${expectedUserId}`);
  }
  if (!tokens.refreshToken.includes(expectedUserId)) {
    throw new Error(`Refresh token should include user ID ${expectedUserId}`);
  }
}

export async function assertThrowsAsync<T extends Error>(
  fn: () => Promise<unknown>,
  ErrorClass: new (...args: any[]) => T,
  messageIncludes?: string
): Promise<void> {
  try {
    await fn();
    throw new Error(`Expected function to throw ${ErrorClass.name}`);
  } catch (error) {
    if (!(error instanceof ErrorClass)) {
      const errorName = error instanceof Error ? error.constructor.name : 'Unknown';
      throw new Error(`Expected ${ErrorClass.name}, got ${errorName}`);
    }
    if (messageIncludes && !error.message.includes(messageIncludes)) {
      throw new Error(`Expected error message to include "${messageIncludes}", got "${error.message}"`);
    }
  }
}

// 🌐 **API Test Helpers**
export function createTestApiClient() {
  return {
    signUp: async (data: { email: string; password: string }) => {
      if (data.email === testUsers.existingUser.email) {
        throw new Error('User already exists');
      }
      return {
        user: { ...testUsers.newUser },
        accessToken: testTokens.valid.accessToken,
        refreshToken: testTokens.valid.refreshToken,
      };
    },
    
    signIn: async (data: { email: string; password: string }) => {
      if (data.email !== testUsers.validUser.email || data.password !== testUsers.validUser.password) {
        throw new Error('Invalid credentials');
      }
      return {
        user: { ...testUsers.validUser },
        accessToken: testTokens.valid.accessToken,
        refreshToken: testTokens.valid.refreshToken,
      };
    },
    
    refreshToken: async (token: string) => {
      if (token.includes('invalid')) {
        throw new Error('Invalid refresh token');
      }
      return {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };
    },
    
    getProfile: async () => {
      return { user: { ...testUsers.validUser } };
    },
    
    signOut: async () => {
      return { message: 'Signed out successfully' };
    },
  };
}

// 🔒 **Security Test Helpers**
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (!/[A-Za-z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isTokenExpired(exp: number): boolean {
  return exp < Math.floor(Date.now() / 1000);
}

// 🎭 **Environment Test Helpers**
export function setupTestEnvironment() {
  // Set test environment variables
  Deno.env.set('JWT_SECRET', 'test-secret-key');
  Deno.env.set('JWT_REFRESH_SECRET', 'test-refresh-secret');
  Deno.env.set('JWT_EXPIRES_IN', '15m');
  Deno.env.set('JWT_REFRESH_EXPIRES_IN', '7d');
  Deno.env.set('NODE_ENV', 'test');
}

export function cleanupTestEnvironment() {
  // Clean up test environment variables
  Deno.env.delete('JWT_SECRET');
  Deno.env.delete('JWT_REFRESH_SECRET');
  Deno.env.delete('JWT_EXPIRES_IN');
  Deno.env.delete('JWT_REFRESH_EXPIRES_IN');
  Deno.env.delete('NODE_ENV');
}

console.log('✅ Testing utilities loaded');
console.log('✅ Mock services available');
console.log('✅ Test fixtures ready');
console.log('✅ Assertion helpers ready');
