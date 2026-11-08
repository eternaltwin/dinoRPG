/**
 * Loads `@eternaltwin/dinorpg_animations` (tens of megabytes of sprites) on first use only. Imported statically
 * by a component of the menu, it landed in the entry chunk and was downloaded before the first page, even the
 * login page. The module is loaded once and shared by every component.
 */
type DinorpgAnimations = typeof import('@eternaltwin/dinorpg_animations');

let loading: Promise<DinorpgAnimations> | undefined;

export function loadDinorpgAnimations(): Promise<DinorpgAnimations> {
	loading ??= import('@eternaltwin/dinorpg_animations');
	return loading;
}
