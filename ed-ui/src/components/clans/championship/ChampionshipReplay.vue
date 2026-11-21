<template>
	<div class="championship-replay" :style="rootStyle">
		<div class="top">
			<RouterLink :to="{ name: 'ClanChampionship', params: { id: route.params.id } }">
				<DZButton back>{{ $t('clanChampionship.replayView.back') }}</DZButton>
			</RouterLink>
		</div>
		<p v-if="loadError" class="message error" data-testid="replay-error">
			{{ $t('clanChampionship.replayView.loadError') }}
		</p>
		<Loading v-else-if="!replay" />
		<template v-else>
			<h3 class="title">
				{{ $t('clanChampionship.round', { round: replay.round + 1 }) }} · {{ replay.home.name }}
				{{ $t('clanChampionship.versus') }} {{ replay.away.name }}
				<span v-if="replay.placeId !== null" class="place">· {{ placeName(replay.placeId) }}</span>
			</h3>
			<p v-if="!replay.omniscient" class="message" data-testid="replay-live">
				{{ $t('clanChampionship.replayView.liveNotice') }}
			</p>
			<p v-if="frames.length === 0" class="message" data-testid="replay-empty">
				{{ $t('clanChampionship.replayView.noFrames') }}
			</p>
			<template v-else-if="board && frame">
				<ChampionshipScoreBar :west="board.west" :east="board.east" />

				<ul class="tab-list" data-testid="replay-tabs">
					<li v-for="name in TABS" :key="name" :class="{ active: tab === name }">
						<button type="button" :data-testid="`replay-tab-${name}`" @click="tab = name">
							{{ $t(`clanChampionship.replayView.tabs.${name}`) }}
						</button>
					</li>
				</ul>

				<div v-if="tab === 'history'" class="history" data-testid="replay-history">
					<div class="options">
						<label
							><input v-model="historyFightsOnly" type="checkbox" />
							{{ $t('clanChampionship.replayView.history.fightsOnly') }}</label
						>
						<label
							><input v-model="skipTicks" type="checkbox" /> {{ $t('clanChampionship.replayView.skipTicks') }}</label
						>
					</div>
					<p v-if="history.length === 0" class="empty">{{ $t('clanChampionship.replayView.history.empty') }}</p>
					<ol v-else class="entries">
						<li
							v-for="entry in history"
							:key="entry.index"
							:class="{ current: entry.index === index, fight: entry.archiveId !== null }"
							data-testid="replay-history-entry"
						>
							<div class="when">
								<strong>{{ elapsed(entry.frame.at) }}</strong>
								<span>{{ formatDate(entry.frame.at) }}</span>
								<span class="score">{{ entry.frame.homeScore }} – {{ entry.frame.awayScore }}</span>
							</div>
							<ul class="events">
								<li v-for="(event, i) in entry.frame.events" :key="i" :class="event.type">{{ describe(event) }}</li>
							</ul>
							<div class="actions">
								<button type="button" data-testid="replay-history-show" @click="showStep(entry.index)">
									{{ $t('clanChampionship.replayView.history.showStep') }}
								</button>
								<template v-if="entry.archiveId">
									<button type="button" data-testid="replay-history-fight" @click="showStep(entry.index, true)">
										{{ $t('clanChampionship.replayView.showFight') }}
									</button>
									<RouterLink
										:to="{
											name: 'ReplayFight',
											params: { archive: entry.archiveId },
											query: { back: stepPath(entry.index) }
										}"
										data-testid="replay-history-fight-link"
									>
										{{ $t('clanChampionship.replayView.history.openFight') }}
									</RouterLink>
								</template>
							</div>
						</li>
					</ol>
				</div>
				<template v-else>
					<div class="controls" data-testid="replay-controls">
						<div class="buttons">
							<button
								type="button"
								:title="$t('clanChampionship.replayView.first')"
								data-testid="replay-first"
								@click="goTo(0)"
							>
								⏮
							</button>
							<button
								type="button"
								:title="$t('clanChampionship.replayView.previousFight')"
								:disabled="previousFightIndex === null"
								@click="goTo(previousFightIndex)"
							>
								⚔◀
							</button>
							<button type="button" :title="$t('clanChampionship.replayView.previous')" @click="step(-1)">◀</button>
							<button
								type="button"
								class="play"
								data-testid="replay-play"
								:title="$t(playing ? 'clanChampionship.replayView.pause' : 'clanChampionship.replayView.play')"
								@click="togglePlay"
							>
								{{ playing ? '⏸' : '▶' }}
							</button>
							<button
								type="button"
								:title="$t('clanChampionship.replayView.next')"
								data-testid="replay-next"
								@click="step(1)"
							>
								▶|
							</button>
							<button
								type="button"
								:title="$t('clanChampionship.replayView.nextFight')"
								:disabled="nextFightIndex === null"
								data-testid="replay-next-fight"
								@click="goTo(nextFightIndex)"
							>
								▶⚔
							</button>
							<button type="button" :title="$t('clanChampionship.replayView.last')" @click="goTo(frames.length - 1)">
								⏭
							</button>
							<select v-model.number="speed" :title="$t('clanChampionship.replayView.speed')">
								<option v-for="s in SPEEDS" :key="s" :value="s">×{{ s }}</option>
							</select>
						</div>
						<input
							v-model.number="index"
							class="timeline"
							type="range"
							min="0"
							:max="frames.length - 1"
							data-testid="replay-timeline"
							@input="stopPlaying"
						/>
						<div class="options">
							<label
								><input v-model="skipTicks" type="checkbox" /> {{ $t('clanChampionship.replayView.skipTicks') }}</label
							>
							<label
								><input v-model="playFights" type="checkbox" data-testid="replay-play-fights" />
								{{ $t('clanChampionship.replayView.playFights') }}</label
							>
						</div>
					</div>

					<div class="step" data-testid="replay-step">
						<div class="when">
							<strong>{{ $t('clanChampionship.replayView.step', { step: index + 1, total: frames.length }) }}</strong>
							<span>{{ formatDate(frame.at) }} ({{ elapsed(frame.at) }})</span>
						</div>
						<ul class="events">
							<li v-for="(event, i) in frame.events" :key="i" :class="event.type" data-testid="replay-event">
								{{ describe(event) }}
							</li>
						</ul>
						<DZButton v-if="fightArchiveId && !fightOpen" data-testid="replay-show-fight" @click="fightOpen = true">
							{{ $t('clanChampionship.replayView.showFight') }}
						</DZButton>
					</div>

					<div v-if="fightArchiveId && fightOpen" class="fight">
						<ChampionshipReplayFight
							:key="`${index}-${fightArchiveId}`"
							:archiveId="fightArchiveId"
							@ended="onFightEnded"
						/>
						<DZButton @click="closeFight">{{ $t('clanChampionship.replayView.closeFight') }}</DZButton>
					</div>

					<ChampionshipBoard
						:board="board"
						:selectedDinozId="null"
						:disabled="true"
						:omniscient="replay.omniscient"
						:highlighted="actors"
					/>

					<div class="rosters" data-testid="replay-rosters">
						<div v-for="side in rosters" :key="side.key" class="roster" :class="side.key">
							<h4>{{ side.name }}</h4>
							<p v-if="side.rows.length === 0" class="empty">{{ $t('clanChampionship.replayView.noDinoz') }}</p>
							<table v-else>
								<tr>
									<th></th>
									<th>{{ $t('clanChampionship.replayView.dinoz') }}</th>
									<th>{{ $t('clanChampionship.replayView.state') }}</th>
									<th>{{ $t('clanChampionship.replayView.hp') }}</th>
									<th>{{ $t('clanChampionship.ap') }}</th>
								</tr>
								<tr
									v-for="row in side.rows"
									:key="row.dinozId"
									:class="{ actor: actors.includes(row.dinozId), dead: row.state === DEAD, left: row.state === LEFT }"
									data-testid="replay-roster-row"
								>
									<td class="icon">
										<DinozIcon v-if="row.display" :display="row.display" :size="28" :flip="side.key === 'west'" />
									</td>
									<td>
										<div class="name">{{ row.name }}</div>
										<div class="player">{{ row.playerName }}</div>
									</td>
									<td class="state">{{ stateLabel(row) }}</td>
									<td v-if="row.hidden" class="life">?</td>
									<td v-else class="life">
										<div class="hp">
											<div class="hp-fill" :style="{ width: `${percent(row.life, row.maxLife)}%` }" />
										</div>
										<span>{{ row.life }} / {{ row.maxLife }}</span>
										<span v-if="row.lifeDelta" class="delta" :class="row.lifeDelta > 0 ? 'up' : 'down'">
											{{ row.lifeDelta > 0 ? '+' : '' }}{{ row.lifeDelta }}
										</span>
									</td>
									<td class="ap">{{ row.state !== ON_BOARD ? '–' : row.hidden ? '?' : row.actionPoints }}</td>
								</tr>
							</table>
						</div>
					</div>
				</template>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ReplayPieceStateCode } from '@drpg/core/models/clan/clanChampionship';
