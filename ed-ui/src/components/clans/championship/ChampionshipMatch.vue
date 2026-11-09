<template>
	<div class="championship-match" :style="rootStyle">
		<p v-if="loadError" class="no-match error" data-testid="board-error">{{ $t('clanChampionship.loadError') }}</p>
		<p v-if="loaded && !board && !loadError" class="no-match">{{ $t('clanChampionship.noMatch') }}</p>
		<template v-else-if="board">
			<ChampionshipScoreBar
				:west="shownBoard.west"
				:east="shownBoard.east"
				:startsAt="board.startsAt"
				:endsAt="board.endsAt"
				:status="board.status"
			/>
			<ChampionshipTickBar v-if="board.status === 'live'" :startsAt="board.startsAt" :endsAt="board.endsAt" />
			<p v-if="board.status === 'finished'" class="finished">{{ $t('clanChampionship.matchFinished') }}</p>
			<ChampionshipBoard
				:board="shownBoard"
				:selectedDinozId="historyAt === null ? selectedDinozId : null"
				:disabled="pending || historyAt !== null || board.status !== 'live'"
				:omniscient="historyAt !== null && !!replay?.omniscient"
				:highlighted="historyActors"
				@select="selectedDinozId = $event"
				@move="onMove"
			/>
			<ChampionshipTimeline
				v-if="board.status !== 'scheduled'"
				:startsAt="board.startsAt"
				:endsAt="board.endsAt"
				:status="board.status"
				:frames="replay?.frames ?? null"
				:selectedAt="historyAt"
				:loading="replayLoading"
				@seek="onSeek"
				@step="onStep"
				@live="historyAt = null"
			/>
			<div v-if="board.status === 'finished'" class="replay-link">
				<RouterLink
					:to="{ name: 'ClanChampionshipReplay', params: { id: route.params.id, matchId: board.matchId } }"
					data-testid="board-replay-link"
				>
					<DZButton>{{ $t('clanChampionship.replayMatch') }}</DZButton>
				</RouterLink>
			</div>
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
import type {
	BoardDirection,
	MatchBoardDTO,
	MatchReplayDTO,
	ReplayFrameDTO
} from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipService } from '../../../services';
import { clanSocket } from '../../../services/clanSocket';
import { errorHandler } from '../../../utils';
import { playerStore, useDinozStore } from '../../../store';
import ChampionshipScoreBar from './ChampionshipScoreBar.vue';
import ChampionshipBoard from './ChampionshipBoard.vue';
import ChampionshipTickBar from './ChampionshipTickBar.vue';
import ChampionshipTabs from './ChampionshipTabs.vue';
import ChampionshipTimeline from './ChampionshipTimeline.vue';
import { frameActors, frameToBoard } from './replayBoard';
import DZButton from '../../common/DZButton.vue';

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
		'--cdc-east': readerIsWest.value ? enemy : mine,
		// Original score bar colours, darker so they read on its beige background
		'--cdc-bar-west': readerIsWest.value ? '#2b6cb0' : '#b03a2e',
		'--cdc-bar-east': readerIsWest.value ? '#b03a2e' : '#2b6cb0'
	};
});

let unmounted = false;

/** The recorded steps of the match, fetched on the first use of the timeline, and the board version they cover. */
const replay = ref<MatchReplayDTO | null>(null);
const replayLoading = ref(false);
let replayVersion = -1;
let replayRequest: Promise<MatchReplayDTO | null> | null = null;
/** The instant the board is shown at, `null` for the current board. */
const historyAt = ref<number | null>(null);

const frameAt = (f: ReplayFrameDTO) => new Date(f.at).getTime();

/** The last step recorded at or before the instant shown. */
const historyIndex = computed<number | null>(() => {
	const frames = replay.value?.frames;
	if (historyAt.value === null || !frames?.length) return null;
	let index = 0;
	for (let i = 0; i < frames.length && frameAt(frames[i]) <= historyAt.value; i++) index = i;
	return index;
});
const historyFrame = computed(() =>
	historyIndex.value === null ? null : (replay.value?.frames[historyIndex.value] ?? null)
);
const shownBoard = computed<MatchBoardDTO>(() =>
	replay.value && historyFrame.value
		? frameToBoard(replay.value, historyFrame.value, player.clanId)
		: (board.value as MatchBoardDTO)
);
const historyActors = computed(() => (historyFrame.value ? frameActors(historyFrame.value) : []));

/** The replay up to the current board version: fetched again only when the board moved on since. */
function loadReplay(): Promise<MatchReplayDTO | null> {
	const current = board.value;
	if (!current) return Promise.resolve(null);
	if (replay.value?.matchId === current.matchId && replayVersion >= current.version) {
		return Promise.resolve(replay.value);
	}
	if (replayRequest) return replayRequest;
	const version = current.version;
	replayLoading.value = true;
	replayRequest = ClanChampionshipService.getReplay(current.matchId)
		.then(result => {
			if (unmounted || result.matchId !== board.value?.matchId) return null;
			replay.value = result;
			replayVersion = version;
			return result;
		})
		.catch(e => {
			if (!unmounted) errorHandler.handle(e, $toast);
			return null;
		})
		.finally(() => {
			replayRequest = null;
			replayLoading.value = false;
		});
	return replayRequest;
}

/** Up to date and on its last step, the replay shows the current board: back to it then. */
function showStep(result: MatchReplayDTO, index: number, at: number) {
	const last = result.frames.length - 1;
	if (index >= last && replayVersion >= (board.value?.version ?? 0)) historyAt.value = null;
	else historyAt.value = at;
}

async function onSeek(at: number) {
	const result = await loadReplay();
	if (!result?.frames.length) return;
	let index = 0;
	for (let i = 0; i < result.frames.length && frameAt(result.frames[i]) <= at; i++) index = i;
	showStep(result, index, at);
}

async function onStep(direction: 1 | -1) {
	if (historyAt.value === null && direction === 1) return;
	const result = await loadReplay();
	if (!result?.frames.length) return;
	const last = result.frames.length - 1;
	const from = historyIndex.value ?? last;
	const target = Math.max(0, Math.min(last, from + direction));
	if (direction === 1 && from === last) {
		historyAt.value = null;
		return;
	}
	showStep(result, target, frameAt(result.frames[target]));
}

// Another match (the next round): its steps are not those of the previous one
watch(matchId, () => {
	replay.value = null;
	replayVersion = -1;
	historyAt.value = null;
});

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

// Best effort and silent: the full page loader would block the board on every action
function refreshFiche(dinozId: number) {
	dinozStore.refreshDinozFiche(dinozId, true).catch(() => undefined);
}

async function runAction(dinozId: number, action: () => Promise<void>) {
	if (pending.value) return;
	pending.value = true;
	// Acting is done on the current board
	historyAt.value = null;
	try {
		await action();
	} catch (e) {
		if (!unmounted) errorHandler.handle(e, $toast);
	}
	// The page may have navigated away (fight replay): nothing left to refresh
	if (unmounted) return;
	await refetch();
	pending.value = false;
	refreshFiche(dinozId);
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
	refreshFiche(dinozId);
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
.replay-link {
	display: flex;
	justify-content: center;
}
.no-match,
.finished {
	text-align: center;
	font-weight: bold;
}
</style>
