// app/vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';

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
    // This helps with local development
    historyApiFallback: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const nodeModulesPath = /node_modules/;
          if (!nodeModulesPath.test(id)) return;
          const pkg = id.match(/node_modules\/([^/]+)/)?.[1];
          if (!pkg) return;
          if (
            /^(react|react-dom|react-router|react-router-dom|scheduler|@react-spring)$/.test(
              pkg
            )
          ) {
            return 'react-core';
          }
          if (/^(@?mui|@emotion|framer-motion|styled-components)/.test(pkg)) {
            return 'ui-libs';
          }
          if (/^(recharts|d3|victory)/.test(pkg)) {
            return 'data-viz';
          }
          if (/^(react-markdown|remark-|rehype-|unified|dompurify)/.test(pkg)) {
            return 'markdown';
          }
          if (
            /^(react-syntax-highlighter|highlight|refractor|prism)/.test(pkg)
          ) {
            return 'syntax-highlight';
          }
          if (/^(lodash|date-fns|moment|dayjs|react-day-picker)/.test(pkg)) {
            return 'utils';
          }
          if (/^(@hcaptcha|qrcode.react)/.test(pkg)) {
            return 'integrations';
          }
          return 'vendor';
        },
      },
    },
  },
});
