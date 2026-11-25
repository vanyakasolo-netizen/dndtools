import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — относительные пути, поэтому приложение работает на GitHub Pages
// в любом репозитории (https://имя.github.io/название-репозитория/) без настройки.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
