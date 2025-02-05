// app/vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react(), ...(import.meta.env.DEV ? [visualizer()] : [])],
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
          // Handle node_modules path variations
          const nodeModulesPath = /node_modules/;
          if (!nodeModulesPath.test(id)) return;

          // Extract package name from path
          const pkg = id.match(/node_modules\/([^/]+)/)?.[1];
          if (!pkg) return;

          // Core React bundle
          if (
            /^(react|react-dom|react-router|react-router-dom|scheduler)$/.test(
              pkg
            )
          ) {
            return 'react-core';
          }

          // UI/Animation libraries
          if (/^(@?mui|@emotion|framer-motion|styled-components)/.test(pkg)) {
            return 'ui-libs';
          }

          // Data visualization
          if (/^(recharts|d3|victory)/.test(pkg)) {
            return 'data-viz';
          }

          // Markdown processing
          if (/^(react-markdown|remark-|rehype-|unified|dompurify)/.test(pkg)) {
            return 'markdown';
          }

          // Code highlighting
          if (
            /^(react-syntax-highlighter|highlight|refractor|prism)/.test(pkg)
          ) {
            return 'syntax-highlight';
          }

          // Utility libraries
          if (/^(lodash|date-fns|moment|dayjs|react-day-picker)/.test(pkg)) {
            return 'utils';
          }

          // Third-party integrations
          if (/^(@hcaptcha|qrcode.react)/.test(pkg)) {
            return 'integrations';
          }

          // Everything else
          return 'vendor';
        },
      },
    },
  },
});
