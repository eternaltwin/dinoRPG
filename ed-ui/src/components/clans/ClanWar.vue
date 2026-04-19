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
				<td>{{ formatDate(attack.dateEnd) }}</td>
				<td v-if="isClanMember">
					<DZButton @click="forfeitWar(attack.id)">{{ $t('clan.war.forfeit') }}</DZButton>
				</td>
			</tr>
		</DZTable>
		<div id="clanPrivate" class="df jcc fdc aic" v-if="isClanMember">
			<DZButton v-if="clanStore.getClan && !clanStore.getClan.castle" @click="buildCastle()">{{
				$t('clan.war.buildCastle')
			}}</DZButton>
			<DZDisclaimer v-else round :content="$t('clan.war.disclaimerCastle', { place })" />
			<div id="pixiCanvas" />
			<div class="df jcc defense">
				<VueDraggable v-model="defenders" class="df jcc" :animation="150" @update="onUpdate">
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
		</div>
		<div id="clanOpponent" v-else>
			<DZButton v-if="clanStore.getClan && !clanStore.getClan.castle" @click="declareWar()">{{
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
import { AttackStatus, Castle, Defender } from '@drpg/core/models/clan/clan';
import DZTable from '../common/DZTable.vue';
import DinozMini from '../dinoz/DinozMini.vue';
import { VueDraggable } from 'vue-draggable-plus';

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
			castle: {} as Castle,
			defenders: [] as Defender[]
		};
	},
	computed: {
		place() {
			return this.$t(
				'place.name.' +
					Object.values(placeList).find(place => place.placeId === this.clanStore.getClan?.castle?.placeId)?.name
			);
		}
	},
	methods: {
		async onUpdate() {
			try {
				const order = await ClanService.reorderDefender(this.defenders.map(d => d.id));
				this.defenders = [...order.map(id => this.castle.defender.find(d => d.id === id)).filter(d => d !== undefined)];
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
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async declareWar() {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (!res) return;
			try {
				await ClanService.declareWar(+this.$route.params.id);
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
		loadAnimation() {
			const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
			if (!canvas) return;
			const placeId = this.clanStore.getClan?.castle?.placeId;
			if (!placeId) {
				return;
			}
			const defense = [] as transpiled[];
			this.defenders.forEach((defender, index) => {
				if (index >= 10) return;
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
							life: this.castle.currentLife,
							maxLife: this.castle.maxLife,
							enclos: false,
							invisible: false
						}
					},
					...defense
				]
			});
			const display = this.loadedCastle.getDisplay();
			display.style.maxWidth = '100%';
			canvas.appendChild(display);
		}
	},
	async mounted() {
		this.isClanMember = this.playerStore.clanId == +this.$route.params.id;
		if (this.isClanMember) {
			this.castle = await ClanService.castleStatus();

			const order = this.castle.defenseOrder;
			const defenders = this.castle.defender;

			this.defenders = [...order.map(id => defenders.find(d => d.id === id)).filter(d => d !== undefined)];
			setTimeout(() => this.loadAnimation(), 250);
		}
		this.ongoingAttack = await ClanService.warStatus(+this.$route.params.id);
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	width: auto;
}

.defense {
	flex-direction: row;
	.cell {
		background-color: #f3ca92;
		cursor: move;
		border: 1px solid #c88f44;
		background-image: url('../../assets/background/table_cell.webp');
		background-position: -10px 0px;
		padding: 2px 4px;
	}
}

#pixiCanvas :deep(canvas) {
	border-top: 1px solid #874a16;
	border-bottom: 1px solid #874a16;
}
</style>
