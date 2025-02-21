import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer(),
    {
      name: 'remove-use-client',
      transform(code, id) {
        if (id.includes('node_modules') && code.startsWith('"use client"')) {
          return code.replace('"use client"', ''); // Remove "use client"
        }
        return code;
      },
    },
  ],
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
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const packageName = id.split('node_modules/')[1].split('/')[0];

            // Group React-related packages
            if (
              ['react', 'react-dom', 'react-router-dom'].includes(packageName)
            ) {
              return 'vendor-react'; // Combine core React packages
            }

            // Group UI libraries
            if (
              [
                '@radix-ui/react-avatar',
                '@radix-ui/react-checkbox',
                '@radix-ui/react-label',
                '@radix-ui/react-popover',
                '@radix-ui/react-scroll-area',
                '@radix-ui/react-select',
                '@radix-ui/react-slider',
                '@radix-ui/react-slot',
                '@radix-ui/react-tabs',
                'lucide-react',
                'framer-motion',
                'react-helmet-async',
                'react-hot-toast',
                'react-intersection-observer',
                'tailwind-merge',
              ].includes(packageName)
            ) {
              return 'vendor-ui'; // Combine UI and utility libraries
            }

            // Group Markdown Processing Libraries
            if (['react-markdown', 'remark-gfm'].includes(packageName)) {
              return 'vendor-markdown'; // Combine markdown processing libraries
            }

            // Group Syntax Highlighting Libraries
            if (
              [
                'react-syntax-highlighter',
                'highlight.js',
                'refractor',
              ].includes(packageName)
            ) {
              return 'vendor-syntax-highlighting'; // Combine syntax highlighting libraries
            }

            // Group Data Visualization Libraries
            if (['recharts', 'date-fns'].includes(packageName)) {
              return 'vendor-charts'; // Combine charting and date utilities
            }

            // Group HTTP and API Libraries
            if (['axios', 'hcaptcha'].includes(packageName)) {
              return 'vendor-api'; // Combine API and HTTP-related libraries
            }

            // Group Security and Validation Libraries
            if (['crypto-js', 'dompurify'].includes(packageName)) {
              return 'vendor-security'; // Combine security and validation libraries
            }

            // Group Small or Rarely Used Packages
            const smallPackages = [
              'class-variance-authority',
              'clsx',
              'prop-types',
              'qrcode.react',
              'praytimes',
              // rare empty packages
              'detect-node-es', // Add here
              'dom-helpers', // Add here
              'micromark-extension-gfm-tagfilter', // Add here
              'micromark-util-encode', // Add here
              'set-cookie-parser', // Add here
              'turbo-stream', // Add here
              'zwitch', // Add here
            ];
            if (smallPackages.includes(packageName)) {
              return 'vendor-small-packages'; // Consolidate small or rarely used packages
            }

            // Default grouping for other packages
            return `vendor-${packageName}`;
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    minify: 'esbuild',
    target: 'esnext',
    modulePreload: true,
    chunkSizeWarningLimit: 1024,
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        directive: true, // Fix "use client" directive issue
      },
    },
  },
});
