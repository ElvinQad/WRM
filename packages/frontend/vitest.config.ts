import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: false,
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
    testTimeout: 10000,
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '.next/',
      ]
    }
  },
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, './src/'),
      '@wrm/types': path.resolve(__dirname, '../types/src/index.ts'),
    }
  }
});
