import { defineConfig } from 'vite';

export default defineConfig({
  // Custom domain elliotrunsontech.com serves from root '/'
  base: '/',
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