import type {
	MatchBoardDTO,
	MatchReplayDTO,
	ReplayDinozDTO,
	ReplayEvent,
	ReplayFrameDTO
} from '@drpg/core/models/clan/clanChampionship';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { ClanChampionshipService } from '../../../services';
import { playerStore } from '../../../store';
import DZButton from '../../common/DZButton.vue';
import ChampionshipBoard from './ChampionshipBoard.vue';
import ChampionshipReplayFight from './ChampionshipReplayFight.vue';
import ChampionshipScoreBar from './ChampionshipScoreBar.vue';
import DinozIcon from './DinozIcon.vue';
import { eastClanOf, frameActors, frameToBoard, isWestClanOf, westClanOf } from './replayBoard';

const SPEEDS = [1, 2, 4, 8];
const TABS = ['board', 'history'] as const;
type ReplayTab = (typeof TABS)[number];
const STEP_MS = 1500;
const AFTER_FIGHT_MS = 800;
const { ON_BOARD, LEFT, DEAD } = ReplayPieceStateCode;

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const player = playerStore();

const replay = ref<MatchReplayDTO | null>(null);
const loadError = ref(false);
const index = ref(0);
const playing = ref(false);
const speed = ref(1);
const skipTicks = ref(true);
const playFights = ref(true);
const fightOpen = ref(false);
const tab = ref<ReplayTab>('board');
const historyFightsOnly = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const frames = computed<ReplayFrameDTO[]>(() => replay.value?.frames ?? []);
const frame = computed<ReplayFrameDTO | null>(() => frames.value[index.value] ?? null);
const previousFrame = computed<ReplayFrameDTO | null>(() => frames.value[index.value - 1] ?? null);
const dinozById = computed(() => new Map<number, ReplayDinozDTO>((replay.value?.dinoz ?? []).map(d => [d.dinozId, d])));

