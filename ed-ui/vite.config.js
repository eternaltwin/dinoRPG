import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { fileURLToPath } from 'node:url';

const STATIC_DIR = 'public';
const MIXINS = fileURLToPath(new URL('./src/css/_mixins.scss', import.meta.url));

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());

	return {
		plugins: [vue(), vueDevTools()],
		publicDir: STATIC_DIR,
		resolve: {
			extensions: ['.js', '.ts', '.json', '.vue'],
			// @eternaltwin/dinorpg_animations bundles its own copy of pixi.js; dedupe so
			// the app and the package share a single Pixi instance (avoids duplicate
			// DisplayObject classes breaking `instanceof` checks at render time).
			dedupe: ['pixi.js']
		},
		css: {
			preprocessorOptions: {
				scss: { additionalData: `@use "${MIXINS}" as *;\n` }
			}
		},
		server: {
			port: 8080,
			https: env.VITE_USE_HTTPS === 'true',
			forwardConsole: false
		},
		define: {
			['import.meta.env.VERSION']: JSON.stringify(require('./package.json').version)
		},
		build: {
			target: 'esnext'
		},
		assetsInclude: ['**/*.swf', '**/*.md']
	};
});
