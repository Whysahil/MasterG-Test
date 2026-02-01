import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Safety polyfill to prevent "process is not defined" crashes in third-party libs
    'process.env': {} 
  },
  build: {
    // Increase the warning limit to silence the 500kb warning
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Separate vendor dependencies into their own chunk to improve caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'recharts', 'lucide-react', '@google/genai', 'jspdf'],
        },
      },
    },
  },
});