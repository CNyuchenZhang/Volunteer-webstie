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
    // CI优化配置 - 在CI环境使用更快的配置
    pool: process.env.CI ? 'threads' : 'forks',  // CI使用threads更快
    poolOptions: {
      threads: {
        // CI环境：使用多线程并发执行
        singleThread: false,
        isolate: false,  // 不隔离，共享内存更快
        useAtomics: true,
      },
      forks: {
        // 本地环境：使用单fork保证稳定性
        singleFork: true,
        isolate: true,
        execArgv: ['--expose-gc', '--max-old-space-size=4096'],
      },
    },
    // 超时配置
    testTimeout: 10000,
    hookTimeout: 5000,
    teardownTimeout: 5000,
    // CI环境启用并发
    sequence: {
      shuffle: false,
      concurrent: process.env.CI ? true : false,  // CI启用并发
    },
    // CI环境不隔离以提高速度
    isolate: process.env.CI ? false : true,
    // 最大并发数（CI环境）
    maxConcurrency: process.env.CI ? 5 : 1,
    // 优化覆盖率收集
    coverage: {
      provider: 'v8',
      // CI环境只生成必要的报告格式
      reporter: process.env.CI 
        ? ['json-summary', 'json']  // CI只需要JSON
        : ['text', 'json', 'html', 'lcov'],  // 本地开发需要更多格式
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
        '**/index.ts',
        '**/index.tsx',
        '**/*.stories.tsx',
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: false,           // 只收集被测试代码的覆盖率
      clean: true,
      cleanOnRerun: true,
      // CI环境跳过某些检查以提速
      skipFull: process.env.CI ? true : false,
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

