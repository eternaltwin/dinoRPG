<template>
	<div class="dz-select" :class="{ open }">
		<button
			ref="triggerRef"
			type="button"
			class="trigger"
			:id="id"
			@click="toggle"
			@keydown.down.prevent="focusNext()"
			@keydown.up.prevent="focusPrev()"
			@keydown.enter.prevent="commitFocused()"
			@keydown.esc.prevent="close"
		>
			<span class="label">{{ currentLabel }}</span>
			<span class="arrow" />
		</button>

		<ul v-if="open" class="panel drpg-scrollbar" role="listbox" :aria-labelledby="id">
			<li
				v-for="(option, i) in options"
				:key="String(option.value)"
				:class="['opt', { selected: isSelected(option.value), focused: i === focusedIndex }]"
				@mouseenter="focusedIndex = i"
				@mouseleave="focusedIndex = -1"
				@mousedown.prevent="select(option.value, $event)"
				role="option"
				:aria-selected="isSelected(option.value)"
			>
				{{ option.label }}
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts" generic="T extends string | number">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export type SelectOption<T extends string | number> = {
	value: T;
	label: string;
};

const props = defineProps<{
	id: string;
	modelValue?: T;
	options: SelectOption<T>[];
}>();

const emit = defineEmits<{ 'update:modelValue': [value: T]; change: [] }>();

const open = ref(false);
const focusedIndex = ref(-1);
const triggerRef = ref<HTMLButtonElement>();

const currentLabel = computed(() => {
	const found = props.options.find(o => o.value === props.modelValue);
	return found ? found.label : '';
});

const isSelected = (v: T) => {
	return v === props.modelValue;
};

const select = (v: T, e?: MouseEvent) => {
	if (e && e.button !== 0) return; // Only left click

	emit('update:modelValue', v);
	emit('change');
	close();
};

const toggle = () => {
	if (open.value) {
		close();
		return;
	}

	open.value = true;
	alignFocused();
};

const close = () => {
	open.value = false;
	focusedIndex.value = -1;
	// Drop focus when closing
	triggerRef.value?.blur();
};

const alignFocused = () => {
	const idx = props.options.findIndex(o => o.value === props.modelValue);
	focusedIndex.value = idx >= 0 ? idx : 0;
};

const focusNext = () => {
	if (!open.value) {
		open.value = true;
		alignFocused();
		return;
	}
	focusedIndex.value = (focusedIndex.value + 1) % props.options.length;
};

const focusPrev = () => {
	if (!open.value) {
		open.value = true;
		alignFocused();
		return;
	}
	focusedIndex.value = (focusedIndex.value - 1 + props.options.length) % props.options.length;
};

const commitFocused = () => {
	if (open.value && focusedIndex.value >= 0) {
		select(props.options[focusedIndex.value].value);
	}
};

const handleClickOutside = (e: MouseEvent) => {
	if (!open.value) return;
	if (!(e.target instanceof Node)) return;
	if (e.button !== 0) return;

	// Quick containment check:
	const container = document.getElementById(props.id)?.parentElement;
	if (container && !container.contains(e.target)) close();
};

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside));
</script>

<style scoped lang="scss">
.dz-select {
	position: relative;
	display: inline-block;
	min-width: 80px;
	font-size: 9pt;
	color: #ffee92;

	.trigger {
		width: 100%;
		min-height: 22px;
		padding: 2px 24px 0 8px;
		font: inherit;
		color: inherit;
		font-weight: bold;
		background:
			url('../../assets/design/form_field_right.webp') right top / auto 100% no-repeat,
			url('../../assets/design/form_field_left.webp') left top / auto 100% no-repeat,
			url('../../assets/design/form_field_middle.webp') left top / auto 100% repeat-x;
		border: none;
		cursor: pointer;
		appearance: none;
		text-align: left;
		position: relative;
		&:focus {
			outline: none;
			background:
				url('../../assets/design/form_field_right_hover.webp') right top / auto 100% no-repeat,
				url('../../assets/design/form_field_left_hover.webp') left top / auto 100% no-repeat,
				url('../../assets/design/form_field_middle_hover.webp') left top / auto 100% repeat-x;
		}
	}

	.arrow {
		position: absolute;
		top: 50%;
		right: 4px;
		width: 12px;
		height: 12px;
		background: url('../../assets/icons/down.png') center / contain no-repeat;
		transform: translateY(-50%) rotate(0deg);
		transition: transform 0.2s ease;
		pointer-events: none;
	}

	&.open .arrow {
		transform: translateY(-50%) rotate(180deg);
	}

	.panel {
		position: absolute;
		z-index: 20;
		left: 0;
		top: calc(100% + 2px);
		min-width: 100%;
		max-height: 200px;
		overflow-y: auto;
		padding: 0;
		margin: 0;
		list-style: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
	}

	.opt {
		position: relative;
		font-size: 9pt;
		padding-right: 5px;
		padding-top: 1px;
		padding-bottom: 1px;
		background-image: url('../../assets/background/table_cell.webp');
		background-position: 0px 0px;
		padding-left: 15px;
		border: 1px solid #c88f44;
		cursor: pointer;
		white-space: nowrap;
		color: #bc683c;

		// Darkening overlay
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: rgba(0, 0, 0, 0); // default no darkening
			transition: background 120ms ease;
			pointer-events: none;
			mix-blend-mode: multiply;
		}

		&.selected {
			color: #710;

			&::before {
				background: rgba(0, 0, 0, 0.1);
			}
		}
		&.focused:not(.selected)::before {
			background: rgba(0, 0, 0, 0.1);
		}
		&:active::before {
			background: rgba(0, 0, 0, 0.1);
		}
	}
}
</style>
