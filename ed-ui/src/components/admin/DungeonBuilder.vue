<template>
	<form @submit.prevent="handleSubmit">
		<fieldset>
			<legend>Dungeon</legend>
			<div>
				<label>Theme</label>
				<select v-model="form.type">
					<option v-for="value in DungeonType" :key="value" :value="value">{{ value }}</option>
				</select>
			</div>
			<div>
				<label>Name</label>
				<input type="text" v-model="form.name" />
			</div>
			<div>
				<label>Monster level (team budget)</label>
				<input type="number" v-model.number="form.monsterLevel" min="1" max="200" />
			</div>
			<div>
				<label>Monster pool (ctrl-click to multi-select; empty = DungeonList lookup by name)</label>
				<select multiple size="8" v-model="form.pool">
					<option v-for="m in monsterNames" :key="m" :value="m">{{ m }} (lvl {{ monsterList[m].level }})</option>
				</select>
			</div>
		</fieldset>

		<fieldset>
			<legend>Grid</legend>
			<div class="row">
				<label>Width</label>
				<input type="number" v-model.number="width" min="8" max="64" />
				<label>Height</label>
				<input type="number" v-model.number="height" min="8" max="64" />
				<button type="button" @click="initGrid">Reset grid</button>
			</div>
			<div class="row">
				<button v-for="(_, l) in levels" :key="l" type="button" :class="{ active: cur === l }" @click="cur = l">
					Floor {{ l + 1 }}
				</button>
				<button type="button" :disabled="levels.length >= 10" @click="addFloor">+ Add floor</button>
			</div>
			<div class="row tools">
				<label v-for="t in tools" :key="t.id" :class="{ active: tool === t.id }">
					<input type="radio" v-model="tool" :value="t.id" />
					{{ t.label }}
				</label>
				<template v-if="tool === 'lock'">
					<label>key #</label>
					<input type="number" v-model.number="keyIndex" min="0" max="63" class="short" />
				</template>
				<template v-if="tool === 'item'">
					<select v-model.number="itemKind">
						<option :value="0">Key</option>
						<option :value="1">Gold</option>
						<option :value="2">Heal</option>
						<option :value="3">Scenario</option>
					</select>
					<label>value</label>
					<input type="number" v-model.number="itemValue" min="0" :max="itemKind === 0 ? 63 : 255" class="short" />
				</template>
			</div>
			<p class="hint">
				Drag to paint floor/wall. Click an entity to remove it. Stairs are placed as a pair with the floor above.
			</p>
			<div
				class="grid"
				:style="{ gridTemplateColumns: `repeat(${levels[0] ? levels[cur].floor[0].length : 0}, 18px)` }"
				@mousedown.prevent
				@dragstart.prevent
			>
				<template v-for="(row, y) in levels[cur].floor">
					<div
						v-for="(cell, x) in row"
						:key="`${x},${y}`"
						class="cell"
						:class="[cell ? 'floor' : 'wall', cellMap[`${x},${y}`]?.cls]"
						@mousedown="onCellDown(x, y)"
						@mouseover="onCellOver(x, y)"
					>
						{{ cellMap[`${x},${y}`]?.glyph ?? '' }}
					</div>
				</template>
			</div>
		</fieldset>

		<input type="submit" value="Créer le donjon" />
	</form>

	<DZTable>
		<tr>
			<th class="items-header">ID</th>
			<th class="items-header">Type</th>
			<th class="items-header">Play</th>
		</tr>
		<tr v-for="dungeon in dungeons" :key="dungeon.id">
			<td>{{ dungeon.id }}</td>
			<td>{{ dungeon.type }}</td>
			<td>
				<RouterLink :to="`/dungeon/${dungeon.id}`">Enter</RouterLink>
			</td>
		</tr>
	</DZTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService } from '../../services';
import { errorHandler } from '../../utils';
import { DungeonType } from '@drpg/prisma/enums';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import type { DungeonGridDoor, DungeonGridItem } from '@drpg/core/models/dungeon/DungeonEditor';
import DZTable from '../common/DZTable.vue';

type EditorLevel = { floor: boolean[][]; doors: DungeonGridDoor[]; items: DungeonGridItem[] }; // floor[y][x]

const ITEM_GLYPHS = ['K', 'G', 'H', 'S'];

