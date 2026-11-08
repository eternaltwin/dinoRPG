<template>
	<div class="mkt-editor" :class="{ 'is-disabled': disabled, 'is-focused': focused }">
		<div class="bar">
			<div v-if="groups.length > 0" class="tools" role="toolbar" :aria-label="$t('editor.toolbar')">
				<div v-for="(group, index) in groups" :key="index" class="group">
					<button
						v-for="tool in group"
						:key="tool.name"
						type="button"
						class="tool"
						:class="`tool--${tool.name}`"
						:disabled="disabled || tab === 'preview'"
						:title="toolTitle(tool)"
						:aria-label="toolTitle(tool)"
						@mousedown.prevent
						@click="apply(tool)"
					>
						<svg v-if="tool.icon" viewBox="0 0 16 16" aria-hidden="true" v-html="tool.icon" />
						<span v-else aria-hidden="true">{{ tool.glyph }}</span>
					</button>
				</div>
			</div>

			<div class="tabs" role="tablist">
				<button
					type="button"
					role="tab"
					:aria-selected="tab === 'write'"
					:class="{ active: tab === 'write' }"
					@click="showWrite()"
				>
					{{ $t('editor.write') }}
				</button>
				<button
					type="button"
					role="tab"
					:aria-selected="tab === 'preview'"
					:class="{ active: tab === 'preview' }"
					@click="showPreview()"
				>
					{{ $t('editor.preview') }}
				</button>
			</div>
		</div>

		<textarea
			v-show="tab === 'write'"
			ref="input"
			class="sheet"
			:id="fieldId"
			:rows="rows"
			:placeholder="placeholder"
			:disabled="disabled"
			:maxlength="maxlength"
			:value="modelValue"
			@input="onInput"
			@keydown="onKeydown"
			@focus="focused = true"
			@blur="focused = false"
		/>
		<div
			v-if="tab === 'preview'"
			class="sheet preview"
			:style="{ minHeight: `${rows * 1.5 + 1}em` }"
			aria-live="polite"
		>
			<p v-if="previewError" class="preview-note">{{ $t('editor.previewError') }}</p>
			<p v-else-if="modelValue.trim().length === 0" class="preview-note">{{ $t('editor.previewEmpty') }}</p>
			<div v-else class="mkt-content" v-html="sanitizeHtml(previewHtml)" />
		</div>

		<div class="foot">
			<button
				v-if="examples.length > 0"
				type="button"
				class="help-toggle"
				:aria-expanded="helpOpen"
				@click="helpOpen = !helpOpen"
			>
				{{ $t('editor.help') }}
			</button>
			<span v-if="submitHint" class="hint">{{ $t('editor.submitHint') }}</span>
			<span v-if="maxlength" class="counter" :class="{ near: modelValue.length > maxlength * 0.9 }">
				{{ $t('editor.counter', { count: modelValue.length, max: maxlength }) }}
			</span>
		</div>

		<dl v-if="helpOpen" class="help">
			<template v-for="example in examples" :key="example.name">
				<dt>
					<code>{{ example.syntax }}</code>
				</dt>
				<dd>{{ $t(`editor.tool.${example.name}`) }}</dd>
			</template>
		</dl>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MarktwinGrammar } from '@drpg/core/utils/marktwin';
import { renderMarktwin } from '../../utils/marktwin';
import {
	insertLink,
	Range,
	TextAndRange,
	toggleWrapped,
	wrapBlock,
	wrapCode,
	wrapList
} from '../../utils/marktwinEdit';

interface Tool {
	name: string;
	/** Inline SVG paths drawn in a 16×16 box, or a typographic glyph when the letter says it best. */
	icon?: string;
	glyph?: string;
	/** `b` for Ctrl/Cmd+B. */
	shortcut?: string;
	/** What the markup looks like, for the help panel. */
	syntax: string;
	edit(text: string, range: Range): TextAndRange;
}

const props = withDefaults(
	defineProps<{
		modelValue?: string;
		/**
		 * What the server will keep. The toolbar is drawn from it and nothing else: markup offered
		 * here but refused there would be dropped on save without a word. No grammar, no toolbar.
		 */
		grammar?: MarktwinGrammar;
		/** Id put on the textarea itself, so a `<label for>` reaches the field and not the wrapper. */
		fieldId?: string;
		rows?: number;
		placeholder?: string;
		disabled?: boolean;
		maxlength?: number;
		/** Show the Ctrl+Enter hint; the shortcut emits `submit` either way. */
		submitHint?: boolean;
	}>(),
	{ modelValue: '', rows: 6, placeholder: '', disabled: false, submitHint: true }
);

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void;
	(e: 'submit'): void;
}>();