const westClan = computed(() => (replay.value ? westClanOf(replay.value) : null));
const eastClan = computed(() => (replay.value ? eastClanOf(replay.value) : null));

function isWest(clanId: number): boolean {
	return !!replay.value && isWestClanOf(replay.value, clanId);
}

/** A spectator (neither clan) gets the original colours, as if west were its side. */
const readerIsWest = computed(() => player.clanId === undefined || eastClan.value?.clanId !== player.clanId);
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

const board = computed<MatchBoardDTO | null>(() =>
	replay.value && frame.value ? frameToBoard(replay.value, frame.value, player.clanId) : null
);

/** The dinoz the step is about: pointed out on the board and in the rosters. */
const actors = computed<number[]>(() => frameActors(frame.value));

const fightArchiveId = computed<string | null>(() => {
	const attack = frame.value?.events.find(e => e.type === 'attack');
	return attack?.type === 'attack' ? attack.archiveId : null;
});

/** The first fight of a step, if it can be watched ('' when its archive is kept from the reader). */
function archiveOf(f: ReplayFrameDTO): string | null {
	const attack = f.events.find(e => e.type === 'attack');
	return attack?.type === 'attack' && attack.archiveId ? attack.archiveId : null;
}

/** The match log, latest step first: what happened at each step, and its fight. */
const history = computed(() =>
	frames.value
		.map((f, i) => ({ index: i, frame: f, archiveId: archiveOf(f) }))
		.filter(e => !skipTicks.value || !isTickOnly(e.frame))
		.filter(e => !historyFightsOnly.value || e.frame.events.some(ev => ev.type === 'attack'))
		.reverse()
);

