import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'tests/**', // 排除 Playwright E2E 测试
    ],
    // 优化内存使用
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // 使用单线程模式，减少内存占用
        minThreads: 1,
        maxThreads: 1,
        isolate: true, // 隔离每个测试文件，避免内存泄漏累积
      },
    },
    // 减少内存占用
    testTimeout: 10000,
    hookTimeout: 10000,
    // 强制垃圾回收
    forceRerunTriggers: [],
    // 减少并发
    sequence: {
      shuffle: false,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        'tests/**',
        'dist/',
        'build/',
      ],
      include: ['src/**/*.{ts,tsx}'],
      // 优化内存使用
      all: false, // 只收集被测试代码的覆盖率，不收集所有文件的覆盖率
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