const { t } = useI18n();

const input = ref<HTMLTextAreaElement | null>(null);
const tab = ref<'write' | 'preview'>('write');
const focused = ref(false);
const helpOpen = ref(false);
const previewHtml = ref('');
const previewError = ref(false);

const stroke = (d: string) =>
	`<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;

const groups = computed<Tool[][]>(() => {
	const g = props.grammar;
	if (!g) return [];

	const wrap =
		(open: string, close = open) =>
		(text: string, range: Range) =>
			toggleWrapped(text, range, open, close);

	// `[mod]`, `[admin]`, `[animation]` and `[announcement]` are never offered: they say who is
	// speaking, and the server alone decides who may.
	const spans: Tool[] = [];
	if (g.strong) spans.push({ name: 'strong', glyph: 'B', shortcut: 'b', syntax: '**…**', edit: wrap('**') });
	if (g.emphasis) spans.push({ name: 'emphasis', glyph: 'I', shortcut: 'i', syntax: '_…_', edit: wrap('_') });
	if (g.underline) spans.push({ name: 'underline', glyph: 'U', shortcut: 'u', syntax: '__…__', edit: wrap('__') });
	if (g.strikethrough) spans.push({ name: 'strikethrough', glyph: 'S', syntax: '~~…~~', edit: wrap('~~') });
	if (g.big) spans.push({ name: 'big', glyph: 'A', syntax: '[big]…[/big]', edit: wrap('[big]', '[/big]') });
	if (g.bad) spans.push({ name: 'bad', glyph: 'A', syntax: '[bad]…[/bad]', edit: wrap('[bad]', '[/bad]') });
	if (g.spoiler)
		spans.push({
			name: 'spoiler',
			icon: stroke('M2 8s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4Z M3 13 13 3'),
			syntax: '||…||',
			edit: wrap('||')
		});
	if (g.code)
		spans.push({
			name: 'code',
			icon: stroke('M5.5 4.5 2 8l3.5 3.5 M10.5 4.5 14 8l-3.5 3.5'),
			syntax: '`…`',
			edit: wrap('`')
		});

	const blocks: Tool[] = [];
	if (g.quote)
		blocks.push({
			name: 'quote',
			icon: '<path d="M3 9.5C3 7 4.3 5.3 6.5 4.5l.4.9C5.7 6 5.1 6.9 5 8h1.5v4H3V9.5Zm6 0C9 7 10.3 5.3 12.5 4.5l.4.9c-1.2.6-1.8 1.5-1.9 2.6h1.5v4H9V9.5Z" fill="currentColor"/>',
			syntax: '[quote=…]…[/quote]',
			edit: (text, range) => wrapBlock(text, range, 'quote', t('editor.argument.author'))
		});
	if (g.rp)
		blocks.push({
			name: 'rp',
			icon: stroke('M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2Z'),
			syntax: '[rp=…]…[/rp]',
			edit: (text, range) => wrapBlock(text, range, 'rp', t('editor.argument.character'))
		});
	if (g.sidenote)
		blocks.push({
			name: 'sidenote',
			icon: stroke('M3 2.5h7l3 3v8H3Z M10 2.5v3h3 M5.5 8.5h5 M5.5 11h3'),
			syntax: '[aparte]…[/aparte]',
			edit: (text, range) => wrapBlock(text, range, 'aparte')
		});
	if (g.collapse)
		blocks.push({
			name: 'collapse',
			icon: stroke('M2.5 3.5h11 M5 7l3 3 3-3 M2.5 13h11'),
			syntax: '[collapse=…]…[/collapse]',
			edit: (text, range) => wrapBlock(text, range, 'collapse', t('editor.argument.title'))
		});
	if (g.list) {
		blocks.push({
			name: 'list',
			icon:
				stroke('M6.5 4h7 M6.5 8h7 M6.5 12h7') +
				'<circle cx="3" cy="4" r="1.1" fill="currentColor"/><circle cx="3" cy="8" r="1.1" fill="currentColor"/><circle cx="3" cy="12" r="1.1" fill="currentColor"/>',
			syntax: '[ul][li]…[/li][/ul]',
			edit: (text, range) => wrapList(text, range, false)
		});
		blocks.push({
			name: 'orderedList',
			icon: stroke('M6.5 4h7 M6.5 8h7 M6.5 12h7 M2.5 3l1-.5v3 M2.3 10h1.8l-1.8 2.5h1.9'),
			syntax: '[ol][li]…[/li][/ol]',
			edit: (text, range) => wrapList(text, range, true)
		});
	}
	if (g.code)
		blocks.push({
			name: 'codeBlock',
			icon: stroke('M2.5 2.5h11v11h-11Z M5 6l2 2-2 2 M8.5 10.5H11'),
			syntax: '```…```',
			edit: wrapCode
		});

	const links: Tool[] = [];
	if (g.links.length > 0) {
		const protocol = g.links.includes('https') ? 'https' : g.links[0];
		links.push({
			name: 'link',
			icon: stroke(
				'M7 9a2.5 2.5 0 0 0 3.5 0l2.5-2.5A2.5 2.5 0 0 0 9.5 3L8.8 3.7 M9 7a2.5 2.5 0 0 0-3.5 0L3 9.5A2.5 2.5 0 0 0 6.5 13l.7-.7'
			),
			shortcut: 'k',
			syntax: '[…](https://…)',
			edit: (text, range) => insertLink(text, range, protocol, t('editor.argument.linkText'))
		});
	}

	return [spans, blocks, links].filter(group => group.length > 0);
});

