<template>
	<div class="championship-match" :style="rootStyle">
		<p v-if="loaded && !board" class="no-match">{{ $t('clanChampionship.noMatch') }}</p>
		<template v-else-if="board">
			<ChampionshipScoreBar
				:west="board.west"
				:east="board.east"
				:startsAt="board.startsAt"
				:endsAt="board.endsAt"
				:status="board.status"
			/>
			<p v-if="board.status === 'finished'" class="finished">{{ $t('clanChampionship.matchFinished') }}</p>
			<ChampionshipBoard
				:board="board"
				:selectedDinozId="selectedDinozId"
				:disabled="pending || board.status !== 'live'"
				@select="selectedDinozId = $event"
				@move="onMove"
			/>
			<!-- Task 6: ChampionshipTabs (Sélection / Mes dinoz / Journal) plug in here, using
				selectedDinozId, pending, onEnter and onLeave -->
			<div class="tabs-slot" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import type { BoardDirection, MatchBoardDTO } from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipService } from '../../../services';
import { useChampionshipSocket } from '../../../composables/useChampionshipSocket';
import { errorHandler } from '../../../utils';
import { playerStore, useDinozStore } from '../../../store';
import ChampionshipScoreBar from './ChampionshipScoreBar.vue';
import ChampionshipBoard from './ChampionshipBoard.vue';

const REFETCH_DELAY = 60_000;

const route = useRoute();
const router = useRouter();
const $toast = useToast();
const dinozStore = useDinozStore();
const player = playerStore();

const board = ref<MatchBoardDTO | null>(null);
const loaded = ref(false);
const selectedDinozId = ref<number | null>(null);
const pending = ref(false);
const version = computed(() => board.value?.version ?? -1);
const matchId = computed(() => board.value?.matchId ?? null);

const readerIsWest = computed(() => !!board.value && board.value.west.clanId === player.clanId);
const rootStyle = computed(() => {
	const mine = '#2b6cb0';
	const enemy = '#b03a2e';
	return {
		'--cdc-mine': mine,
		'--cdc-enemy': enemy,
		'--cdc-west': readerIsWest.value ? mine : enemy,
		'--cdc-east': readerIsWest.value ? enemy : mine
	};
});

async function refetch() {
	try {
		const result = await ClanChampionshipService.getMatch();
		// Ignore stale responses of the same match
		if (!(result && board.value && result.matchId === board.value.matchId && result.version < board.value.version)) {
			board.value = result;
		}
		const sel = selectedDinozId.value;
		if (sel !== null && !board.value?.pieces.some(p => p.dinozId === sel && p.mine)) selectedDinozId.value = null;
	} catch (e) {
		errorHandler.handle(e, $toast);
	} finally {
		loaded.value = true;
	}
}

useChampionshipSocket(
	v => {
		if (v === -1 || v > version.value) void refetch();
	},
	{ matchId }
);

// Round transitions: while there is no live board, look for the next match every minute
const timer = setInterval(() => {
	if (loaded.value && (!board.value || board.value.status !== 'live')) void refetch();
}, REFETCH_DELAY);

async function runAction(dinozId: number, action: () => Promise<void>) {
	if (pending.value) return;
	pending.value = true;
	try {
		await action();
	} catch (e) {
		errorHandler.handle(e, $toast);
	} finally {
		await refetch();
		pending.value = false;
		// Best effort, does not block the board
		dinozStore.refreshDinozFiche(dinozId).catch(() => undefined);
	}
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

// Used by the tabs added in Task 6
async function onEnter(dinozId: number) {
	await runAction(dinozId, () => ClanChampionshipService.enter(dinozId));
}

async function onLeave(dinozId: number) {
	await runAction(dinozId, async () => {
		await ClanChampionshipService.leave(dinozId);
		if (selectedDinozId.value === dinozId) selectedDinozId.value = null;
	});
}

onMounted(() => void refetch());
onBeforeUnmount(() => {
	clearInterval(timer);
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
.no-match,
.finished {
	text-align: center;
	font-weight: bold;
}
</style>
