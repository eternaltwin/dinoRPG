/* eslint-disable */
// The declarations shipped with @eternaltwin/dinorpg_animations 1.0.9 lag behind its code: the
// members below exist at runtime (`src/display/Animator.js`, `src/fight/Fight.js`) but are missing
// or have fewer parameters in `src/sdino.d.ts`.
import '@eternaltwin/dinorpg_animations';

declare module '@eternaltwin/dinorpg_animations' {
	interface sdino {
		toAnimation(callback: (div: HTMLDivElement) => void, width?: number, height?: number, x?: number, y?: number): void;
	}

	interface dino {
		toRawImage(
			callback: (image: string) => void,
			width?: number,
			height?: number,
			x?: number,
			y?: number,
			format?: string
		): void;
	}

	interface Fight {
		/** Write-only: registers the callback fired once the fight ends. */
		onFightEnd: () => void;
	}
}
