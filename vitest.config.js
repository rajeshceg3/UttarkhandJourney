import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true, // Allows describe, it, expect without import, but existing tests import them. It's fine to have both.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/main.js', 'src/tests/**', '**/*.d.ts', '**/*.config.js'], // main.js is hard to unit test
    },
    include: ['src/tests/**/*.test.js'],
  },
});