const tools = computed(() => groups.value.flat());
const examples = computed(() =>
	tools.value.filter((tool, i, all) => all.findIndex(o => o.syntax === tool.syntax) === i)
);

function toolTitle(tool: Tool): string {
	const label = t(`editor.tool.${tool.name}`);
	return tool.shortcut ? `${label} (Ctrl+${tool.shortcut.toUpperCase()})` : label;
}

function onInput(event: Event) {
	emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
}

async function apply(tool: Tool) {
	const field = input.value;
	if (!field || props.disabled) return;

	const range: Range = { start: field.selectionStart ?? 0, end: field.selectionEnd ?? 0 };
	const updated = tool.edit(props.modelValue, range);
	if (props.maxlength && updated.text.length > props.maxlength) return;

	emit('update:modelValue', updated.text);

	// The value is the parent's, so the textarea only holds the new text after it has
	// re-rendered — and putting the caret back before that would move it in the old one.
	await nextTick();
	field.focus();
	field.setSelectionRange(updated.range.start, updated.range.end);
}

function onKeydown(event: KeyboardEvent) {
	if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

	if (event.key === 'Enter') {
		event.preventDefault();
		emit('submit');
		return;
	}
	const tool = tools.value.find(candidate => candidate.shortcut === event.key.toLowerCase());
	if (tool) {
		event.preventDefault();
		apply(tool);
	}
}

async function refreshPreview() {
	if (!props.grammar) {
		previewHtml.value = '';
		return;
	}
	try {
		previewHtml.value = await renderMarktwin(props.grammar, props.modelValue);
		previewError.value = false;
	} catch (error) {
		console.error(error);
		previewError.value = true;
	}
}

async function showPreview() {
	tab.value = 'preview';
	await refreshPreview();
}

async function showWrite() {
	tab.value = 'write';
	await nextTick();
	input.value?.focus();
}

// The parent may clear or replace the text while the preview is open (after sending, say).
watch(
	() => props.modelValue,
	() => {
		if (tab.value === 'preview') refreshPreview();
	}
);

// Back to writing once the message is gone, so the next one starts in the field.
watch(
	() => props.modelValue === '',
	empty => {
		if (empty) tab.value = 'write';
	}
);

defineExpose({
	focus: () => showWrite()
});
</script>

<style scoped lang="scss">
// The sheet is the parchment a post is read on, so what is written already looks like what will
// be read. The bar around it is the clay and wood of the game's own panels.
.mkt-editor {
	--wood: #8e3e26;
	--clay: #ae6139;
	--gold: #ffee92;
	--parchment: #f6d19a;
	--ink: #710;

	display: flex;
	flex-direction: column;
	width: 100%;
	border: 1px solid var(--wood);
	background: var(--clay);
	box-shadow: inset 0 0 0 1px rgba(255, 238, 146, 0.25);
	&.is-focused {
		box-shadow:
			inset 0 0 0 1px rgba(255, 238, 146, 0.25),
			0 0 0 2px rgba(249, 200, 37, 0.6);
	}
	&.is-disabled {
		opacity: 0.7;
	}
}

