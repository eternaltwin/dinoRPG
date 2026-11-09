<template>
	<div class="match-timeline" :class="{ history: selectedAt !== null }" data-testid="match-timeline">
		<div
			ref="track"
			class="track"
			role="slider"
			tabindex="0"
			:aria-label="$t('clanChampionship.timeline.label')"
			:aria-valuemin="start"
			:aria-valuemax="reachable"
			:aria-valuenow="selectedAt ?? reachable"
			:aria-valuetext="selectedAt === null ? $t('clanChampionship.timeline.live') : instantLabel(selectedAt)"
			data-testid="match-timeline-track"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
			@pointercancel="onPointerUp"
			@pointerleave="hoverAt = null"
			@keydown="onKey"
		>
			<div class="elapsed" :style="{ width: percentOf(reachable) }" />
			<div
				v-for="(fight, i) in fights"
				:key="i"
				class="fight"
				:style="{ left: percentOf(fight) }"
				data-testid="match-timeline-fight"
			/>
			<div v-if="selectedAt !== null" class="cursor" :style="{ left: percentOf(selectedAt) }" />
			<div v-else-if="status === 'live'" class="head" :style="{ left: percentOf(reachable) }" />
			<span v-if="hoverAt !== null" class="hover" :style="{ left: percentOf(hoverAt) }">{{ elapsed(hoverAt) }}</span>
		</div>
		<div class="legend">
			<span class="bound">{{ elapsed(start) }}</span>
			<span v-if="loading" class="state">{{ $t('clanChampionship.timeline.loading') }}</span>
			<span v-else-if="selectedAt !== null" class="state" data-testid="match-timeline-instant">
				{{ $t('clanChampionship.timeline.viewing', { time: instantLabel(selectedAt) }) }}
			</span>
			<span v-else class="state">{{
				$t(status === 'live' ? 'clanChampionship.timeline.live' : 'clanChampionship.timeline.end')
			}}</span>
			<button
				v-if="selectedAt !== null"
				type="button"
				class="back-live"
				data-testid="match-timeline-live"
				@click="emit('live')"
			>
				{{ $t(status === 'live' ? 'clanChampionship.timeline.backToLive' : 'clanChampionship.timeline.backToEnd') }}
			</button>
			<span v-else class="bound">{{ elapsed(end) }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ClanChampionshipMatchStatus, ReplayFrameDTO } from '@drpg/core/models/clan/clanChampionship';

const props = defineProps<{
	startsAt: Date | string;
	endsAt: Date | string;
	status: ClanChampionshipMatchStatus;
	/** The recorded steps, once loaded: they place the fights on the bar. */
	frames: ReplayFrameDTO[] | null;
	/** The instant shown on the board, `null` for the current board. */
	selectedAt: number | null;
	loading: boolean;
}>();
const emit = defineEmits<{
	(e: 'seek', at: number): void;
	(e: 'step', direction: 1 | -1): void;
	(e: 'live'): void;
}>();

const { locale } = useI18n();

const track = ref<HTMLElement | null>(null);
const hoverAt = ref<number | null>(null);
const dragging = ref(false);
const now = ref(Date.now());
const clock = setInterval(() => (now.value = Date.now()), 1000);
onBeforeUnmount(() => clearInterval(clock));

const start = computed(() => new Date(props.startsAt).getTime());
const end = computed(() => new Date(props.endsAt).getTime());
/** Nothing to go back to past this instant: the present while the match is live. */
const reachable = computed(() =>
	props.status === 'live' ? Math.max(start.value, Math.min(now.value, end.value)) : end.value
);

const fights = computed(() =>
	(props.frames ?? []).flatMap(f => (f.events.some(e => e.type === 'attack') ? [new Date(f.at).getTime()] : []))
);

function percentOf(at: number): string {
	const span = Math.max(1, end.value - start.value);
	return `${Math.max(0, Math.min(1, (at - start.value) / span)) * 100}%`;
}

function timeAt(event: PointerEvent): number {
	const rect = track.value?.getBoundingClientRect();
	if (!rect) return start.value;
	const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width)));
	return start.value + ratio * (end.value - start.value);
}

function onPointerDown(event: PointerEvent) {
	if (event.button !== 0) return;
	dragging.value = true;
	track.value?.setPointerCapture?.(event.pointerId);
	emit('seek', Math.min(timeAt(event), reachable.value));
}

function onPointerMove(event: PointerEvent) {
	const at = Math.min(timeAt(event), reachable.value);
	hoverAt.value = at;
	if (dragging.value) emit('seek', at);
}

function onPointerUp(event: PointerEvent) {
	dragging.value = false;
	track.value?.releasePointerCapture?.(event.pointerId);
}

function onKey(event: KeyboardEvent) {
	if (event.key === 'ArrowLeft') emit('step', -1);
	else if (event.key === 'ArrowRight') emit('step', 1);
	else if (event.key === 'Home') emit('seek', start.value);
	else if (event.key === 'End') emit('live');
	else return;
	event.preventDefault();
}

function elapsed(at: number): string {
	const minutes = Math.max(0, Math.floor((at - start.value) / 60000));
	return `+${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

function instantLabel(at: number): string {
	const date = new Date(at).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' });
	return `${date} (${elapsed(at)})`;
}
</script>

<style lang="scss" scoped>
.match-timeline {
	display: flex;
	flex-direction: column;
	gap: 3px;
	user-select: none;
}
.track {
	position: relative;
	box-sizing: border-box;
	height: 14px;
	border: 1px solid #874a16;
	border-radius: 999px;
	background-color: #f3ca92;
	cursor: pointer;
	touch-action: none;
	&:focus-visible {
		outline: 2px solid #5a2d10;
		outline-offset: 2px;
	}
}
.elapsed {
	height: 100%;
	border-radius: 999px;
	background: linear-gradient(to bottom, #f0a25a, #bc693c);
	pointer-events: none;
}
.history .elapsed {
	opacity: 0.55;
}
.fight {
	position: absolute;
	top: 2px;
	bottom: 2px;
	width: 2px;
	margin-left: -1px;
	background-color: #8b1a10;
	pointer-events: none;
}
.cursor,
.head {
	position: absolute;
	top: 50%;
	width: 14px;
	height: 14px;
	margin-left: -7px;
	transform: translateY(-50%);
	box-sizing: border-box;
	border: 2px solid #5a2d10;
	border-radius: 50%;
	pointer-events: none;
}
.cursor {
	background-color: #fce3bc;
	box-shadow: 0 0 0 2px rgba(252, 227, 188, 0.6);
}
.head {
	background-color: #c0281a;
	animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
	50% {
		box-shadow: 0 0 0 4px rgba(192, 40, 26, 0.25);
	}
}
@media (prefers-reduced-motion: reduce) {
	.head {
		animation: none;
	}
}
.hover {
	position: absolute;
	bottom: calc(100% + 4px);
	transform: translateX(-50%);
	padding: 1px 4px;
	border-radius: 3px;
	background-color: rgba(58, 29, 10, 0.85);
	color: #fce3bc;
	font-size: 10px;
	white-space: nowrap;
	pointer-events: none;
}
.legend {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 6px;
	font-size: 11px;
	.bound {
		opacity: 0.75;
	}
	.state {
		flex: 1;
		text-align: center;
		font-weight: bold;
		color: #874b2e;
	}
}
.back-live {
	padding: 1px 6px;
	border: 1px solid #874b2e;
	border-radius: 4px;
	background: linear-gradient(180deg, #fce3bc 0%, #e0b878 100%);
	color: #5a2d10;
	font-size: 11px;
	font-weight: bold;
	cursor: pointer;
}
</style>
