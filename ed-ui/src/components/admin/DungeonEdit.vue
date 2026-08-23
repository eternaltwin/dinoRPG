<template>
	<DZTable>
		<tr>
			<th class="items-header">ID</th>
			<th class="items-header">Name</th>
			<th class="items-header">Type</th>
			<th class="items-header">Active</th>
			<th class="items-header">Play</th>
		</tr>
		<tr v-for="dungeon in dungeons" :key="dungeon.id">
			<td>{{ dungeon.id }}</td>
			<td>{{ dungeon.name }}</td>
			<td>{{ dungeon.type }}</td>
			<td>{{ dungeon.isActive ? 'yes' : 'no' }}</td>
			<td>
				<RouterLink :to="`/dungeon/${dungeon.id}`">Enter</RouterLink>
			</td>
		</tr>
	</DZTable>

	<label for="dungeon">Select a dungeon to edit : </label>
	<select id="dungeon" v-model="selectedDungeonId" @change="selectDungeon()">
		<option value="">-- Create new dungeon --</option>
		<option v-for="dungeon in dungeons" :key="dungeon.id" :value="dungeon.id">
			{{ dungeon.name }} (id: {{ dungeon.id }})
		</option>
	</select>

	<form @submit.prevent="handleSubmit">
		<fieldset>
			<legend>Skin</legend>
			<div>
				<label>Type</label>
				<select v-model="form.type">
					<option v-for="value in DungeonType" :key="value" :value="value">{{ value }}</option>
				</select>
			</div>
		</fieldset>

		<fieldset>
			<legend>Catalog</legend>
			<div>
				<label>Place start (gate to reach the dungeon)</label>
				<select v-model.number="form.placeStart">
					<option :value="null">-- none --</option>
					<option v-for="[key, value] in placeEnumEntries" :key="key" :value="value">{{ key }} ({{ value }})</option>
				</select>
			</div>
			<div>
				<label>Place end (exit place)</label>
				<select v-model.number="form.placeEnd">
					<option :value="null">-- none --</option>
					<option v-for="[key, value] in placeEnumEntries" :key="key" :value="value">{{ key }} ({{ value }})</option>
				</select>
			</div>
			<div>
				<label>Condition (raw JSON)</label>
				<textarea v-model="form.condition" rows="3" placeholder='{"active":true}'></textarea>
			</div>
			<div>
				<label>
					<input type="checkbox" v-model="form.isActive" />
					Active (enterable in-game)
				</label>
			</div>
		</fieldset>

		<fieldset>
			<legend>Custom layout</legend>
			<div>
				<label>Encoded layout string (leave empty to generate; generation params below are then ignored)</label>
				<textarea v-model="form.layout" rows="4" placeholder="[[24x24x6 …]]…"></textarea>
			</div>
		</fieldset>

		<fieldset>
			<legend>Generation</legend>
			<div>
				<label>Seed (empty = random)</label>
				<input type="number" v-model.number="form.seed" />
			</div>
			<div>
				<label>Name</label>
				<input type="text" v-model="form.name" />
			</div>
			<div>
				<label>Monster level</label>
				<input type="number" v-model.number="form.monsterLevel" min="1" max="200" />
			</div>
			<div>
				<label>Monster pool (ctrl-click to multi-select; empty = keep this name's existing pool)</label>
				<select multiple size="8" v-model="form.pool">
					<option v-for="m in monsterNames" :key="m" :value="m">{{ m }} (lvl {{ monsterList[m].level }})</option>
				</select>
			</div>
			<div>
				<label>Width</label>
				<input type="number" v-model.number="form.width" min="8" max="256" />
			</div>
			<div>
				<label>Height</label>
				<input type="number" v-model.number="form.height" min="8" max="256" />
			</div>
			<div>
				<label>Levels</label>
				<input type="number" v-model.number="form.level" min="1" max="64" />
			</div>
			<div>
				<label>Noise (0 disables)</label>
				<input type="number" v-model.number="form.noise" min="0" max="1" step="0.05" />
			</div>
			<div>
				<label>Noise filter passes</label>
				<input type="number" v-model.number="form.filters" min="0" max="50" />
			</div>
			<div>
				<label>Minimum surface ratio</label>
				<input type="number" v-model.number="form.surface" min="0" max="1" step="0.05" />
			</div>
		</fieldset>

		<input type="submit" :value="selectedDungeonId ? 'Mettre à jour le donjon' : 'Créer le donjon'" />

		<div v-if="selectedDungeonId">
			<button type="button" @click="deleteDungeon()">Delete dungeon</button>
		</div>
	</form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService } from '../../services';
