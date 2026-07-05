import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL?.replace(/\/$/, '') ?? '';
  const useLocalProxy =
    !apiUrl || apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: useLocalProxy
        ? {
            '/api': {
              target: 'http://localhost:3001',
              changeOrigin: true,
            },
            '/robots.txt': {
              target: 'http://localhost:3001',
              changeOrigin: true,
            },
            '/sitemap.xml': {
              target: 'http://localhost:3001',
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});
