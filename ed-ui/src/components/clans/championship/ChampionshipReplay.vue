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
			<p v-if="frames.length === 0" class="message" data-testid="replay-empty">
				{{ $t('clanChampionship.replayView.noFrames') }}
			</p>
			<template v-else-if="board && frame">
				<ChampionshipScoreBar :west="board.west" :east="board.east" />

				<div class="controls" data-testid="replay-controls">
					<div class="buttons">
						<button type="button" :title="$t('clanChampionship.replayView.first')" @click="goTo(0)">⏮</button>
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
							><input v-model="playFights" type="checkbox" /> {{ $t('clanChampionship.replayView.playFights') }}</label
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
					:omniscient="true"
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
								<td class="life">
									<div class="hp">
										<div class="hp-fill" :style="{ width: `${percent(row.life, row.maxLife)}%` }" />
									</div>
									<span>{{ row.life }} / {{ row.maxLife }}</span>
									<span v-if="row.lifeDelta" class="delta" :class="row.lifeDelta > 0 ? 'up' : 'down'">
										{{ row.lifeDelta > 0 ? '+' : '' }}{{ row.lifeDelta }}
									</span>
								</td>
								<td class="ap">{{ row.state === ON_BOARD ? row.actionPoints : '–' }}</td>
							</tr>
						</table>
					</div>
				</div>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ReplayPieceStateCode } from '@drpg/core/models/clan/clanChampionship';
import type {
	BoardPieceDTO,
	BoardSideDTO,
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

const SPEEDS = [1, 2, 4, 8];
const STEP_MS = 1500;
const AFTER_FIGHT_MS = 800;
const { ON_BOARD, LEFT, DEAD } = ReplayPieceStateCode;

const route = useRoute();
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
let timer: ReturnType<typeof setTimeout> | null = null;

const frames = computed<ReplayFrameDTO[]>(() => replay.value?.frames ?? []);
const frame = computed<ReplayFrameDTO | null>(() => frames.value[index.value] ?? null);
const previousFrame = computed<ReplayFrameDTO | null>(() => frames.value[index.value - 1] ?? null);
const dinozById = computed(() => new Map<number, ReplayDinozDTO>((replay.value?.dinoz ?? []).map(d => [d.dinozId, d])));

const westClan = computed(() =>
	replay.value ? (replay.value.westIsHome ? replay.value.home : replay.value.away) : null
);
const eastClan = computed(() =>
	replay.value ? (replay.value.westIsHome ? replay.value.away : replay.value.home) : null
);

function isWest(clanId: number): boolean {
	const west = westClan.value;
	const east = eastClan.value;
	if (west?.clanId !== null && west?.clanId !== undefined) return clanId === west.clanId;
	return clanId !== east?.clanId;
}

const readerIsWest = computed(() => player.clanId !== undefined && westClan.value?.clanId === player.clanId);
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

const board = computed<MatchBoardDTO | null>(() => {
	const r = replay.value;
	const f = frame.value;
	if (!r || !f || !westClan.value || !eastClan.value) return null;
	const pieces: BoardPieceDTO[] = f.pieces
		.filter(p => p[2] === ON_BOARD)
		.map(([dinozId, clanId, , x, y, actionPoints, life, maxLife]) => {
			const dinoz = dinozById.value.get(dinozId);
			return {
				dinozId,
				clanId,
				x,
				y,
				mine: false,
				ally: clanId === player.clanId,
				name: dinoz?.name ?? '?',
				display: dinoz?.display ?? '',
				level: dinoz?.level ?? 0,
				playerName: dinoz?.playerName ?? '',
				life,
				maxLife,
				actionPoints
			};
		});
	const westHome = r.westIsHome;
	const side = (clan: { clanId: number | null; name: string }, west: boolean): BoardSideDTO => ({
		clanId: clan.clanId,
		name: clan.name,
		score: west === westHome ? f.homeScore : f.awayScore,
		scoreLine: west ? f.westScoreLine : f.eastScoreLine,
		quotaUsed: f.pieces.filter(p => isWest(p[1]) === west).length
	});
	const ended = f.events.some(e => e.type === 'end');
	return {
		matchId: r.matchId,
		version: f.version,
		round: r.round,
		placeId: r.placeId,
		status: ended ? 'finished' : 'live',
		startsAt: r.startsAt,
		endsAt: r.endsAt,
		ticksApplied: f.ticksApplied,
		west: side(westClan.value, true),
		east: side(eastClan.value, false),
		obstacles: r.obstacles,
		pieces,
		deadDinozIds: f.pieces.filter(p => p[2] === DEAD).map(p => p[0]),
		fights: []
	};
});

/** The dinoz the step is about: pointed out on the board and in the rosters. */
const actors = computed<number[]>(() => {
	const ids: number[] = [];
	for (const e of frame.value?.events ?? []) {
		if ('dinozId' in e) ids.push(e.dinozId);
		if (e.type === 'attack') ids.push(e.targetDinozId, ...e.deadDinozIds);
		if (e.type === 'withdrawn') ids.push(...e.dinozIds);
	}
	return [...new Set(ids)];
});

const fightArchiveId = computed<string | null>(() => {
	const attack = frame.value?.events.find(e => e.type === 'attack');
	return attack?.type === 'attack' ? attack.archiveId : null;
});

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
				lifeDelta: previous === undefined ? 0 : life - previous
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

function goTo(target: number | null) {
	if (target === null) return;
	stopPlaying();
	index.value = Math.max(0, Math.min(frames.value.length - 1, target));
}

/** The next step in that direction, past the tick-only ones when they are skipped. */
function neighbour(from: number, direction: 1 | -1): number | null {
	for (let i = from + direction; i >= 0 && i < frames.value.length; i += direction) {
		if (!skipTicks.value || !isTickOnly(frames.value[i]) || i === frames.value.length - 1) return i;
	}
	return null;
}

function step(direction: 1 | -1) {
	goTo(neighbour(index.value, direction));
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

// A step reached by hand opens no fight by itself
watch(index, () => {
	if (!playing.value) fightOpen.value = false;
});

function onKey(event: KeyboardEvent) {
	const target = event.target as HTMLElement | null;
	if (target && (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName) || target.isContentEditable))
		return;
	if (event.ctrlKey || event.metaKey || event.altKey || !frames.value.length) return;
	if (event.key === 'ArrowRight') step(1);
	else if (event.key === 'ArrowLeft') step(-1);
	else if (event.key === ' ') togglePlay();
	else return;
	event.preventDefault();
}

onMounted(async () => {
	window.addEventListener('keydown', onKey);
	try {
		replay.value = await ClanChampionshipService.getReplay(String(route.params.matchId));
	} catch {
		loadError.value = true;
	}
});
onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKey);
	clearTimer();
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
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	gap: 8px;
}
.roster {
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
