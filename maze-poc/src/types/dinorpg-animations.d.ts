/**
 * Minimal ambient types for `@eternaltwin/dinorpg_animations`.
 *
 * The package ships JS with partial `.d.ts` coverage; this declares just the
 * surface the POC uses. `sdino` is a Pixi `Container`, so it can be added to a
 * stage and positioned directly.
 */
declare module '@eternaltwin/dinorpg_animations' {
	import type { Container as PixiContainer } from 'pixi.js';

	export interface SdinoOptions {
		/** Dino "code" string, e.g. "09T1Yt9wqq4Rx000". */
		data: string;
		/** 1 = facing right (default), 0 = mirrored. */
		flip?: number;
		/** false = freeze on the first stand frame, true = play idle animation. */
		pflag?: boolean;
		scale?: number;
		damages?: number;
	}

	export class sdino extends PixiContainer {
		constructor(options: SdinoOptions);
		flip(n: number): void;
		playAnim(anim: string): void;
	}

	export { Application, Container, Graphics, Texture, autoDetectRenderer } from 'pixi.js';
}
