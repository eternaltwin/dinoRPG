<template>
	<div class="tick-bar" data-testid="tick-bar">
		<div
			class="gauge"
			role="progressbar"
			:aria-valuenow="Math.round(progress * 100)"
			aria-valuemin="0"
			aria-valuemax="100"
		>
			<div class="fill" :style="{ width: `${progress * 100}%` }"></div>
			<span class="label">{{ $t('clanChampionship.nextTick', { time: remainingLabel }) }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { BOARD_TICK_MINUTES } from '@drpg/core/models/clan/clanChampionship';

const TICK_MS = BOARD_TICK_MINUTES * 60 * 1000;

const props = defineProps<{
	startsAt: Date | string;
	endsAt: Date | string;
}>();

const now = ref(Date.now());
const timer = setInterval(() => (now.value = Date.now()), 1000);
onBeforeUnmount(() => clearInterval(timer));

/** Ticks fall every TICK_MS from the kick-off; the last one is at the end of the match. */
const nextTickAt = computed(() => {
	const start = new Date(props.startsAt).getTime();
	const elapsed = Math.max(0, now.value - start);
	const next = start + (Math.floor(elapsed / TICK_MS) + 1) * TICK_MS;
	return Math.min(next, new Date(props.endsAt).getTime());
});

const remainingMs = computed(() => Math.max(0, nextTickAt.value - now.value));
const progress = computed(() => Math.min(1, Math.max(0, 1 - remainingMs.value / TICK_MS)));

const remainingLabel = computed(() => {
	const total = Math.ceil(remainingMs.value / 1000);
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
});
</script>

<style lang="scss" scoped>
.tick-bar {
	display: flex;
	justify-content: center;
}
.gauge {
	position: relative;
	box-sizing: border-box;
	width: min(100%, 460px);
	height: 18px;
	border: 1px solid #874a16;
	border-radius: 999px;
	background-color: #f3ca92;
	overflow: hidden;
}
.fill {
	height: 100%;
	background: linear-gradient(to bottom, #f0a25a, #bc693c);
}
.label {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.8em;
	font-weight: bold;
	color: #4a2508;
}
</style>
