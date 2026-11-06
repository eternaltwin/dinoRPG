<template>
	<div class="championship-match" :style="rootStyle">
		<p v-if="loadError" class="no-match error" data-testid="board-error">{{ $t('clanChampionship.loadError') }}</p>
		<p v-if="loaded && !board && !loadError" class="no-match">{{ $t('clanChampionship.noMatch') }}</p>
		<template v-else-if="board">
			<ChampionshipScoreBar :west="board.west" :east="board.east" />
			<ChampionshipBoard
				:board="board"
				:selectedDinozId="selectedDinozId"
				:disabled="pending || board.status !== 'live'"
				@select="selectedDinozId = $event"
				@move="onMove"
			/>
			<ChampionshipMatchTimer :startsAt="board.startsAt" :endsAt="board.endsAt" :status="board.status" />
			<ChampionshipTabs
				:board="board"
				:selectedDinozId="selectedDinozId"
				:pending="pending"
				@enter="onEnter"
				@leave="onLeave"
				@select="selectedDinozId = $event"
				@itemUsed="onItemUsed"
			/>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import type { BoardDirection, MatchBoardDTO } from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipService } from '../../../services';
import { clanSocket } from '../../../services/clanSocket';
import { errorHandler } from '../../../utils';
import { playerStore, useDinozStore } from '../../../store';
import ChampionshipScoreBar from './ChampionshipScoreBar.vue';
import ChampionshipBoard from './ChampionshipBoard.vue';
import ChampionshipMatchTimer from './ChampionshipMatchTimer.vue';
import ChampionshipTabs from './ChampionshipTabs.vue';

const RETRY_DELAY = 5_000;

const route = useRoute();
const router = useRouter();
const $toast = useToast();
const dinozStore = useDinozStore();
const player = playerStore();

const board = ref<MatchBoardDTO | null>(null);
const loaded = ref(false);
const loadError = ref(false);
const selectedDinozId = ref<number | null>(null);
const pending = ref(false);
const version = computed(() => board.value?.version ?? -1);
const matchId = computed(() => board.value?.matchId ?? null);

const readerIsWest = computed(() => !!board.value && board.value.west.clanId === player.clanId);
const rootStyle = computed(() => {
	const mine = '#3fd8c4';
	const enemy = '#f0762a';
	return {
		'--cdc-mine': mine,
		'--cdc-enemy': enemy,
		'--cdc-west': readerIsWest.value ? mine : enemy,
		'--cdc-east': readerIsWest.value ? enemy : mine
	};
});

let unmounted = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

async function refetch(retry = true) {
	try {
		const result = await ClanChampionshipService.getMatch();
		if (unmounted) return;
		loadError.value = false;
		// Ignore stale responses of the same match
		if (!(result && board.value && result.matchId === board.value.matchId && result.version < board.value.version)) {
			board.value = result;
		}
		const sel = selectedDinozId.value;
		if (sel !== null && !board.value?.pieces.some(p => p.dinozId === sel && p.mine)) selectedDinozId.value = null;
	} catch (e) {
		if (unmounted) return;
		// Keep the last board: only flag the failure, then retry once
		loadError.value = true;
		if (retry) errorHandler.handle(e, $toast);
		if (retry && !retryTimer) {
			retryTimer = setTimeout(() => {
				retryTimer = null;
				void refetch(false);
			}, RETRY_DELAY);
		}
	} finally {
		loaded.value = true;
	}
}

// A board of another match means the next round started: this covers the round transitions too.
const stopListening = clanSocket.onMessage(message => {
	if (message.type !== 'boardChanged') return;
	if (message.matchId !== matchId.value || (message.version as number) > version.value) void refetch();
});
// Pushes may have been missed while the connection was down
const stopWaitingForReady = clanSocket.onReady(() => {
	if (loaded.value) void refetch();
});

async function runAction(dinozId: number, action: () => Promise<void>) {
	if (pending.value) return;
	pending.value = true;
	try {
		await action();
	} catch (e) {
		if (!unmounted) errorHandler.handle(e, $toast);
	}
	// The page may have navigated away (fight replay): nothing left to refresh
	if (unmounted) return;
	await refetch();
	pending.value = false;
	// Best effort, does not block the board
	// dinozStore.refreshDinozFiche(dinozId).catch(() => undefined);
}

async function onMove(direction: BoardDirection) {
	const dinozId = selectedDinozId.value;
	if (dinozId === null) return;
	await runAction(dinozId, async () => {
		const result = await ClanChampionshipService.move(dinozId, direction);
		if (result.fight) {
			await router.push({
				name: 'ReplayFight',
				params: { archive: result.fight.archiveId },
				query: { back: route.fullPath }
			});
		}
	});
}

async function onEnter(dinozId: number) {
	await runAction(dinozId, () => ClanChampionshipService.enter(dinozId));
}

async function onLeave(dinozId: number) {
	await runAction(dinozId, async () => {
		await ClanChampionshipService.leave(dinozId);
		if (selectedDinozId.value === dinozId) selectedDinozId.value = null;
	});
}

// The item was used through the inventory: only the displayed life is left to refresh
async function onItemUsed(dinozId: number) {
	await refetch();
	const life = board.value?.pieces.find(p => p.dinozId === dinozId)?.life;
	if (life !== undefined) dinozStore.setDinozLife(dinozId, life);
}

// The board is the one of the player's own clan: any other clan id in the URL is redirected
function ensureOwnClanRoute(): boolean {
	const ownClanId = player.clanId;
	const routeId = String(route.params.id);
	if (ownClanId !== undefined && routeId === String(ownClanId)) return true;
	void router.replace(
		ownClanId !== undefined
			? { name: 'ClanChampionshipMatch', params: { id: ownClanId } }
			: { name: 'Clan', params: { id: routeId } }
	);
	return false;
}

function init() {
	if (ensureOwnClanRoute()) void refetch();
}

onMounted(init);
// The redirect only changes `:id`: the component is reused, so reload once the route is the right one.
// Leaving the page also changes `:id` before the unmount: that must not redirect back to the board.
watch(
	() => route.params.id,
	() => {
		if (route.name === 'ClanChampionshipMatch') init();
	}
);
onBeforeUnmount(() => {
	unmounted = true;
	stopListening();
	stopWaitingForReady();
	if (retryTimer) clearTimeout(retryTimer);
});

defineExpose({ onEnter, onLeave });
</script>

<style lang="scss" scoped>
.championship-match {
	width: 95%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-bottom: 5px;
}
.no-match {
	text-align: center;
	font-weight: bold;
}
</style>
