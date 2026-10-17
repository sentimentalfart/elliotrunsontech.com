import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base './' works on both github.io/repo/ and custom root domain elliotrunsontech.com
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.js'],
  },
});