const fightIndexes = computed(() =>
	frames.value.flatMap((f, i) => (f.events.some(e => e.type === 'attack') ? [i] : []))
);
const previousFightIndex = computed(() => [...fightIndexes.value].reverse().find(i => i < index.value) ?? null);
const nextFightIndex = computed(() => fightIndexes.value.find(i => i > index.value) ?? null);

interface RosterRow {
	dinozId: number;
	name: string;
	playerName: string;
	display: string;
	state: ReplayPieceStateCode;
	x: number;
	y: number;
	actionPoints: number;
	life: number;
	maxLife: number;
	lifeDelta: number;
	/** Life and action points kept from the reader while the match is live */
	hidden: boolean;
}

const rosters = computed(() => {
	const f = frame.value;
	if (!f || !westClan.value || !eastClan.value) return [];
	const before = new Map((previousFrame.value?.pieces ?? []).map(p => [p[0], p[6]]));
	const rows: (RosterRow & { west: boolean })[] = f.pieces.map(
		([dinozId, clanId, state, x, y, actionPoints, life, maxLife]) => {
			const dinoz = dinozById.value.get(dinozId);
			const previous = before.get(dinozId);
			return {
				dinozId,
				west: isWest(clanId),
				name: dinoz?.name ?? '?',
				playerName: dinoz?.playerName ?? '',
				display: dinoz?.display ?? '',
				state,
				x,
				y,
				actionPoints,
				life,
				maxLife,
				lifeDelta: previous === undefined ? 0 : life - previous,
				hidden: !replay.value?.omniscient && clanId !== player.clanId
			};
		}
	);
	// On the board first, then those who left, then the dead
	const sorted = (west: boolean) =>
		rows.filter(r => r.west === west).sort((a, b) => a.state - b.state || a.name.localeCompare(b.name));
	return [
		{ key: 'west', name: westClan.value.name, rows: sorted(true) },
		{ key: 'east', name: eastClan.value.name, rows: sorted(false) }
	];
});

function nameOf(dinozId: number): string {
	return dinozById.value.get(dinozId)?.name ?? '?';
}

function clanNameOf(clanId: number | null): string {
	const r = replay.value;
	if (!r || clanId === null) return '';
	return clanId === r.home.clanId ? r.home.name : clanId === r.away.clanId ? r.away.name : '';
}

