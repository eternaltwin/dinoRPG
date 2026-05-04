<template>
	<div class="wrapper">
		<DZTable v-if="ongoingAttack.length > 0">
			<tr>
				<th class="dinoz-header">Type</th>
				<th class="items-header">Ennemi</th>
				<th class="items-header">Date de fin</th>
				<th class="items-header" v-if="isClanMember">Action</th>
			</tr>
			<tr v-for="attack in ongoingAttack" :key="attack.id">
				<td>{{ attack.attacker.id === clanId ? $t('clan.war.attack') : $t('clan.war.defense') }}</td>
				<td>
					<RouterLink
						:to="{
							name: 'Clan',
							params: { id: attack.attacker.id === clanId ? attack.defender.id : attack.attacker.id }
						}"
						>{{ attack.attacker.id === clanId ? attack.defender.name : attack.attacker.name }}</RouterLink
					>
				</td>
				<td>{{ formatDate(attack.endsAt) }}</td>
				<td v-if="isClanMember && attack.attacker.id === clanId">
					<DZButton @click="forfeitWar(attack.id)">{{ $t('clan.war.forfeit') }}</DZButton>
				</td>
				<td v-else-if="isClanMember">
					<DZButton
						v-if="!ongoingAttack.some(a => a.attacker.id === attack.defender.id)"
						@click="declareWar(attack.attacker.id)"
						>{{ $t('clan.war.counter') }}</DZButton
					>
				</td>
			</tr>
		</DZTable>
		<div id="clanPrivate" class="df jcc fdc aic" v-if="isClanMember">
			<DZButton v-if="clanStore.getClan && !clanStore.getClan.castle" @click="buildCastle()">{{
				$t('clan.war.buildCastle')
			}}</DZButton>
			<DZDisclaimer v-else round :content="$t('clan.war.disclaimerCastle', { place })" />
			<div class="df jcc defense">
				<div id="pixiCanvas" />
				<VueDraggable v-model="defenders" class="df jcc fww line" :animation="150" @update="onUpdate">
					<DinozMini
						v-for="dinoz in defenders"
						v-tippy="{
							content: formatContent($t('clan.war.defender', { name: dinoz.name, level: dinoz.level })),
							theme: 'small'
						}"
						:key="dinoz.id"
						class="cell"
						:display="dinoz.display"
						flip
					/>
				</VueDraggable>
			</div>

			<!-- Section réparation -->
			<div class="repair-section" v-if="canRepair || activeRepairs.length > 0">
				<h3>{{ $t('clan.war.repair.title') }}</h3>
				<div class="repair-active" v-if="activeRepairs.length > 0">
					<p>{{ $t('clan.war.repair.active', { count: activeRepairs.length, max: REPAIR_MAX_STACK }) }}</p>
					<div class="repair-item" v-for="repair in activeRepairs" :key="repair.id">
						<span>{{ $t('clan.war.repair.info', { hp: repair.hpPerTick, freq: repair.frequency }) }}</span>
						<span>{{ $t('clan.war.repair.tick', { applied: repair.appliedTicks, total: repair.totalTicks }) }}</span>
					</div>
				</div>

				<div class="repair-form" v-if="canRepair">
					<div class="repair-row">
						<label>{{ $t('clan.war.repair.hpPerTick') }}</label>
						<input
							type="range"
							v-model.number="repairForm.hpPerTick"
							min="1"
							max="10"
							step="1"
							@input="loadRepairCost"
						/>
						<span>{{ repairForm.hpPerTick }} HP</span>
					</div>
					<div class="repair-row">
						<label>{{ $t('clan.war.repair.frequency') }}</label>
						<select v-model.number="repairForm.frequency" @change="loadRepairCost">
							<option :value="RepairFrequency.ONE_MIN">{{ $t('clan.war.repair.freq.1') }}</option>
							<option :value="RepairFrequency.FIVE_MIN">{{ $t('clan.war.repair.freq.5') }}</option>
							<option :value="RepairFrequency.FIFTEEN_MIN">{{ $t('clan.war.repair.freq.15') }}</option>
							<option :value="RepairFrequency.THIRTY_MIN">{{ $t('clan.war.repair.freq.30') }}</option>
						</select>
					</div>
					<div class="repair-row">
						<label>{{ $t('clan.war.repair.ticks') }}</label>
						<input
							type="range"
							v-model.number="repairForm.ticks"
							min="1"
							:max="REPAIR_MAX_TICKS"
							step="1"
							@input="loadRepairCost"
						/>
						<span
							>{{ repairForm.ticks }} ticks ({{
								$t('clan.war.repair.duration', {
									duration: repairForm.ticks * repairForm.frequency
								})
							}})</span
						>
					</div>
					<div class="repair-cost" v-if="repairCost">
						<p>
							{{
								$t('clan.war.repair.totalHp', {
									hp: Math.min(repairForm.hpPerTick * Math.min(repairForm.ticks, REPAIR_MAX_TICKS), REPAIR_MAX_HP),
									max: REPAIR_MAX_HP
								})
							}}
						</p>
						<p v-if="repairCost.canAfford">
							{{ $t('clan.war.repair.cost') }}
							<Tippy
								theme="normal"
								tag="div"
								v-for="ingredient in repairCost.ingredients"
								:key="ingredient.ingredientId"
								class="container"
							>
								<img
									:src="getImgURL('ingredients', ingredientNameList[ingredient.ingredientId] ?? '')"
									:alt="ingredientNameList[ingredient.ingredientId]"
								/>
								<p>x {{ ingredient.quantity }}</p>
								<template #content>
									<h1 v-html="formatContent($t(`ingredients.name.${ingredientNameList[ingredient.ingredientId]}`))" />
									<p
										v-html="formatContent($t(`ingredients.description.${ingredientNameList[ingredient.ingredientId]}`))"
									/>
								</template>
							</Tippy>
						</p>
						<p v-else class="repair-cant-afford">{{ $t('clan.war.repair.cantAfford') }}</p>
					</div>
					<DZButton :off="!repairCost || !repairCost.canAfford || repairLoading" @click="startRepair">
						{{ $t('clan.war.repair.start') }}
					</DZButton>
				</div>
			</div>
		</div>
		<div id="clanOpponent" v-else>
			<DZButton v-if="clanStore.getClan && !clanStore.getClan.castle" @click="declareWar(+$route.params.id)">{{
				$t('clan.war.declareWar')
			}}</DZButton>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import { ClanService } from '../../services';
