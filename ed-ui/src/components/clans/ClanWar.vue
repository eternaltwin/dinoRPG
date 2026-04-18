<template>
	<div class="wrapper">
		<DZTable>
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
					<DZButton>{{ $t('clan.war.forfeit') }}</DZButton>
				</td>
			</tr>
		</DZTable>
		<div id="clanPrivate" class="df jcc fdc aic" v-if="isClanMember">
			<DZButton v-if="clanStore.getClan && !clanStore.getClan.castle" @click="buildCastle()">{{
				$t('clan.war.buildCastle')
			}}</DZButton>
			<DZDisclaimer v-else round :content="$t('clan.war.disclaimerCastle', { place })" />
			<div id="pixiCanvas" />
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
import { DinoAction } from '@drpg/core/models/fight/transpiler';
import { resolveFightingPlace } from '../../utils/transpileFight';
import { playerStore } from '../../store';
import { AttackStatus } from '@drpg/core/models/clan/clan';
import DZTable from '../common/DZTable.vue';

export default defineComponent({
	name: 'ClanWar',
	components: { DZTable, DZDisclaimer, DZButton },
	data() {
		return {
			castlePlace: undefined as undefined | number,
			playerStore: playerStore(),
			clanStore: clanStore(),
			loadedCastle: {} as Fight,
			isClanMember: false as boolean,
			ongoingAttack: [] as AttackStatus[],
			clanId: clanStore().getClanId as number
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
		async buildCastle() {
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
		loadAnimation() {
			const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
			if (!canvas) return;
			const placeId = this.clanStore.getClan?.castle?.placeId;
			if (!placeId) {
				return;
			}
			this.loadedCastle = new Fight({
				...resolveFightingPlace(placeId),
				history: [
					{
						action: DinoAction.ADDCASTLE,
						castle: {
							life: 50,
							maxLife: 100,
							enclos: false,
							invisible: false
						}
					}
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

#pixiCanvas :deep(canvas) {
	border-top: 1px solid #874a16;
	border-bottom: 1px solid #874a16;
}
</style>
