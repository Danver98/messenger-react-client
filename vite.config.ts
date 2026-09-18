import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3000, // Keeps the default CRA port
    open: true, // Automatically opens the browser
  },
  build: {
    outDir: 'build', // Changes output from 'dist' to 'build' to match CRA
  },
});