import { errorHandler } from '../../utils';
import { clanStore } from '../../store/clanStore';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { Fight } from '@eternaltwin/dinorpg_animations';
import { DinoAction, EntranceEffect, transpiled } from '@drpg/core/models/fight/transpiler';
import { resolveFightingPlace } from '../../utils/transpileFight';
import { playerStore } from '../../store';
import { AttackStatus, Castle, Defender, treasureIngredient } from '@drpg/core/models/clan/clan';
import DZTable from '../common/DZTable.vue';
import DinozMini from '../dinoz/DinozMini.vue';
import { VueDraggable } from 'vue-draggable-plus';
import {
	REPAIR_MAX_HP,
	REPAIR_MAX_STACK,
	REPAIR_MAX_TICKS,
	RepairCost,
	RepairFrequency
} from '@drpg/core/models/clan/clanWar';
import { computeRepairCost } from '@drpg/core/models/clan/warCalculation';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';

export default defineComponent({
	name: 'ClanWar',
	components: { DinozMini, DZTable, DZDisclaimer, DZButton, VueDraggable },
	data() {
		return {
			castlePlace: undefined as undefined | number,
			playerStore: playerStore(),
			clanStore: clanStore(),
			loadedCastle: {} as Fight,
			isClanMember: false as boolean,
			ongoingAttack: [] as AttackStatus[],
			clanId: clanStore().getClanId as number,
			castle: null as Castle | null,
			defenders: [] as Defender[],
			repairCost: null as RepairCost | null,
			ingredients: [] as treasureIngredient[],
			repairLoading: false,
			repairForm: {
				hpPerTick: 1,
				frequency: RepairFrequency.ONE_MIN as RepairFrequency,
				ticks: REPAIR_MAX_TICKS
			},
			RepairFrequency,
			REPAIR_MAX_TICKS,
			REPAIR_MAX_STACK,
			REPAIR_MAX_HP,
			ingredientNameList: ingredientNameList
		};
	},
	computed: {
		place() {
			return this.$t(
				'place.name.' +
					Object.values(placeList).find(place => place.placeId === this.clanStore.getClan?.castle?.placeId)?.name
			);
		},
		activeRepairs() {
			return this.castle?.repairs ?? [];
		},
		canRepair() {
			return (
				this.castle &&
				this.castle.currentLife > 0 &&
				this.castle.currentLife < this.castle.maxLife &&
				this.activeRepairs.length < REPAIR_MAX_STACK
			);
		}
	},
	methods: {
		async onUpdate() {
			try {
				const order = await ClanService.reorderDefender(this.defenders.map(d => d.id));
				this.defenders = [
					...order.map(id => this.castle?.defender.find(d => d.id === id)).filter(d => d !== undefined)
				];
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async buildCastle() {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.buildCastle'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (!res) return;
			try {
				await ClanService.buildCastle();
				await this.clanStore.loadClan(+this.$route.params.id);
				await this.loadComponent();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async declareWar(clanId: number) {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (!res) return;
			try {
				await ClanService.declareWar(clanId);
				this.ongoingAttack = [];
				this.ongoingAttack = await ClanService.warStatus(+this.$route.params.id);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async forfeitWar(warId: number) {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (!res) return;
			try {
				await ClanService.forfeitWar(warId);
				this.ongoingAttack = [];
				this.ongoingAttack = await ClanService.warStatus(+this.$route.params.id);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		loadRepairCost() {
			if (!this.castle) return;
			this.repairCost = computeRepairCost(
				this.repairForm.hpPerTick,
				this.repairForm.frequency,
				this.repairForm.ticks,
				this.ingredients
			);
		},
		async startRepair() {
			if (!this.repairCost?.canAfford) return;
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-wrench'
			});
			if (!res) return;
			try {
				this.repairLoading = true;
				await ClanService.startRepair(this.repairForm.hpPerTick, this.repairForm.frequency, this.repairForm.ticks);
				this.loadComponent();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.repairLoading = false;
			}
		},
		loadAnimation() {
			const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
			if (!canvas) return;
			if (canvas.children.length > 0) {
				canvas.children[0].remove();
			}
			const placeId = this.clanStore.getClan?.castle?.placeId;
			if (!placeId) return;

			const defense = [] as transpiled[];
			this.defenders.forEach((defender, index) => {
				if (index >= 5) return;
				defense.push({
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: true,
						life: defender.life,
						maxLife: defender.maxLife,
						name: defender.name,
						side: false,
						scale: defender.maxLife / 100,
						fid: defender.id,
						gfx: defender.display,
						entrance: EntranceEffect.GROUND
					}
				});
			});
			this.loadedCastle = new Fight({
				...resolveFightingPlace(placeId),
				history: [
					{
						action: DinoAction.ADDCASTLE,
						castle: {
							life: this.castle?.currentLife,
							maxLife: this.castle?.maxLife,
							repair: this.castle?.repairs.length
						}
					},
					...defense,
					{ action: DinoAction.DISPLAY }
				]
			});
			const display = this.loadedCastle.getDisplay();
			display.style.maxWidth = '100%';
			canvas.appendChild(display);
		},
		async loadComponent() {
			this.isClanMember = this.playerStore.clanId == +this.$route.params.id;
			if (this.isClanMember) {
				const castle = await ClanService.castleStatus();
				if (!castle) return;
				this.castle = castle;
				this.ingredients = await ClanService.getClanTreasure(+this.$route.params.id);

				const order = this.castle.defenseOrder;
				const defenders = this.castle.defender;
				this.defenders = [...order.map(id => defenders.find(d => d.id === id)).filter(d => d !== undefined)];

				this.loadRepairCost();
				setTimeout(() => this.loadAnimation(), 250);
			}
			this.ongoingAttack = await ClanService.warStatus(+this.$route.params.id);
		}
	},
	async mounted() {
		await this.loadComponent();
	},
	unmounted() {
		this.loadedCastle.destroy();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	width: auto;
}

.defense {
	flex-direction: column;
	gap: 10px;
	width: 100%;
	border: 2px solid #874a16;
	border-radius: 4px;
	background-color: #f3ca92;
	padding: 6px;
	margin-top: 4px;

	.line {
		gap: 2px;
	}

	.cell {
		background-color: #f3ca92;
		cursor: move;
		border: 1px solid #c88f44;
		background-image: url('../../assets/background/table_cell.webp');
		background-position: -10px 0px;
		border-radius: 4px;
		padding: 2px 4px;
	}
}

#pixiCanvas {
	border-radius: 4px;
	overflow: hidden;
	width: 100%;
	display: flex;
	justify-content: center;

	:deep(canvas) {
		border-top: none;
		border-bottom: none;
		display: block;
	}
}

.repair-section {
	margin-top: 16px;
	width: 100%;
	max-width: 500px;
	border: 2px solid #874a16;
	border-radius: 4px;
	background-color: #fce3bc;
	padding: 12px;

	h3 {
		text-align: center;
		margin-bottom: 8px;
		color: #874a16;
		text-transform: uppercase;
		font-size: 0.9em;
		letter-spacing: 1px;
		border-bottom: 1px solid #c88f44;
		padding-bottom: 6px;
	}
}

.repair-active {
	margin-bottom: 12px;
	padding: 8px;
	background-color: #f3ca92;
	border: 1px solid #c88f44;
	border-radius: 4px;
}

.repair-item {
	display: flex;
	justify-content: space-between;
	font-size: 0.9em;
	margin-top: 4px;
	padding: 4px 0;
	border-bottom: 1px dashed #c88f44;

	&:last-child {
		border-bottom: none;
	}
}

.repair-form {
	display: flex;
	flex-direction: column;
	gap: 10px;
	border: 1px solid #c88f44;
	border-radius: 4px;
	padding: 10px;
	background-color: #f3ca92;
}

.repair-row {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-bottom: 6px;
	border-bottom: 1px dashed #c88f44;

	&:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	label {
		min-width: 120px;
		color: #874a16;
		font-weight: bold;
		font-size: 0.9em;
	}

	input[type='range'] {
		flex: 1;
	}
}

.repair-cost {
	font-size: 0.9em;
	padding: 8px;
	background-color: #fce3bc;
	border: 1px solid #c88f44;
	border-radius: 4px;
}

.repair-cant-afford {
	color: #c0392b;
	font-weight: bold;
}

.container {
	display: flex;
	gap: 7px;
	flex-wrap: wrap;
	align-items: center;
	background-color: #bc683c;
	border-radius: 80% 30px 30px 80%;
	color: white;
	width: 100px;

	p:first-letter {
		font-weight: normal;
		font-size: 75%;
		color: #fce3bc;
	}
}
</style>