export default defineComponent({
	name: 'DungeonBuilder',
	components: { DZTable },
	data() {
		return {
			DungeonType,
			monsterList,
			monsterNames: Object.keys(monsterList),
			tools: [
				{ id: 'floor', label: 'Floor' },
				{ id: 'wall', label: 'Wall' },
				{ id: 'start', label: 'Start' },
				{ id: 'exit', label: 'Exit' },
				{ id: 'stair', label: 'Stairs' },
				{ id: 'monster', label: 'Monster' },
				{ id: 'lock', label: 'Locked door' },
				{ id: 'item', label: 'Item' }
			],
			form: { type: DungeonType.cavern as string, name: '', monsterLevel: 1, pool: [] as string[] },
			width: 16,
			height: 16,
			// The template reads levels[cur] on first render, before mounted — start with a live grid.
			levels: [
				{ floor: Array.from({ length: 16 }, () => new Array<boolean>(16).fill(false)), doors: [], items: [] }
			] as EditorLevel[],
			cur: 0,
			tool: 'floor',
			keyIndex: 0,
			itemKind: 0,
			itemValue: 0,
			start: null as { x: number; y: number; l: number } | null,
			exit: null as { x: number; y: number; l: number } | null,
			painting: false,
			stopPaint: null as (() => void) | null,
			dungeons: [] as { id: string; type: string }[]
		};
	},
	computed: {
		/** Entities of the active floor, keyed "x,y". */
		cellMap(): Record<string, { glyph: string; cls: string }> {
			const map: Record<string, { glyph: string; cls: string }> = {};
			const lvl = this.levels[this.cur];
			if (!lvl) return map;
			for (const d of lvl.doors) {
				map[`${d.x},${d.y}`] =
					d.up === true
						? { glyph: '▲', cls: 'stair' }
						: d.up === false
							? { glyph: '▼', cls: 'stair' }
							: d.key !== null
								? { glyph: `L${d.key}`, cls: 'lock' }
								: { glyph: 'M', cls: 'monster' };
			}
			for (const it of lvl.items) {
				map[`${it.x},${it.y}`] = { glyph: `${ITEM_GLYPHS[it.k]}${it.v}`, cls: 'item' };
			}
			if (this.start?.l === this.cur) map[`${this.start.x},${this.start.y}`] = { glyph: '@', cls: 'start' };
			if (this.exit?.l === this.cur) map[`${this.exit.x},${this.exit.y}`] = { glyph: 'X', cls: 'exit' };
			return map;
		}
	},
	methods: {
		blankLevel(): EditorLevel {
			return {
				floor: Array.from({ length: this.height }, () => new Array<boolean>(this.width).fill(false)),
				doors: [],
				items: []
			};
		},
		initGrid() {
			this.width = Math.min(64, Math.max(8, this.width || 16));
			this.height = Math.min(64, Math.max(8, this.height || 16));
			this.levels = [this.blankLevel()];
			this.cur = 0;
			this.start = null;
			this.exit = null;
		},
		addFloor() {
			if (this.levels.length < 10) this.levels.push(this.blankLevel());
		},
		hasEntity(l: number, x: number, y: number): boolean {
			const lvl = this.levels[l];
			return (
				lvl.doors.some(d => d.x === x && d.y === y) ||
				lvl.items.some(i => i.x === x && i.y === y) ||
				(this.start?.l === l && this.start.x === x && this.start.y === y) ||
				(this.exit?.l === l && this.exit.x === x && this.exit.y === y)
			);
		},
		removeEntitiesAt(l: number, x: number, y: number) {
			const lvl = this.levels[l];
			// A stair's other half lives on the adjacent floor — drop it too.
			for (const d of lvl.doors.filter(d => d.x === x && d.y === y && d.up !== null)) {
				const other = this.levels[l + (d.up ? 1 : -1)];
				if (other) other.doors = other.doors.filter(o => !(o.x === x && o.y === y && o.up === !d.up));
			}
			lvl.doors = lvl.doors.filter(d => !(d.x === x && d.y === y));
			lvl.items = lvl.items.filter(i => !(i.x === x && i.y === y));
			if (this.start?.l === l && this.start.x === x && this.start.y === y) this.start = null;
			if (this.exit?.l === l && this.exit.x === x && this.exit.y === y) this.exit = null;
		},
		paint(x: number, y: number) {
			const asFloor = this.tool === 'floor';
			this.levels[this.cur].floor[y][x] = asFloor;
			if (!asFloor) this.removeEntitiesAt(this.cur, x, y);
		},
		onCellDown(x: number, y: number) {
			if (this.tool === 'floor' || this.tool === 'wall') {
				this.painting = true;
				this.paint(x, y);
			} else {
				this.place(x, y);
			}
		},
		onCellOver(x: number, y: number) {
			if (this.painting) this.paint(x, y);
		},
		place(x: number, y: number) {
			const l = this.cur;
			if (this.hasEntity(l, x, y)) {
				this.removeEntitiesAt(l, x, y);
				return;
			}
			if (!this.levels[l].floor[y][x]) {
				this.$toast.warning('Place entities on floor cells');
				return;
			}
			switch (this.tool) {
				case 'start':
					if (this.start) this.removeEntitiesAt(this.start.l, this.start.x, this.start.y);
					this.start = { x, y, l };
					break;
				case 'exit':
					if (this.exit) this.removeEntitiesAt(this.exit.l, this.exit.x, this.exit.y);
					this.exit = { x, y, l };
					break;
				case 'stair': {
					const above = this.levels[l + 1];
					if (!above) {
						this.$toast.warning('No floor above — add one first');
						return;
					}
					if (this.hasEntity(l + 1, x, y)) {
						this.$toast.warning('The cell above is occupied');
						return;
					}
					this.levels[l].doors.push({ x, y, up: true, key: null });
					above.doors.push({ x, y, up: false, key: null });
					above.floor[y][x] = true; // the landing must be walkable
					break;
				}
				case 'monster':
					this.levels[l].doors.push({ x, y, up: null, key: null });
					break;
				case 'lock':
					this.levels[l].doors.push({ x, y, up: null, key: Math.min(63, Math.max(0, this.keyIndex || 0)) });
					break;
				case 'item':
					this.levels[l].items.push({ x, y, k: this.itemKind, v: this.itemValue || 0 });
					break;
			}
		},
		async refresh() {
			this.dungeons = await AdminService.getDungeons();
		},
		async handleSubmit() {
			if (!this.form.name) {
				this.$toast.warning('Name the dungeon');
				return;
			}
			if (!this.start || !this.exit) {
				this.$toast.warning('Place a start and an exit');
				return;
			}
			try {
				const created = await AdminService.createDungeonFromGrid({
					type: this.form.type,
					name: this.form.name,
					monsterLevel: this.form.monsterLevel,
					pool: this.form.pool,
					grid: {
						width: this.levels[0].floor[0].length,
						height: this.levels[0].floor.length,
						start: this.start,
						exit: this.exit,
						levels: this.levels.map(lvl => ({
							floor: lvl.floor.map(row => row.map(c => (c ? '1' : '0')).join('')),
							doors: lvl.doors,
							items: lvl.items
						}))
					}
				});
				this.$toast.success(`Dungeon ${created.id} created`);
				await this.refresh();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		this.stopPaint = () => (this.painting = false);
		window.addEventListener('mouseup', this.stopPaint);
		try {
			await this.refresh();
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	},
	unmounted() {
		if (this.stopPaint) window.removeEventListener('mouseup', this.stopPaint);
	}
});
</script>

<style lang="scss" scoped>
form {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	border-spacing: 2px;
	padding: 5px;
	fieldset {
		border: 2px solid #bc683c;
		margin: 15px 0;
		padding: 20px;
		width: 90%;
	}
	legend {
		font-size: 13pt;
		text-shadow: 1px 1px 0px #356847;
		padding-left: 8px;
		padding-right: 8px;
		padding-bottom: 8px;
		height: 41px;
		color: #fffdba;
		text-transform: uppercase;
		font-weight: bold;
		letter-spacing: 1.5pt;
		text-align: left;
		border: 1px solid #356847;
		background-color: #c64e36;
		background-image: url('../../assets/background/table_header.webp');
		background-position: left bottom;
		width: 60%;
	}
	div {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
	}
	label {
		display: block;
		margin-bottom: 5px;
		color: #710;
		font-size: 9pt;
	}
	input[type='text'],
	input[type='number'],
	select {
		width: calc(100% - 20px);
		padding: 5px;
		margin-top: 5px;
		margin-bottom: 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
		font-family: monospace;
	}
	input[type='submit'],
	button {
		margin-top: 5px;
		background-color: #c64e36;
		color: #fffdba;
		border: none;
		padding: 6px 12px;
		cursor: pointer;
		border-radius: 5px;
		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
		&.active {
			background-color: #356847;
		}
	}
	.row {
		flex-direction: row;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		input[type='number'] {
			width: 70px;
		}
	}
	.tools label {
		cursor: pointer;
		padding: 4px 8px;
		border: 1px solid #c88f44;
		border-radius: 4px;
		margin-bottom: 0;
		&.active {
			background-color: #356847;
			color: #fffdba;
		}
		input {
			display: none;
		}
	}
	.short {
		width: 60px;
	}
	.hint {
		color: #710;
		font-size: 9pt;
	}
	.grid {
		display: grid;
		gap: 1px;
		background-color: #bc683c;
		border: 2px solid #bc683c;
		width: max-content;
		max-width: 100%;
		overflow: auto;
		user-select: none;
		.cell {
			width: 18px;
			height: 18px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 9px;
			font-family: monospace;
			font-weight: bold;
			cursor: crosshair;
			&.wall {
				background-color: #5a3a26;
			}
			&.floor {
				background-color: #f3ca92;
			}
			&.start {
				background-color: #7fd07f;
			}
			&.exit {
				background-color: #d07f7f;
			}
			&.stair {
				background-color: #9fc5e8;
			}
			&.monster {
				background-color: #d08fd0;
				color: #500;
			}
			&.lock {
				background-color: #e8d44d;
			}
			&.item {
				background-color: #ffe9a8;
			}
		}
	}
}
</style>
