<template>
	<div class="board-frame" :class="{ disabled }">
		<div class="board" :style="{ '--size': BOARD_SIZE }">
			<template v-if="board.status !== 'scheduled'">
				<div
					class="score-line west"
					data-testid="score-line-west"
					:style="{ left: columnEdge(board.west.scoreLine + 1) }"
				/>
				<div
					class="score-line east"
					data-testid="score-line-east"
					:style="{ left: columnEdge(BOARD_SIZE - 1 - board.east.scoreLine) }"
				/>
			</template>
			<div
				v-for="cell in cells"
				:key="cell.index"
				:data-testid="`board-cell-${cell.x}-${cell.y}`"
				class="cell"
				:class="{
					'entry-west': cell.x === 0,
					'entry-east': cell.x === BOARD_SIZE - 1,
					blocked: cell.blocked,
					reachable: cell.target === 'move',
					attackable: cell.target === 'attack'
				}"
				@click="onCellClick(cell)"
			>
				<img
					v-if="cell.blocked"
					class="obstacle"
					:src="obstacleSprite(cell.index).src"
					:style="{ width: obstacleSprite(cell.index).width }"
					draggable="false"
					alt=""
				/>
				<div
					v-if="cell.piece"
					class="piece"
					:class="{
						own: cell.piece.mine,
						ally: cell.piece.ally && !cell.piece.mine,
						enemy: !cell.piece.mine && !cell.piece.ally,
						selected: cell.piece.dinozId === selectedDinozId,
						exhausted: isOurs(cell.piece) && cell.piece.actionPoints === 0
					}"
					data-testid="board-piece"
					:title="`${cell.piece.name} (${$t('clanChampionship.level', { level: cell.piece.level })}) - ${cell.piece.playerName}`"
				>
					<DinozIcon :display="cell.piece.display" :size="ICON_SIZE" />
					<div v-if="isOurs(cell.piece) && cell.piece.maxLife" class="hp">
						<div class="hp-fill" :style="{ width: `${hpPercent(cell.piece)}%` }" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { BOARD_SIZE, BoardDirection } from '@drpg/core/models/clan/clanChampionship';
import type { BoardPieceDTO, MatchBoardDTO } from '@drpg/core/models/clan/clanChampionship';
import { getImgURL } from '../../../mixin/mixin';
import { playerStore } from '../../../store';
import DinozIcon from './DinozIcon.vue';

const ICON_SIZE = 40;

// Widths relative to a cell keep the sprites at the same scale as each other
const OBSTACLE_SPRITES = [
	{ name: 'boulders', width: '99%' },
	{ name: 'log', width: '82%' },
	{ name: 'crate', width: '90%' },
	{ name: 'cactus', width: '82%' },
	{ name: 'cactus_double', width: '104%' },
	{ name: 'rock', width: '97%' },
	{ name: 'rock_dark', width: '85%' },
	{ name: 'mushroom', width: '92%' }
].map(({ name, width }) => ({ src: getImgURL('clan/championship', name), width }));

/** Purely visual: the board only stores blocked cells, so the sprite is derived from the cell to stay stable. */
function obstacleSprite(index: number) {
	// Multiplicative hash: its high bits scatter neighbouring cells
	const hash = ((index * 2654435761) >>> 0) / 2 ** 32;
	return OBSTACLE_SPRITES[Math.floor(hash * OBSTACLE_SPRITES.length)];
}

function columnEdge(column: number): string {
	return `${(column / BOARD_SIZE) * 100}%`;
}

const props = defineProps<{ board: MatchBoardDTO; selectedDinozId: number | null; disabled: boolean }>();
const emit = defineEmits<{
	(e: 'select', dinozId: number): void;
	(e: 'move', direction: BoardDirection): void;
}>();

const store = playerStore();

const DELTAS: { direction: BoardDirection; dx: number; dy: number }[] = [
	{ direction: BoardDirection.N, dx: 0, dy: -1 },
	{ direction: BoardDirection.S, dx: 0, dy: 1 },
	{ direction: BoardDirection.E, dx: 1, dy: 0 },
	{ direction: BoardDirection.W, dx: -1, dy: 0 }
];

// The reader's side: the clan whose pieces are flagged mine/ally
const readerIsWest = computed(() => {
	const clanId = store.clanId ?? props.board.pieces.find(p => p.mine || p.ally)?.clanId;
	return props.board.west.clanId === clanId;
});
const enemyEntryX = computed(() => (readerIsWest.value ? BOARD_SIZE - 1 : 0));

const obstacles = computed(() => new Set(props.board.obstacles));
const piecesByCell = computed(() => {
	const map = new Map<number, BoardPieceDTO>();
	for (const p of props.board.pieces) map.set(p.y * BOARD_SIZE + p.x, p);
	return map;
});
const selected = computed(() => props.board.pieces.find(p => p.dinozId === props.selectedDinozId && p.mine) ?? null);

function isOurs(p: BoardPieceDTO): boolean {
	return p.mine || p.ally;
}

function hpPercent(p: BoardPieceDTO): number {
	return Math.max(0, Math.min(100, ((p.life ?? 0) / (p.maxLife || 1)) * 100));
}

type Target = 'move' | 'attack' | null;
interface Cell {
	index: number;
	x: number;
	y: number;
	blocked: boolean;
	piece: BoardPieceDTO | undefined;
	direction: BoardDirection | null;
	target: Target;
}

