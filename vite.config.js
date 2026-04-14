import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('jspdf')) return 'vendor-pdf';
            if (id.includes('docx')) return 'vendor-doc';
            if (id.includes('lucide')) return 'vendor-icons';
            return 'vendor';
          }
        }
      }
    }
  }
})