function describe(event: ReplayEvent): string {
	const key = (k: string) => `clanChampionship.replayView.event.${k}`;
	switch (event.type) {
		case 'start':
			return t(key('start'));
		case 'tick':
			return t(key('tick'), { ticks: event.ticks });
		case 'end':
			return event.winnerClanId === null ? t(key('endDraw')) : t(key('end'), { clan: clanNameOf(event.winnerClanId) });
		case 'enter':
			return t(key('enter'), { dinoz: nameOf(event.dinozId), x: event.x, y: event.y });
		case 'leave':
			return t(key('leave'), { dinoz: nameOf(event.dinozId) });
		case 'move':
			return t(key('move'), { dinoz: nameOf(event.dinozId), x: event.x, y: event.y });
		case 'attack': {
			const outcome = t(event.outcome === FightOutcome.AttackerWin ? 'clanChampionship.won' : 'clanChampionship.lost');
			const line = t(key('attack'), {
				dinoz: nameOf(event.dinozId),
				target: nameOf(event.targetDinozId),
				outcome
			});
			if (event.deadDinozIds.length === 0) return line;
			return `${line} ${t(key('deaths'), { names: event.deadDinozIds.map(nameOf).join(', ') })}`;
		}
		case 'heal':
			return t(key('heal'), { dinoz: nameOf(event.dinozId), life: event.life });
		case 'withdrawn':
			return t(key('withdrawn'), { names: event.dinozIds.map(nameOf).join(', ') });
		default:
			return '';
	}
}

function stateLabel(row: RosterRow): string {
	if (row.state === ON_BOARD) return t('clanChampionship.replayView.position', { x: row.x, y: row.y });
	return t(row.state === DEAD ? 'clanChampionship.replayView.dead' : 'clanChampionship.replayView.left');
}

function percent(life: number, maxLife: number): number {
	return Math.max(0, Math.min(100, (life / (maxLife || 1)) * 100));
}

function formatDate(d: Date | string): string {
	return new Date(d).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'medium' });
}

