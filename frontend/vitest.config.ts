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
    // CI优化配置 - 使用forks模式避免内存溢出
    pool: 'forks',  // 使用forks模式，更稳定
    poolOptions: {
      forks: {
        // CI环境：使用多个fork但减少并发
        singleFork: process.env.CI ? false : true,  // CI允许多fork
        isolate: true,  // 隔离每个进程，避免内存泄漏
        execArgv: process.env.CI 
          ? ['--expose-gc', '--max-old-space-size=6144']  // CI增加内存
          : ['--expose-gc', '--max-old-space-size=4096'],
      },
    },
    // 超时配置
    testTimeout: 10000,
    hookTimeout: 5000,
    teardownTimeout: 5000,
    // CI环境适度并发，避免内存溢出
    sequence: {
      shuffle: false,
      concurrent: process.env.CI ? 2 : false,  // CI只并发2个，减少内存压力
    },
    // 保持隔离以提高稳定性
    isolate: true,
    // 最大并发数（CI环境减少）
    maxConcurrency: process.env.CI ? 2 : 1,
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

