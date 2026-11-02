import { describe, it, expect, vi } from 'vitest';
import { PLAYER_MESSAGE_MAX_LENGTH } from '@drpg/core/utils/marktwin';

vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));

import { renderPlayerMessage } from '../../utils/marktwin.js';

describe('renderPlayerMessage', () => {
	it('renders the inline markup', async () => {
		expect(await renderPlayerMessage('**gras** _italique_ __souligné__ ~~barré~~ ||spoiler||')).toBe(
			'<strong>gras</strong> <em>italique</em> <u>souligné</u> <span class="strikethrough">barré</span> <span class="mkt-spoiler">spoiler</span>'
		);
	});

	// marktwin 0.6.0 panicked on these: its wasm-bindgen glue handed Rust a buffer
	// larger than the string, which Rust then freed with the wrong size. Fixed in 0.6.1.
	it('survives non-ASCII text in the middle of a message', async () => {
		expect(await renderPlayerMessage('Salut à tous, ça va ? 🦖 日本語 ok')).toBe('Salut à tous, ça va ? 🦖 日本語 ok');
	});

	it('escapes HTML instead of passing it through', async () => {
		expect(await renderPlayerMessage('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
	});

	it('keeps http(s) links and drops other protocols', async () => {
		expect(await renderPlayerMessage('[ici](https://dinorpg.eternaltwin.org)')).toBe(
			'<a href="https://dinorpg.eternaltwin.org">ici</a>'
		);
		expect(await renderPlayerMessage('[ici](javascript:alert(1))')).not.toContain('<a');
	});

	it('leaves the speaker blocks as plain text', async () => {
		expect(await renderPlayerMessage('[mod]x[/mod] [admin]y[/admin]')).toBe('[mod]x[/mod] [admin]y[/admin]');
	});

	it('renders the blocks', async () => {
		expect(await renderPlayerMessage('[quote=Bob]salut[/quote]')).toBe(
			'<blockquote><span class="mkt-quoteauthor">Bob</span>salut</blockquote>'
		);
		expect(await renderPlayerMessage('[ul][li]a[/li][/ul]')).toBe('<ul><li>a</li></ul>');
	});

	it('normalises line endings and trims', async () => {
		expect(await renderPlayerMessage('  a\r\nb  ')).toBe('a<br />\nb');
	});

	it('refuses an empty message', async () => {
		await expect(renderPlayerMessage('   ')).rejects.toThrow('messageEmpty');
		await expect(renderPlayerMessage(undefined)).rejects.toThrow('messageEmpty');
		await expect(renderPlayerMessage({ html: '<b>x</b>' })).rejects.toThrow('messageEmpty');
	});

	it('refuses an oversized message', async () => {
		await expect(renderPlayerMessage('a'.repeat(PLAYER_MESSAGE_MAX_LENGTH + 1))).rejects.toThrow('messageTooLong');
		await expect(renderPlayerMessage('a'.repeat(PLAYER_MESSAGE_MAX_LENGTH))).resolves.toBeDefined();
	});
});
