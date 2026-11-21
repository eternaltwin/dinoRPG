<template>
	<div
		class="fight-timeline"
		:class="{ seeking }"
		role="group"
		:aria-label="$t('fight.timeline.label')"
		data-testid="fight-timeline"
		@keydown.left.prevent="step(-1)"
		@keydown.right.prevent="step(1)"
		@keydown.home.prevent="emit('seek', 0)"
		@keydown.end.prevent="emit('seek', last)"
	>
		<button
			type="button"
			class="control"
			:title="$t('fight.timeline.start')"
			:disabled="shown <= 0"
			@click="emit('seek', 0)"
		>
			<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2h2v8H2zM11 2v8L5 6z" /></svg>
		</button>
		<button
			type="button"
			class="control"
			:title="$t('fight.timeline.previous')"
			:disabled="shown <= 0"
			@click="step(-1)"
		>
			<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M9 2v8L3 6z" /></svg>
		</button>

		<div class="track">
			<div class="rail">
				<div class="fill" :style="{ width: percent(shown) }"></div>
				<button
					v-for="marker in markers"
					:key="marker.step"
					type="button"
					class="marker"
					:class="marker.side ? 'right' : 'left'"
					:style="{ left: percent(marker.step) }"
					:title="$t('fight.timeline.death', { name: marker.name })"
					tabindex="-1"
					@click="emit('seek', marker.step)"
				></button>
			</div>
			<input
				class="slider"
				type="range"
				min="0"
				:max="last"
				:value="shown"
				:aria-label="$t('fight.timeline.label')"
				:aria-valuetext="$t('fight.timeline.counter', { current: shown + 1, total })"
				@input="onInput"
				@change="dragged = undefined"
			/>
		</div>

		<button type="button" class="control" :title="$t('fight.timeline.next')" :disabled="shown >= last" @click="step(1)">
			<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2v8l6-4z" /></svg>
		</button>
		<button
			type="button"
			class="control"
			:title="$t('fight.timeline.end')"
			:disabled="shown >= last"
			@click="emit('seek', last)"
		>
			<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 2v8l6-4zM8 2h2v8H8z" /></svg>
		</button>

		<span class="counter">
			<img v-if="seeking" class="hourglass" :src="getImgURL('icons', 'hourglass')" alt="" />
			{{ $t('fight.timeline.counter', { current: shown + 1, total }) }}
		</span>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface FightTimelineMarker {
	/** Index of the step in the fight (the index given to `Fight.seek`). */
	step: number;
	/** Name of the fighter who dies at this step. */
	name: string;
	/** Side of the fighter: false on the left, true on the right. */
	side: boolean;
}

const props = defineProps<{
	/** Index of the step being played, -1 before the fight starts. */
	current: number;
	/** Number of steps of the fight. */
	total: number;
	seeking: boolean;
	markers: FightTimelineMarker[];
}>();
const emit = defineEmits<{ (e: 'seek', step: number): void }>();

// Value of the slider while the player drags it, so the thumb does not jump back between two steps of the seek
const dragged = ref<number>();

const last = computed(() => Math.max(props.total - 1, 0));
const shown = computed(() => dragged.value ?? Math.max(props.current, 0));

function percent(stepIdx: number): string {
	return last.value === 0 ? '0%' : `${(stepIdx / last.value) * 100}%`;
}

function step(delta: number) {
	const target = Math.min(Math.max(shown.value + delta, 0), last.value);
	if (target !== shown.value) emit('seek', target);
}

function onInput(event: Event) {
	dragged.value = Number((event.target as HTMLInputElement).value);
	emit('seek', dragged.value);
}
</script>

<style lang="scss" scoped>
$parchment: #fce3bc;
$wood: #874a16;
$brick: #bc683c;
$gold: #ffee92;

.fight-timeline {
	display: flex;
	align-items: center;
	gap: 3px;
	// Canvas width, shrunk on narrow screens
	width: 100%;
	max-width: 488px;
	box-sizing: border-box;
	padding: 4px 6px;
	background-color: $parchment;
	border-bottom: 1px solid $wood;
	font-size: 8pt;
	color: $wood;

	&.seeking .fill {
		opacity: 0.6;
	}
}

.control {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 20px;
	height: 18px;
	padding: 0;
	border: 1px solid $gold;
	outline: 1px solid $brick;
	background-color: #d65536;
	cursor: pointer;

	svg {
		width: 10px;
		height: 10px;
		fill: $gold;
	}

	&:hover:not(:disabled),
	&:focus-visible {
		background-color: #b0dd00;

		svg {
			fill: white;
		}
	}

	&:disabled {
		filter: grayscale(100%);
		opacity: 0.6;
		cursor: default;
	}
}

.track {
	position: relative;
	flex: 1;
	// The range input must not keep its intrinsic width on narrow screens
	min-width: 0;
	height: 18px;
	margin: 0 6px;
}

.rail {
	position: absolute;
	top: 6px;
	left: 0;
	right: 0;
	height: 6px;
	border: 1px solid $wood;
	border-radius: 3px;
	background-color: #e8c08a;
	box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25);
}

.fill {
	height: 100%;
	border-radius: 2px;
	background: linear-gradient(to bottom, #f0a050, $brick);
}

.marker {
	position: absolute;
	top: -5px;
	z-index: 2;
	width: 6px;
	height: 14px;
	margin-left: -3px;
	padding: 0;
	border: 1px solid $wood;
	border-radius: 1px;
	cursor: pointer;

	&.left {
		background-color: #2a7ac0;
	}

	&.right {
		background-color: #c5482c;
	}

	&:hover {
		transform: scaleY(1.25);
	}
}

.slider {
	position: absolute;
	inset: 0;
	z-index: 1;
	width: 100%;
	height: 100%;
	margin: 0;
	background: transparent;
	cursor: pointer;
	appearance: none;

	&::-webkit-slider-runnable-track {
		height: 18px;
		background: transparent;
	}

	&::-moz-range-track {
		height: 18px;
		background: transparent;
	}

	&::-webkit-slider-thumb {
		width: 10px;
		height: 18px;
		border: 1px solid $gold;
		outline: 1px solid $wood;
		border-radius: 2px;
		background-color: $brick;
		appearance: none;
	}

	&::-moz-range-thumb {
		width: 8px;
		height: 16px;
		border: 1px solid $gold;
		outline: 1px solid $wood;
		border-radius: 2px;
		background-color: $brick;
	}

	&:focus-visible::-webkit-slider-thumb {
		background-color: #b0dd00;
	}

	&:focus-visible::-moz-range-thumb {
		background-color: #b0dd00;
	}
}

.counter {
	display: inline-flex;
	align-items: center;
	gap: 3px;
	flex: none;
	min-width: 58px;
	justify-content: flex-end;
	font-weight: bold;
	font-variant: small-caps;
	white-space: nowrap;
}
</style>
