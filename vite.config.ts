import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      app: fileURLToPath(new URL('./src/app', import.meta.url)),
      'app/*': fileURLToPath(new URL('./src/app/*', import.meta.url)),
      pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
      'pages/*': fileURLToPath(new URL('./src/pages/*', import.meta.url)),
      shared: fileURLToPath(new URL('./src/shared', import.meta.url)),
      'shared/*': fileURLToPath(new URL('./src/shared/*', import.meta.url)),
      widgets: fileURLToPath(new URL('./src/widgets', import.meta.url)),
      'widgets/*': fileURLToPath(new URL('./src/widgets/*', import.meta.url)),
      features: fileURLToPath(new URL('./src/features', import.meta.url)),
      'features/*': fileURLToPath(new URL('./src/features/*', import.meta.url)),
    },
  },
});
