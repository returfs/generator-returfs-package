import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  build: {
    modulePreload: true,
    target: 'esnext',
    minify: true,
    rollupOptions: {
      cache: true,
    },
  },
  experimental: {
    renderBuiltUrl() {
      return { relative: true };
    },
  },
  server: {
    port: 5107,
    origin: 'http://localhost:5107',
  },
  base: 'http://localhost:5107/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/resources/js',
    },
  },
});
