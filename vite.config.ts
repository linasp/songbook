import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // keep CRA output folder for gh-pages compatibility
  },
  server: {
    open: true,
  },
});
