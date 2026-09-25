<template>
	<div class="forum-editor">
		<div class="toolbar" v-if="tools.length > 0">
			<button
				v-for="tool in tools"
				:key="tool.name"
				type="button"
				class="tool"
				:class="tool.name"
				:disabled="disabled"
				:title="$t(`forum.editor.${tool.name}`)"
				@click="apply(tool)"
			>
				{{ tool.label }}
			</button>
		</div>
		<textarea
			ref="input"
			:id="fieldId"
			:rows="rows"
			:placeholder="placeholder"
			:disabled="disabled"
			:value="modelValue"
			@input="onInput"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ForumGrammar } from '@drpg/core/models/forum/Forum';

interface Range {
	start: number;
	end: number;
}

interface TextAndRange {
	text: string;
	range: Range;
}

interface Tool {
	name: string;
	label: string;
	/** Markers to wrap the selection with, or `null` for a tool that builds its own text. */
	open: string | null;
	close: string | null;
}

/**
 * Put `open`/`close` around the selection, or take them away when they are already there.
 *
 * Ported from Eternaltwin's own editor so the two agree on what a marker looks like:
 * `packages/website/src/modules/marktwin/marktwin.service.mts`.
 */
function toggleWrapped(text: string, range: Range, open: string, close: string): TextAndRange {
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
 *
 * `[label](address)` is the only link syntax Marktwin understands — a bare URL stays text.
 */
function insertLink(text: string, range: Range, protocol: string): TextAndRange {
	const placeholder = `${protocol}://`;
	const opening = `[${text.slice(range.start, range.end)}](`;

	return {
		text: text.slice(0, range.start) + opening + placeholder + ')' + text.slice(range.end),
		range: {
			start: range.start + opening.length,
			end: range.start + opening.length + placeholder.length
		}
	};
}

/**
 * A Marktwin field.
 *
 * Deliberately not `common/Editor.vue`: that one is CKEditor and produces HTML, which Eternaltwin's
 * Marktwin parser does not read.
 *
 * The toolbar is drawn from the grammar the server serves in `ForumSectionSelf`, never from the
 * player's roles: markup offered here but disabled there is dropped on save without a word, and
 * only the server knows which is which. No grammar in hand means no toolbar at all.
 */
export default defineComponent({
	name: 'ForumEditor',
	props: {
		modelValue: { type: String, default: '' },
		/** Id put on the textarea itself, so a `<label for>` reaches the field and not the wrapper. */
		fieldId: { type: String, default: undefined },
		grammar: { type: Object as PropType<ForumGrammar | undefined>, default: undefined },
		rows: { type: Number, default: 6 },
		placeholder: { type: String, default: '' },
		disabled: { type: Boolean, default: false }
	},
	emits: ['update:modelValue'],
	computed: {
		tools(): Tool[] {
			const grammar = this.grammar;
			if (!grammar) return [];

			const tools: Tool[] = [];
			// `[mod]` and `[admin]` are never offered: they say who is speaking, and the server
			// grants them to a browser session only — never to a token, whatever its scope.
			if (grammar.strong) tools.push({ name: 'strong', label: 'B', open: '**', close: '**' });
			if (grammar.emphasis) tools.push({ name: 'emphasis', label: 'I', open: '_', close: '_' });
			if (grammar.strikethrough) tools.push({ name: 'strikethrough', label: 'S', open: '~~', close: '~~' });
			if (grammar.links.length > 0) tools.push({ name: 'link', label: '🔗', open: null, close: null });

			return tools;
		},
		linkProtocol(): string {
			const links = this.grammar?.links ?? [];
			return links.includes('https') ? 'https' : links[0];
		}
	},
	methods: {
		onInput(event: Event) {
			this.$emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
		},
		async apply(tool: Tool) {
			const input = this.$refs.input as HTMLTextAreaElement | undefined;
			if (!input) return;

			const range: Range = { start: input.selectionStart ?? 0, end: input.selectionEnd ?? 0 };
			const updated =
				tool.open === null || tool.close === null
					? insertLink(this.modelValue, range, this.linkProtocol)
					: toggleWrapped(this.modelValue, range, tool.open, tool.close);

			this.$emit('update:modelValue', updated.text);

			// The value is the parent's, so the textarea only holds the new text after it has
			// re-rendered — and putting the caret back before that would move it in the old one.
			await this.$nextTick();
			input.selectionStart = updated.range.start;
			input.selectionEnd = updated.range.end;
			input.focus();
		}
	}
});
</script>

<style scoped lang="scss">
.forum-editor {
	display: flex;
	flex-direction: column;
	gap: 4px;
	width: 100%;
	.toolbar {
		display: flex;
		gap: 4px;
	}
	.tool {
		background-color: #ae6139;
		color: #ffee92;
		border: 1px solid #ffee92;
		cursor: pointer;
		min-width: 26px;
		padding: 2px 6px;
		font-size: 13px;
		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
		&:hover:not(:disabled) {
			background-color: #b05733;
		}
		&.strong {
			font-weight: bold;
		}
		&.emphasis {
			font-style: italic;
		}
		&.strikethrough {
			text-decoration: line-through;
		}
	}
	textarea {
		background-color: #b05733;
		outline: 1px solid transparent;
		color: #ffee92;
		font-weight: 400;
		font-size: 16px;
		outline-offset: 2px;
		width: 100%;
		border: none;
		padding-left: 4px;
		resize: vertical;
		&:focus {
			transition: outline-color 0.5s;
			outline-color: #efdba8;
		}
	}
}
</style>
