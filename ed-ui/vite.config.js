import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const STATIC_DIR = 'static';

export default defineConfig(() => {
  return {
    plugins: [vue()],
    publicDir: STATIC_DIR,
    resolve: {
      extensions: ['.js', '.ts', '.json', '.vue'],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      }
    },
    css: {
      preprocessorOptions: {
        scss: { additionalData: `@import "./src/css/_mixins.scss";` },
      },
    },
    server: {
      port: 8080
    },
    define: {
      ['import.meta.env.VERSION']: JSON.stringify(require('./package.json').version)
    },
    assetsInclude: '**/*.swf'
  }
});