function elapsed(d: Date | string): string {
	if (!replay.value) return '';
	const minutes = Math.max(0, Math.floor((new Date(d).getTime() - new Date(replay.value.startsAt).getTime()) / 60000));
	return `+${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

function placeName(placeId: number): string {
	const place = Object.values(placeList).find(p => p.placeId === placeId);
	return place ? t(`place.name.${place.name}`) : '?';
}

/** A step made only of ticks: no move, just action points and score. */
function isTickOnly(f: ReplayFrameDTO): boolean {
	return f.events.length > 0 && f.events.every(e => e.type === 'tick');
}

function clearTimer() {
	if (timer) clearTimeout(timer);
	timer = null;
}

function stopPlaying() {
	playing.value = false;
	clearTimer();
}

/** A step reached by hand: its fight is played when asked (by default, when fights are played). */
async function goTo(target: number | null, withFight = playFights.value) {
	if (target === null) return;
	stopPlaying();
	index.value = Math.max(0, Math.min(frames.value.length - 1, target));
	// After the index watcher, which closes the fight of the step left
	await nextTick();
	if (withFight && fightArchiveId.value) fightOpen.value = true;
}

/** The next step in that direction, past the tick-only ones when they are skipped. */
function neighbour(from: number, direction: 1 | -1): number | null {
	for (let i = from + direction; i >= 0 && i < frames.value.length; i += direction) {
		if (!skipTicks.value || !isTickOnly(frames.value[i]) || i === frames.value.length - 1) return i;
	}
	return null;
}

function step(direction: 1 | -1) {
	void goTo(neighbour(index.value, direction));
}

function scheduleNext(delay = STEP_MS / speed.value) {
	clearTimer();
	timer = setTimeout(advance, delay);
}

function advance() {
	timer = null;
	if (!playing.value) return;
	const next = neighbour(index.value, 1);
	if (next === null) {
		playing.value = false;
		return;
	}
	index.value = next;
	// A fight is watched whole before the replay goes on
	if (playFights.value && fightArchiveId.value) {
		fightOpen.value = true;
		return;
	}
	scheduleNext();
}

/** Back to the board on that step, its fight open if asked. */
async function showStep(target: number, withFight = false) {
	tab.value = 'board';
	await goTo(target, withFight);
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

function togglePlay() {
	if (playing.value) {
		stopPlaying();
		return;
	}
	if (neighbour(index.value, 1) === null) index.value = 0;
	playing.value = true;
	fightOpen.value = false;
	scheduleNext(0);
}

function onFightEnded() {
	if (playing.value) scheduleNext(AFTER_FIGHT_MS);
}

function closeFight() {
	fightOpen.value = false;
	if (playing.value) scheduleNext();
}

// Leaving a step by hand closes its fight; goTo opens the new one if asked
watch(index, () => {
	if (!playing.value) fightOpen.value = false;
});

/** The step in the URL (1-based), so that coming back from a fight lands on it. */
function stepFromQuery(): number | null {
	const raw = route.query.step;
	return typeof raw === 'string' && /^[1-9]\d*$/.test(raw) ? Number(raw) - 1 : null;
}

/** No step on the last one of a live match: the reader follows the match. */
function stepQuery(i: number): string | undefined {
	const live = !!replay.value && !replay.value.omniscient && i >= frames.value.length - 1;
	return live ? undefined : String(i + 1);
}

/** This replay on that step, for the way back from its fight. */
function stepPath(i: number): string {
	return router.resolve({ query: { ...route.query, step: stepQuery(i) } }).fullPath;
}

watch(index, i => {
	if (!replay.value) return;
	const step = stepQuery(i);
	if (route.query.step === step) return;
	void router.replace({ query: { ...route.query, step } });
});

function onKey(event: KeyboardEvent) {
	const target = event.target as HTMLElement | null;
	if (target && (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName) || target.isContentEditable))
		return;
	if (event.ctrlKey || event.metaKey || event.altKey || !frames.value.length || tab.value !== 'board') return;
	if (event.key === 'ArrowRight') step(1);
	else if (event.key === 'ArrowLeft') step(-1);
	else if (event.key === ' ') togglePlay();
	else return;
	event.preventDefault();
}

/** While the match is live, the replay is fetched again now and then; a reader on the last step follows the new ones. */
const LIVE_REFRESH_MS = 15000;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

function stopRefreshing() {
	if (refreshTimer) clearInterval(refreshTimer);
	refreshTimer = null;
}

async function refresh() {
	if (document.visibilityState !== 'visible') return;
	const following = index.value >= frames.value.length - 1;
	try {
		const result = await ClanChampionshipService.getReplay(String(route.params.matchId));
		if (refreshTimer === null) return;
		replay.value = result;
	} catch {
		return;
	}
	if (following) index.value = Math.max(0, frames.value.length - 1);
	else index.value = Math.min(index.value, Math.max(0, frames.value.length - 1));
	if (replay.value.omniscient) stopRefreshing();
}

onMounted(async () => {
	window.addEventListener('keydown', onKey);
	try {
		replay.value = await ClanChampionshipService.getReplay(String(route.params.matchId));
	} catch {
		loadError.value = true;
		return;
	}
	// Back from a fight: on its step. Live: on the current board, kept up with
	const requested = stepFromQuery();
	if (requested !== null) index.value = Math.min(requested, Math.max(0, frames.value.length - 1));
	else if (!replay.value.omniscient) index.value = Math.max(0, frames.value.length - 1);
	if (!replay.value.omniscient) {
		refreshTimer = setInterval(() => void refresh(), LIVE_REFRESH_MS);
	}
});
onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKey);
	clearTimer();
	stopRefreshing();
});
</script>

<style lang="scss" scoped>
.championship-replay {
	width: 95%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-bottom: 5px;
}
.top {
	display: flex;
	justify-content: flex-start;
}
.title {
	text-align: center;
	margin: 0;
	.place {
		font-weight: normal;
	}
}
.message {
	text-align: center;
	font-weight: bold;
}
.tab-list {
	display: flex;
	margin: 0;
	padding: 0;
	list-style: none;
	background: #d19860;
	button {
		display: block;
		padding: 5px 12px;
		border: 0;
		background: transparent;
		font: inherit;
		color: white;
		cursor: pointer;
	}
	li.active button {
		background: #fbe7c5;
		color: #4a2a1a;
	}
}
.history {
	display: flex;
	flex-direction: column;
	gap: 6px;
	.options {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
		font-size: 12px;
	}
	.empty {
		text-align: center;
		font-style: italic;
	}
	.entries {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 600px;
		overflow-y: auto;
	}
	.entries > li {
		padding: 4px 6px;
		border-left: 3px solid transparent;
		border-radius: 4px;
		background-color: rgba(0, 0, 0, 0.08);
		&.fight {
			border-left-color: #c0281a;
		}
		&.current {
			background-color: rgba(245, 197, 24, 0.3);
		}
	}
	.when {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		font-size: 11px;
		strong {
			color: #874b2e;
		}
		.score {
			margin-left: auto;
			font-weight: bold;
		}
	}
	.events {
		margin: 2px 0;
		padding: 0;
		list-style: none;
		font-size: 12px;
		li.attack,
		li.end {
			font-weight: bold;
		}
		li.tick {
			font-style: italic;
			opacity: 0.8;
		}
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		button {
			padding: 1px 6px;
			border: 1px solid #874b2e;
			border-radius: 4px;
			background: linear-gradient(180deg, #fce3bc 0%, #e0b878 100%);
			color: #5a2d10;
			font-weight: bold;
			cursor: pointer;
		}
		a {
			color: #874b2e;
			font-weight: bold;
		}
	}
}
.controls {
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 6px;
	border-radius: 6px;
	background-color: rgba(0, 0, 0, 0.15);
	.buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px;
	}
	button,
	select {
		min-width: 34px;
		padding: 2px 6px;
		border: 1px solid #874b2e;
		border-radius: 4px;
		background: linear-gradient(180deg, #fce3bc 0%, #e0b878 100%);
		color: #5a2d10;
		font-weight: bold;
		cursor: pointer;
		&:disabled {
			opacity: 0.4;
			cursor: default;
		}
	}
	.play {
		min-width: 48px;
	}
	.timeline {
		width: 100%;
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
		font-size: 12px;
	}
}
.step {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	.when {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		font-size: 12px;
		strong {
			color: #874b2e;
		}
	}
	.events {
		margin: 0;
		padding: 0;
		list-style: none;
		text-align: center;
		li.attack,
		li.end {
			font-weight: bold;
		}
		li.tick {
			font-style: italic;
			opacity: 0.8;
		}
	}
}
.fight {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}
.rosters {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
	gap: 8px;
}
.roster {
	min-width: 0;
	overflow-x: auto;
	h4 {
		margin: 0 0 4px;
		text-align: center;
	}
	&.west h4 {
		color: var(--cdc-west);
	}
	&.east h4 {
		color: var(--cdc-east);
	}
	.empty {
		text-align: center;
		font-style: italic;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 11px;
	}
	th {
		text-align: left;
		border-bottom: 1px solid rgba(0, 0, 0, 0.3);
	}
	td {
		padding: 1px 3px;
		vertical-align: middle;
	}
	tr.actor td {
		background-color: rgba(245, 197, 24, 0.3);
	}
	tr.left td {
		opacity: 0.65;
	}
	tr.dead td {
		opacity: 0.45;
		text-decoration: line-through;
	}
	.icon {
		width: 30px;
	}
	.name {
		font-weight: bold;
	}
	.player {
		font-size: 10px;
		opacity: 0.8;
	}
	.life {
		min-width: 90px;
		white-space: nowrap;
	}
	.hp {
		height: 4px;
		border-radius: 2px;
		background-color: #6b2d2d;
		overflow: hidden;
		.hp-fill {
			height: 100%;
			background-color: #6ee04a;
		}
	}
	.delta {
		margin-left: 4px;
		font-weight: bold;
		&.down {
			color: #c0281a;
		}
		&.up {
			color: #2f8f1c;
		}
	}
	.state {
		white-space: nowrap;
	}
	.ap {
		text-align: center;
	}
}
</style>
