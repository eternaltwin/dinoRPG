import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { fileURLToPath } from 'url';

const STATIC_DIR = 'public';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());

	return {
		plugins: [vue(), vueDevTools()],
		publicDir: STATIC_DIR,
		resolve: {
			extensions: ['.js', '.ts', '.json', '.vue']
		},
		css: {
			preprocessorOptions: {
				scss: { additionalData: `@import "./src/css/_mixins.scss";` }
			}
		},
		server: {
			port: 8080,
			https: env.VITE_USE_HTTPS === 'true'
		},
		define: {
			['import.meta.env.VERSION']: JSON.stringify(require('./package.json').version)
		},
		build: {
			target: 'esnext'
		},
		assetsInclude: '**/*.swf'
	};
});
