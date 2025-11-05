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
    // 优化内存使用 - 使用更严格的内存配置
    pool: 'forks',  // 使用 forks 而不是 threads，每个进程有独立的内存空间
    poolOptions: {
      forks: {
        singleFork: true,  // 使用单个 fork，减少内存占用
        isolate: true,     // 隔离每个测试文件，避免内存泄漏累积
        execArgv: ['--expose-gc', '--max-old-space-size=4096'],  // 启用垃圾回收并增加堆内存
      },
    },
    // 减少内存占用
    testTimeout: 10000,     // 增加超时时间以适应 GC
    hookTimeout: 5000,      // 减少 hook 超时时间
    teardownTimeout: 5000,  // 添加清理超时
    // 强制垃圾回收
    forceRerunTriggers: [],
    // 减少并发
    sequence: {
      shuffle: false,
      concurrent: false,  // 禁用并发，顺序执行测试
    },
    // 启用隔离模式
    isolate: true,
    // 优化覆盖率收集
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
        '**/index.ts',      // 排除索引文件
        '**/index.tsx',     // 排除索引文件
        '**/*.stories.tsx', // 排除 Storybook 文件
      ],
      include: ['src/**/*.{ts,tsx}'],
      // 优化内存使用
      all: false,           // 只收集被测试代码的覆盖率
      clean: true,          // 清理旧的覆盖率数据
      cleanOnRerun: true,   // 重新运行时清理
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

