import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@emotion/react',
      '@emotion/styled',
    ],
    alias: {
      '@': resolve(new URL('./src', import.meta.url).pathname),
    },
  },
  base: '/',
  server: {
    historyApiFallback: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable manual chunks
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash][extname]',
        // Use Rollup's automatic chunking instead
        experimentalMinChunkSize: 10000,
        experimentalMaxChunkSize: 500000,
      },
    },
    // Enable Vite's built-in chunking strategy
    chunkSizeWarningLimit: 500,
    minify: 'esbuild',
    target: 'esnext',
    modulePreload: true,
  },
});