.bar {
	display: flex;
	flex-wrap: wrap;
	align-items: stretch;
	justify-content: space-between;
	gap: 4px;
	padding: 3px 3px 0;
}

.tools {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	padding-bottom: 3px;
}
.group {
	display: flex;
	gap: 1px;
	padding: 1px;
	border-radius: 3px;
	background: rgba(0, 0, 0, 0.18);
}
.tool {
	display: grid;
	place-items: center;
	width: 26px;
	height: 24px;
	padding: 0;
	border: none;
	border-radius: 2px;
	background: transparent;
	color: var(--gold);
	font: inherit;
	font-size: 14px;
	line-height: 1;
	cursor: pointer;
	svg {
		width: 16px;
		height: 16px;
	}
	&:hover:not(:disabled) {
		background: rgba(255, 238, 146, 0.18);
	}
	&:active:not(:disabled) {
		background: rgba(0, 0, 0, 0.2);
	}
	&:focus-visible {
		outline: 2px solid var(--gold);
		outline-offset: -2px;
	}
	&:disabled {
		cursor: default;
		opacity: 0.45;
	}
	&--strong span {
		font-weight: 800;
	}
	&--emphasis span {
		font-style: italic;
		font-family: Georgia, serif;
	}
	&--underline span {
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	&--strikethrough span {
		text-decoration: line-through;
	}
	&--big span {
		font-size: 17px;
		font-weight: 800;
	}
	&--bad span {
		text-decoration: underline wavy #ff9b7a;
		text-underline-offset: 3px;
	}
}

// Folder tabs: the active one is cut from the same parchment as the sheet below it.
.tabs {
	display: flex;
	align-items: flex-end;
	gap: 2px;
	margin-left: auto;
	button {
		padding: 4px 10px 3px;
		border: none;
		border-radius: 3px 3px 0 0;
		background: rgba(0, 0, 0, 0.18);
		color: var(--gold);
		font: inherit;
		font-size: 12px;
		cursor: pointer;
		&:hover:not(.active) {
			background: rgba(255, 238, 146, 0.18);
		}
		&.active {
			background: var(--parchment);
			color: var(--ink);
			font-weight: bold;
		}
		&:focus-visible {
			outline: 2px solid var(--gold);
			outline-offset: -2px;
		}
	}
}

.sheet {
	display: block;
	width: 100%;
	box-sizing: border-box;
	margin: 0;
	padding: 8px 10px;
	border: none;
	border-top: 1px solid var(--wood);
	background: var(--parchment);
	color: var(--ink);
	font: inherit;
	font-size: 15px;
	line-height: 1.5;
}
textarea.sheet {
	resize: vertical;
	outline: none;
	&::placeholder {
		color: rgba(119, 17, 0, 0.45);
	}
}
.preview {
	max-height: 60vh;
	overflow-y: auto;
}
.preview-note {
	margin: 0;
	font-style: italic;
	color: #bc683c;
}

.foot {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 4px 12px;
	padding: 3px 6px;
	font-size: 11px;
	color: #fce4b0;
	.help-toggle {
		padding: 0;
		border: none;
		background: none;
		color: var(--gold);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
		&:focus-visible {
			outline: 2px solid var(--gold);
		}
	}
	.hint {
		opacity: 0.85;
	}
	.counter {
		margin-left: auto;
		font-variant-numeric: tabular-nums;
		&.near {
			color: var(--gold);
			font-weight: bold;
		}
	}
}

.help {
	display: grid;
	grid-template-columns: max-content 1fr;
	gap: 2px 12px;
	margin: 0;
	padding: 6px 10px 8px;
	border-top: 1px solid rgba(0, 0, 0, 0.2);
	font-size: 12px;
	color: var(--gold);
	dt code {
		white-space: nowrap;
		font-family: ui-monospace, 'Cascadia Mono', Menlo, Consolas, monospace;
		color: #fff7cf;
	}
	dd {
		margin: 0;
	}
}

@media (max-width: 480px) {
	.tabs {
		margin-left: 0;
		width: 100%;
	}
	.foot .hint {
		display: none;
	}
}
</style>
