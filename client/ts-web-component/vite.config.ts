import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    target: 'esnext',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
      },
    },
  },
});
