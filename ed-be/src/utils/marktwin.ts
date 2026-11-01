import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { MarktwinGrammar, PLAYER_MARKTWIN_GRAMMAR, PLAYER_MESSAGE_MAX_LENGTH } from '@drpg/core/utils/marktwin';
import { Player } from '@drpg/prisma';
import translate from './server/translate.js';

/** The backend compiles against `lib: es2021` alone, which carries no `WebAssembly` typings. */
interface WasmApi {
	instantiate(source: Uint8Array, imports: Record<string, unknown>): Promise<{ instance: { exports: unknown } }>;
}
const { WebAssembly: wasmApi } = globalThis as unknown as { WebAssembly: WasmApi };

/** The wasm-bindgen glue shipped next to the wasm module in `@eternaltwin/marktwin`. */
interface MarktwinBindings {
	__wbg_set_wasm(exports: unknown): void;
	parse(grammar: MarktwinGrammar, input: string): unknown;
	emitHtml(root: unknown): string;
}

let bindings: Promise<MarktwinBindings> | undefined;

/**
 * Instantiate the Marktwin wasm module by hand.
 *
 * The package's entry point imports the `.wasm` file as an ES module, which Node 22 only allows
 * behind `--experimental-wasm-modules`. Feeding the glue to `WebAssembly.instantiate` does the same
 * wiring without the flag, in the server and under Vitest alike.
 */
function loadBindings(): Promise<MarktwinBindings> {
	bindings ??= (async () => {
		const entry = createRequire(import.meta.url).resolve('@eternaltwin/marktwin');
		const wasmDir = path.join(path.dirname(entry), 'wasm');
		const glue = (await import(pathToFileURL(path.join(wasmDir, 'index_bg.js')).href)) as MarktwinBindings;
		const source = await readFile(path.join(wasmDir, 'index_bg.wasm'));
		const { instance } = await wasmApi.instantiate(source, { './index_bg.js': glue });
		glue.__wbg_set_wasm(instance.exports);
		return glue;
	})().catch(error => {
		// Forget the failure, so the next message tries again instead of failing for good.
		bindings = undefined;
		throw error;
	});
	return bindings;
}

/** Render Marktwin to HTML. Every text node is escaped by the emitter: the output is safe for `v-html`. */
export async function renderMarktwin(grammar: MarktwinGrammar, source: string): Promise<string> {
	const { parse, emitHtml } = await loadBindings();
	return emitHtml(parse(grammar, source));
}

/**
 * Turn what a player typed in a clan discussion or a private message into the HTML that is stored.
 *
 * The source is rendered here rather than trusted from the client: whatever was sent, only the
 * markup `PLAYER_MARKTWIN_GRAMMAR` allows reaches the database.
 */
export async function renderPlayerMessage(source: unknown, player?: Pick<Player, 'lang'> | null): Promise<string> {
	const text = typeof source === 'string' ? source.replace(/\r\n?/g, '\n').trim() : '';
	if (text.length === 0) {
		throw new ExpectedError(translate('messageEmpty', player));
	}
	if (text.length > PLAYER_MESSAGE_MAX_LENGTH) {
		throw new ExpectedError(translate('messageTooLong', player, { max: PLAYER_MESSAGE_MAX_LENGTH }));
	}
	return renderMarktwin(PLAYER_MARKTWIN_GRAMMAR, text);
}
