import type { MarktwinGrammar } from '@drpg/core/utils/marktwin';

type MarktwinModule = typeof import('@eternaltwin/marktwin');

let marktwin: Promise<MarktwinModule> | undefined;

/**
 * Render Marktwin to HTML, the way the backend will.
 *
 * The parser is a wasm module: it is only fetched the first time a preview is asked for, so
 * pages that merely read messages never download it.
 */
export async function renderMarktwin(grammar: MarktwinGrammar, source: string): Promise<string> {
	marktwin ??= import('@eternaltwin/marktwin').catch(error => {
		marktwin = undefined;
		throw error;
	});
	const { renderMarktwin: render } = await marktwin;
	return render(grammar, source);
}

/**
 * Make `[spoiler]` and `[collapse]` clickable wherever rendered Marktwin is shown.
 *
 * The HTML arrives through `v-html` (and from Eternaltwin for the forum), so there is no component
 * to hang a handler on: one delegated listener covers every message, past and future.
 */
export function installMarktwinInteractions(root: Document = document): void {
	root.addEventListener('click', event => {
		const target = event.target instanceof Element ? event.target : null;
		const spoiler = target?.closest('.mkt-spoiler');
		if (spoiler) {
			spoiler.classList.toggle('is-revealed');
			return;
		}
		const collapsor = target?.closest('.mkt-collapsor');
		if (collapsor) collapsor.classList.toggle('is-open');
	});
}
