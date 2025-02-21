// app/vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react(), visualizer()],
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
    host: true,
    port: 5173,
  },
});
