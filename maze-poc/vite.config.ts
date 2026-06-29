import { defineConfig } from 'vite';

// `@eternaltwin/dinorpg_animations` bundles its own copy of pixi.js; dedupe so
// the app and the package share a single Pixi instance (avoids duplicate
// DisplayObject classes breaking `instanceof` checks at render time).
export default defineConfig({
	resolve: {
		dedupe: ['pixi.js']
	},
	optimizeDeps: {
		include: ['pixi.js', '@eternaltwin/dinorpg_animations']
	}
});
