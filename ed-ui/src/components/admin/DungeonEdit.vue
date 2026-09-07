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
			<div>
				<label>
					Fight backgrounds (ctrl-click to multi-select; one is drawn at random per fight; empty = use the start place's
					own background)
				</label>
				<select multiple size="8" v-model="form.fightBackgrounds">
					<option v-for="b in fightBackgroundList" :key="b" :value="b">{{ b }}</option>
				</select>
				<div class="bg-previews">
					<figure v-for="b in form.fightBackgrounds" :key="b">
						<img
							v-if="!missingPreviews.includes(b)"
							:src="backgroundPreview(b)"
							:alt="b"
							@error="missingPreviews.push(b)"
						/>
						<div v-else class="no-preview">no preview</div>
						<figcaption>{{ b }}</figcaption>
					</figure>
				</div>
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
			<legend>Scenarios (a Scenario item with value N triggers entry #N: popup text + optional grants)</legend>
			<label class="hint">
				An imported or generated layout carries Scenario items indexing this list — leave it short and the matching
				chests/scrolls stay silent. The layout signature counts them: "4S" means entries #0 to #3 are needed.
			</label>
			<div v-for="(sc, i) in scenarios" :key="i" class="row scenario">
				<b>#{{ i }}</b>
				<select v-model="sc.icon">
					<option value="chest">chest</option>
					<option value="scroll">scroll</option>
				</select>
				<select v-model="sc.obj">
					<option :value="null">no item</option>
					<option v-for="(it, id) in itemList" :key="id" :value="Number(id)">{{ it.name }}</option>
				</select>
				<input type="number" v-model.number="sc.count" min="1" max="999" class="short" title="item count" />
				<select v-model="sc.collec">
					<option :value="null">no collection</option>
					<option v-for="(r, id) in rewardList" :key="id" :value="Number(id)">{{ r.name }}</option>
				</select>
				<input type="text" v-model="sc.text" placeholder="Popup text" class="text" />
				<button type="button" @click="scenarios.splice(i, 1)">✕</button>
			</div>
			<button type="button" @click="scenarios.push({ text: '', icon: 'chest', obj: null, count: 1, collec: null })">
				+ scenario
			</button>
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
import { fightBackgroundList } from '@drpg/core/models/fight/FightBackgroundList';
import { itemList } from '@drpg/core/models/item/ItemList';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import type { DungeonScenario } from '@drpg/core/models/dungeon/DungeonClient';
import DZTable from '../common/DZTable.vue';

/** Editor row: the form uses null for "none" where DungeonScenario simply omits the field. */
type ScenarioRow = { text: string; icon: 'chest' | 'scroll'; obj: number | null; count: number; collec: number | null };

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
			fightBackgroundList,
			itemList,
			rewardList,
			scenarios: [] as ScenarioRow[],
			// Keys whose assets/battle preview 404'd — see backgroundPreview.
			missingPreviews: [] as string[],
			selectedDungeonId: '' as string,
			form: {
				type: DungeonType.cavern as string,
				name: '',
				monsterLevel: 1,
				pool: [] as string[],
				fightBackgrounds: [] as string[],
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
		/**
		 * assets/battle only mirrors part of the animation engine's background set, so ~a third of
		 * the keys have no local file — those 404 and fall back to a placeholder.
		 */
		backgroundPreview(name: string) {
			return new URL(`/src/assets/battle/${name}.webp`, import.meta.url).toString();
		},
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
				this.form.fightBackgrounds = dungeon.fightBackgrounds ? JSON.parse(dungeon.fightBackgrounds) : [];
				this.scenarios = (dungeon.scenarios ? (JSON.parse(dungeon.scenarios) as DungeonScenario[]) : []).map(sc => ({
					text: sc.text,
					icon: sc.icon ?? 'chest',
					obj: sc.obj ?? null,
					count: sc.count ?? 1,
					collec: sc.collec ?? null
				}));
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		/** Drop the form's nulls: the backend validator rejects an explicit null item/reward. */
		scenarioPayload() {
			return this.scenarios.map(sc => ({
				text: sc.text,
				icon: sc.icon,
				obj: sc.obj ?? undefined,
				count: sc.obj != null ? sc.count : undefined,
				collec: sc.collec ?? undefined
			}));
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
						fightBackgrounds: this.form.fightBackgrounds,
						scenarios: this.scenarioPayload(),
						isActive: this.form.isActive
					});
					this.$toast.success(`Dungeon ${this.selectedDungeonId} updated`);
					this.selectedDungeonId = '';
					this.scenarios = [];
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
								fightBackgrounds: this.form.fightBackgrounds,
								scenarios: this.scenarioPayload(),
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
								fightBackgrounds: this.form.fightBackgrounds,
								scenarios: this.scenarioPayload(),
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
				this.scenarios = [];
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
	.row {
		flex-direction: row;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		input[type='number'] {
			width: 70px;
		}
	}
	.short {
		width: 60px;
	}
	.scenario .text {
		flex: 1;
		min-width: 200px;
	}
	.bg-previews {
		flex-direction: row;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 10px;
		figure {
			margin: 0;
			width: 110px;
			img,
			.no-preview {
				width: 110px;
				height: 60px;
				object-fit: cover;
				border: 1px solid #c88f44;
			}
			.no-preview {
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #f3ca92;
				color: #a86;
				font-size: 8pt;
			}
			figcaption {
				color: #710;
				font-size: 8pt;
				font-family: monospace;
				text-align: center;
			}
		}
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
