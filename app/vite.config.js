// app/vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react(), visualizer()],
  resolve: {
    alias: {
      '@': resolve(new URL('./src', import.meta.url).pathname),
    },
  },
  base: '/',
  server: {
    // This helps with local development
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/recharts/.test(id)) return 'recharts';
          if (/react-markdown|remark-|rehype-/.test(id))
            return 'markdown-bundle';
          if (/react-syntax-highlighter/.test(id))
            return 'react-syntax-highlighter';
          if (/highlight/.test(id)) return 'highlight';
          if (/refractor/.test(id)) return 'refractor';
          if (/lodash/.test(id)) return 'lodash';
          if (/date-fns/.test(id)) return 'date-fns';
          if (
            /node_modules\/(react|react-dom|react-router|react-router-dom)/.test(
              id
            )
          )
            return 'react-core';
          if (/node_modules/.test(id)) return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