import { errorHandler } from '../../utils';
import { DungeonType } from '@drpg/prisma/enums';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import DZTable from '../common/DZTable.vue';

const placeEnumEntries = Object.entries(PlaceEnum).filter(([key]) => isNaN(Number(key))) as [string, number][];

export default defineComponent({
	name: 'DungeonEdit',
	components: { DZTable },
	data() {
		return {
			DungeonType: DungeonType,
			placeEnumEntries,
			monsterList,
			monsterNames: Object.keys(monsterList),
			selectedDungeonId: '' as string,
			form: {
				type: DungeonType.cavern as string,
				name: '',
				monsterLevel: 1,
				pool: [] as string[],
				layout: '',
				seed: undefined as number | undefined,
				width: 24,
				height: 24,
				level: 6,
				noise: 0.2,
				filters: 10,
				surface: 0.3,
				placeStart: null as number | null,
				placeEnd: null as number | null,
				condition: '{}',
				isActive: true
			},
			dungeons: [] as Awaited<ReturnType<typeof AdminService.getDungeons>>
		};
	},
	methods: {
		async selectDungeon() {
			if (!this.selectedDungeonId) {
				return;
			}
			try {
				const dungeon = await AdminService.getDungeon(this.selectedDungeonId);
				this.form.name = dungeon.name;
				this.form.type = dungeon.type;
				this.form.monsterLevel = dungeon.level;
				this.form.placeStart = dungeon.placeStart;
				this.form.placeEnd = dungeon.placeEnd;
				this.form.condition = dungeon.condition;
				this.form.isActive = dungeon.isActive;
				this.form.pool = dungeon.monsterPool ? JSON.parse(dungeon.monsterPool) : [];
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async handleSubmit() {
			if (this.form.name.length < 1) {
				return;
			}
			try {
				if (this.selectedDungeonId) {
					await AdminService.updateDungeon(this.selectedDungeonId, {
						name: this.form.name,
						type: this.form.type,
						level: this.form.monsterLevel,
						placeStart: this.form.placeStart,
						placeEnd: this.form.placeEnd,
						condition: this.form.condition,
						pool: this.form.pool,
						isActive: this.form.isActive
					});
					this.$toast.success(`Dungeon ${this.selectedDungeonId} updated`);
					this.selectedDungeonId = '';
					this.dungeons = await AdminService.getDungeons();
					return;
				}
				const layout = this.form.layout.trim();
				const created = await AdminService.createDungeon(
					layout !== ''
						? {
								type: this.form.type,
								layout,
								name: this.form.name,
								monsterLevel: this.form.monsterLevel,
								pool: this.form.pool,
								placeStart: this.form.placeStart ?? undefined,
								placeEnd: this.form.placeEnd ?? undefined,
								condition: this.form.condition,
								isActive: this.form.isActive
							}
						: {
								type: this.form.type,
								name: this.form.name,
								monsterLevel: this.form.monsterLevel,
								pool: this.form.pool,
								// an emptied number input is '' — omit it so the backend picks a random seed
								seed: typeof this.form.seed === 'number' ? this.form.seed : undefined,
								width: this.form.width,
								height: this.form.height,
								level: this.form.level,
								noise: this.form.noise,
								filters: this.form.filters,
								surface: this.form.surface,
								placeStart: this.form.placeStart ?? undefined,
								placeEnd: this.form.placeEnd ?? undefined,
								condition: this.form.condition,
								isActive: this.form.isActive
							}
				);
				this.$toast.success(`Dungeon ${created.id} created`);
				this.dungeons = await AdminService.getDungeons();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async deleteDungeon() {
			if (!this.selectedDungeonId) {
				return;
			}
			try {
				await AdminService.deleteDungeon(this.selectedDungeonId);
				this.selectedDungeonId = '';
				this.form.name = '';
				this.dungeons = await AdminService.getDungeons();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		try {
			this.dungeons = await AdminService.getDungeons();
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
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
	select,
	textarea {
		width: calc(100% - 20px);
		padding: 5px;
		margin-top: 5px;
		margin-bottom: 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
		font-family: monospace;
	}
	input[type='submit'] {
		margin-top: 20px;
		background-color: #c64e36;
		color: #fffdba;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		border-radius: 5px;
	}
}
</style>
