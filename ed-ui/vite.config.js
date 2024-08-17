import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert'

const STATIC_DIR = 'public';

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      mkcert()
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
      port: 8080,
      https: true
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
