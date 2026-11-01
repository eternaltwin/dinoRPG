/**
 * Text edits behind the Marktwin editor's toolbar: each takes the source and the selection, and
 * returns the new source with the range to select afterwards.
 */

export interface Range {
	start: number;
	end: number;
}

export interface TextAndRange {
	text: string;
	range: Range;
}

/**
 * Put `open`/`close` around the selection, or take them away when they are already there.
 *
 * Ported from Eternaltwin's own editor so the two agree on what a marker looks like:
 * `packages/website/src/modules/marktwin/marktwin.service.mts`.
 */
export function toggleWrapped(text: string, range: Range, open: string, close: string): TextAndRange {
	let { start, end } = range;

	// The selection swallowed the markers: work on what is inside them instead.
	if (
		end - start >= open.length + close.length &&
		text.slice(start, start + open.length) === open &&
		text.slice(end - close.length, end) === close
	) {
		start += open.length;
		end -= close.length;
	}

	if (
		start >= open.length &&
		text.slice(start - open.length, start) === open &&
		text.slice(end, end + close.length) === close
	) {
		text = text.slice(0, start - open.length) + text.slice(start, end) + text.slice(end + close.length);
		start -= open.length;
		end -= open.length;
	} else {
		text = text.slice(0, start) + open + text.slice(start, end) + close + text.slice(end);
		start += open.length;
		end += open.length;
	}

	return { text, range: { start, end } };
}

/**
 * Turn the selection into a link and select the address, so it can be typed straight over.
 * Without a selection, `defaultLabel` stands in for the text.
 *
 * `[label](address)` is the only link syntax Marktwin understands — a bare URL stays text.
 */
export function insertLink(text: string, range: Range, protocol: string, defaultLabel: string): TextAndRange {
	const placeholder = `${protocol}://`;
	// An empty label would render an invisible link.
	const label = text.slice(range.start, range.end) || defaultLabel;
	const opening = `[${label}](`;

	return {
		text: text.slice(0, range.start) + opening + placeholder + ')' + text.slice(range.end),
		range: {
			start: range.start + opening.length,
			end: range.start + opening.length + placeholder.length
		}
	};
}

/** Line breaks to add so that `[start, end)` sits on lines of its own. */
function ownLines(text: string, range: Range): { before: string; after: string } {
	return {
		before: range.start > 0 && text[range.start - 1] !== '\n' ? '\n' : '',
		after: range.end < text.length && text[range.end] !== '\n' ? '\n' : ''
	};
}

/**
 * Put the selection in a `[tag]…[/tag]` block on lines of its own.
 *
 * With an `argument` (`[quote=author]`, `[rp=name]`, `[collapse=label]`), the argument is
 * selected afterwards so it can be typed over; otherwise the selected text stays selected.
 */
export function wrapBlock(text: string, range: Range, tag: string, argument?: string): TextAndRange {
	const { before, after } = ownLines(text, range);
	const head = argument === undefined ? `[${tag}]` : `[${tag}=${argument}]`;
	const body = text.slice(range.start, range.end);
	const start = range.start + before.length;

	return {
		text: text.slice(0, range.start) + before + head + body + `[/${tag}]` + after + text.slice(range.end),
		range:
			argument === undefined
				? { start: start + head.length, end: start + head.length + body.length }
				: { start: start + tag.length + 2, end: start + tag.length + 2 + argument.length }
	};
}

/** Put the selection in a fenced code block; the code inside stays selected. */
export function wrapCode(text: string, range: Range): TextAndRange {
	const { before, after } = ownLines(text, range);
	const body = text.slice(range.start, range.end);
	const start = range.start + before.length + 4;

	return {
		text: text.slice(0, range.start) + before + '```\n' + body + '\n```' + after + text.slice(range.end),
		range: { start, end: start + body.length }
	};
}

/** Turn each selected line into a list item; the first item is selected afterwards. */
export function wrapList(text: string, range: Range, ordered: boolean): TextAndRange {
	const { before, after } = ownLines(text, range);
	const tag = ordered ? 'ol' : 'ul';
	const lines = text
		.slice(range.start, range.end)
		.split('\n')
		.map(line => line.trim())
		.filter((line, index, all) => line.length > 0 || all.length === 1);
	const items = lines.map(line => `[li]${line}[/li]`).join('\n');
	const firstItem = range.start + before.length + `[${tag}]\n[li]`.length;

	return {
		text: text.slice(0, range.start) + before + `[${tag}]\n` + items + `\n[/${tag}]` + after + text.slice(range.end),
		range: { start: firstItem, end: firstItem + lines[0].length }
	};
}
