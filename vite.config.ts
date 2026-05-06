import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const simulationEnabled = mode === 'development';
  const isProduction = mode === 'production';
  
  return {
    server: {
      port: 3030,
      host: true,
      strictPort: true,
      open: false,
      hmr: {
        overlay: true,
      },
      cors: true,
      fs: {
        allow: ['..']
      }
    },
    plugins: [
      react(),
      // Production safety: validate environment
      {
        name: 'prod-env-validator',
        configResolved(config) {
          if (isProduction) {
            const useMock = env.VITE_USE_MOCK === 'true';
            const debugEnabled = env.VITE_DEBUG === 'true';
            if (useMock) {
              throw new Error('CRITICAL: Mock mode (VITE_USE_MOCK=true) must NEVER be enabled in production');
            }
            if (debugEnabled) {
              console.warn('⚠️ WARNING: Debug mode is enabled in production build');
            }
          }
        }
      }
    ],
    build: {
      minify: isProduction ? 'esbuild' : false,
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : [],
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['lucide-react'],
            'vendor-charts': ['recharts'],
            'vendor-motion': ['framer-motion'],
          }
        }
      }
    },
    define: {
      '__SIMULATION_ENABLED__': simulationEnabled,
      '__DEBUG_MODE__': env.VITE_DEBUG === 'true',
      '__USE_MOCK__': env.VITE_USE_MOCK === 'true'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});