const targets = computed(() => {
	const sel = selected.value;
	const targets = new Map<number, { direction: BoardDirection; target: Target }>();
	if (sel && !props.disabled && (sel.actionPoints ?? 0) > 0) {
		for (const { direction, dx, dy } of DELTAS) {
			const x = sel.x + dx;
			const y = sel.y + dy;
			if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) continue;
			const index = y * BOARD_SIZE + x;
			if (obstacles.value.has(index)) continue;
			const other = piecesByCell.value.get(index);
			if (other) {
				if (!other.mine && !other.ally) targets.set(index, { direction, target: 'attack' });
			} else if (x !== enemyEntryX.value) {
				targets.set(index, { direction, target: 'move' });
			}
		}
	}
	return targets;
});

const cells = computed<Cell[]>(() => {
	const out: Cell[] = [];
	for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index++) {
		const t = targets.value.get(index);
		out.push({
			index,
			x: index % BOARD_SIZE,
			y: Math.floor(index / BOARD_SIZE),
			blocked: obstacles.value.has(index),
			piece: piecesByCell.value.get(index),
			direction: t?.direction ?? null,
			target: t?.target ?? null
		});
	}
	return out;
});

function onCellClick(cell: Cell) {
	if (props.disabled) return;
	if (cell.piece?.mine && (cell.piece.actionPoints ?? 0) > 0) {
		emit('select', cell.piece.dinozId);
		return;
	}
	if (cell.direction) emit('move', cell.direction);
}

function onKey(event: KeyboardEvent) {
	if (props.disabled || !selected.value) return;
	const target = event.target as HTMLElement | null;
	if (target && (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName) || target.isContentEditable))
		return;
	if (event.ctrlKey || event.metaKey || event.altKey) return;
	const map: Record<string, BoardDirection> = {
		ArrowUp: BoardDirection.N,
		ArrowDown: BoardDirection.S,
		ArrowRight: BoardDirection.E,
		ArrowLeft: BoardDirection.W
	};
	const direction = map[event.key];
	if (!direction) return;
	event.preventDefault();
	if ([...targets.value.values()].some(t => t.direction === direction)) emit('move', direction);
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style lang="scss" scoped>
$dirt: #a88c3a;
$rim: #49652a;
$chalk: #b4c088;
$rim-width: 11px;

.board-frame {
	padding: 7px + $rim-width;
	// Grainy dirt strip around the pitch
	background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 .25 0 0 0 0 .15 0 0 0 0 0 0 0 0 .7 -.05'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E"),
		$dirt;
	&.disabled .board {
		filter: saturate(0.6) brightness(0.92);
	}
}
.board {
	position: relative;
	display: grid;
	grid-template-columns: repeat(var(--size), 1fr);
	width: 100%;
	max-width: 100%;
	aspect-ratio: 1;
	// Chalk line, then the darker grass between the line and the dirt
	box-shadow:
		0 0 0 3px $chalk,
		0 0 0 $rim-width $rim,
		0 0 3px ($rim-width + 1px) $rim;
	background: radial-gradient(ellipse 34% 30% at 50% 50%, rgba(160, 145, 15, 0.85), rgba(160, 145, 15, 0) 100%),
		radial-gradient(ellipse at 50% 50%, #637023, #4e6a22 75%);
}
.score-line {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 0;
	margin-left: -1px;
	border-left: 2px dotted;
	pointer-events: none;
	&.west {
		border-color: var(--cdc-west);
		filter: drop-shadow(0 0 2px var(--cdc-west));
	}
	&.east {
		border-color: var(--cdc-east);
		filter: drop-shadow(0 0 2px var(--cdc-east));
	}
}
.cell {
	position: relative;
	aspect-ratio: 1;
	min-width: 0;
	box-sizing: border-box;
	border: 1px solid rgba(190, 205, 80, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	&.entry-west {
		background-color: color-mix(in srgb, var(--cdc-west) 16%, transparent);
	}
	&.entry-east {
		background-color: color-mix(in srgb, var(--cdc-east) 16%, transparent);
	}
	&.reachable {
		background-color: rgba(175, 205, 90, 0.42);
		cursor: pointer;
	}
	&.attackable {
		cursor: pointer;
		background-color: rgba(230, 70, 40, 0.3);
		box-shadow: inset 0 0 0 2px #ff5a3c;
	}
}
// Anchored on the bottom of its cell: a tall sprite overlaps the row behind it, without catching its clicks
.obstacle {
	position: absolute;
	left: 50%;
	bottom: 0;
	height: auto;
	transform: translateX(-50%);
	pointer-events: none;
	user-select: none;
}
.piece {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	// The side is told by the ground marker, the dinoz itself stands on the grass
	&::before {
		content: '';
		position: absolute;
		left: 8%;
		right: 8%;
		bottom: 2%;
		height: 34%;
		border-radius: 50%;
		background-color: color-mix(in srgb, var(--cdc-enemy) 55%, transparent);
		box-shadow: 0 0 0 1.5px var(--cdc-enemy);
	}
	&.own::before,
	&.ally::before {
		background-color: color-mix(in srgb, var(--cdc-mine) 55%, transparent);
		box-shadow: 0 0 0 1.5px var(--cdc-mine);
	}
	&.own {
		cursor: pointer;
	}
	&.exhausted :deep(.dinoz-icon) {
		filter: grayscale(0.7) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
	}
	&.selected::before {
		background-color: rgba(245, 197, 24, 0.6);
		box-shadow:
			0 0 0 2px #f5c518,
			0 0 6px 2px rgba(245, 197, 24, 0.8);
	}
	:deep(.dinoz-icon) {
		position: relative;
		filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
	}
	.hp {
		position: absolute;
		left: 10%;
		right: 10%;
		top: -1px;
		height: 3px;
		border-radius: 2px;
		background-color: #6b2d2d;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
		overflow: hidden;
		.hp-fill {
			height: 100%;
			background-color: #6ee04a;
		}
	}
}
</style>
