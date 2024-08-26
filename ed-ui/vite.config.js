import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const STATIC_DIR = 'public';

export default defineConfig(() => {
  return {
    plugins: [
      vue()
    ],
    publicDir: STATIC_DIR,
    resolve: {
      extensions: ['.js', '.ts', '.json', '.vue']
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
		build: {
			target: 'esnext'
		},
    assetsInclude: '**/*.swf'
  }
});
