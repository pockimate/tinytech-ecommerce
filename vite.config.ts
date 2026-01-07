/// <reference types="vite/client" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite client type extensions
interface ImportMetaEnv {
  readonly VITE_PAYPAL_CLIENT_ID?: string;
  readonly VITE_PAYPAL_CLIENT_SECRET?: string;
  readonly VITE_PAYPAL_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        // Production environment optimization
        outDir: 'dist',
        emptyOutDir: true,
        // Optimize code splitting - improve first screen loading speed
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor': ['react', 'react-dom'],
            }
          }
        },
        // Optimize packaging
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
          }
        },
        // Disable source maps to reduce output size
        sourcemap: mode === 'development',
        // Optimize chunk size
        chunkSizeWarningLimit: 500,
      },
      define: {
        'process.env.PAYPAL_CLIENT_ID': JSON.stringify(env.VITE_PAYPAL_CLIENT_ID),
        'process.env.PAYPAL_CLIENT_SECRET': JSON.stringify(env.VITE_PAYPAL_CLIENT_SECRET),
        'process.env.PAYPAL_API_BASE': JSON.stringify(env.VITE_PAYPAL_API_BASE)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
