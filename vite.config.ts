import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ssk-zvezda-monitor/', // Важно для GitHub Pages!
  build: {
    outDir: 'dist',
  }
});