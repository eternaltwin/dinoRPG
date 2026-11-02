<template>
	<div class="board" :class="{ disabled }" :style="{ '--size': BOARD_SIZE }">
		<div
			v-for="cell in cells"
			:key="cell.index"
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
			<div
				v-if="cell.piece"
				class="piece"
				:class="{
					own: cell.piece.mine,
					ally: cell.piece.ally && !cell.piece.mine,
					enemy: !cell.piece.mine && !cell.piece.ally,
					selected: cell.piece.dinozId === selectedDinozId,
					exhausted: isOurs(cell.piece) && !(cell.piece.actionPoints && cell.piece.actionPoints > 0)
				}"
				:title="`${cell.piece.name} (${$t('clanChampionship.level', { level: cell.piece.level })}) - ${cell.piece.playerName}`"
			>
				<DinozIcon :display="cell.piece.display" :size="ICON_SIZE" />
				<div v-if="isOurs(cell.piece) && cell.piece.maxLife" class="hp">
					<div class="hp-fill" :style="{ width: `${hpPercent(cell.piece)}%` }" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { BOARD_SIZE, BoardDirection } from '@drpg/core/models/clan/clanChampionship';
import type { BoardPieceDTO, MatchBoardDTO } from '@drpg/core/models/clan/clanChampionship';
import { playerStore } from '../../../store';
import DinozIcon from './DinozIcon.vue';

const ICON_SIZE = 40;

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

const cells = computed<Cell[]>(() => {
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
	const out: Cell[] = [];
	for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index++) {
		const t = targets.get(index);
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
	if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;
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
	emit('move', direction);
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style lang="scss" scoped>
.board {
	display: grid;
	grid-template-columns: repeat(var(--size), 1fr);
	width: 100%;
	max-width: 100%;
	aspect-ratio: 1;
	border: 2px solid #874a16;
	background-color: #fbe6c4;
	&.disabled {
		opacity: 0.8;
	}
}
.cell {
	position: relative;
	aspect-ratio: 1;
	min-width: 0;
	border: 1px solid rgba(135, 74, 22, 0.15);
	display: flex;
	align-items: center;
	justify-content: center;
	&.entry-west {
		background-color: color-mix(in srgb, var(--cdc-west, #2b6cb0) 20%, transparent);
	}
	&.entry-east {
		background-color: color-mix(in srgb, var(--cdc-east, #b03a2e) 20%, transparent);
	}
	&.blocked {
		background: repeating-linear-gradient(45deg, #6b5a46, #6b5a46 4px, #4a3d2e 4px, #4a3d2e 8px);
	}
	&.reachable {
		background-color: rgba(80, 180, 80, 0.45);
		cursor: pointer;
	}
	&.attackable {
		cursor: pointer;
		box-shadow: inset 0 0 0 2px #d00;
	}
}
.piece {
	position: relative;
	width: 92%;
	height: 92%;
	box-sizing: border-box;
	border: 2px solid var(--cdc-enemy, #b03a2e);
	border-radius: 4px;
	background-color: rgba(255, 255, 255, 0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	&.own,
	&.ally {
		border-color: var(--cdc-mine, #2b6cb0);
	}
	&.own {
		cursor: pointer;
		background-color: rgba(255, 255, 255, 0.85);
	}
	&.exhausted {
		filter: grayscale(0.6);
	}
	&.selected {
		box-shadow: 0 0 0 2px #f5c518;
		z-index: 1;
	}
	.hp {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 4px;
		background-color: #6b2d2d;
		.hp-fill {
			height: 100%;
			background-color: #3fbf3f;
		}
	}
}
</style>
