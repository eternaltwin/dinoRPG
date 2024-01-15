<template>
	<TitleHeader :title="$t('pageTitle.fight')" />
	<div class="section">
		<div class="titlePage">{{ $t(`fight.pageName`) }}</div>
	</div>
	<PixiFight v-if="dinoz" :dinoz="dinoz" :placeName="placeName"></PixiFight>
	<br />{{ fightText }}<br />
	<p class="fight-history" v-html="fightHistory"></p>
	<FightRecap :fight="fight" @displayFight="displayFight()" @fightAgain="processFight"></FightRecap>
</template>

<script lang="ts">
import { dinozStore, playerStore, sessionStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { defineComponent } from 'vue';
import FightRecap from '../components/fight/FightRecap.vue';
import { mapActions, mapState } from 'pinia';
import EventBus from '../events/index.js';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { FightService } from '../services/FightService.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { errorHandler } from '../utils/errorHandler.js';
import PixiFight from '../components/fight/PixiFight.vue';
import { placeList } from '../constants/index.js';
import translateFightStep from '../utils/translateFightStep.js';

export default defineComponent({
	name: 'Fight',
	components: {
		TitleHeader,
		FightRecap,
		PixiFight
	},
	data() {
		return {
			dinozId: undefined as number | undefined,
			fight: {} as FightResult,
			fightText: undefined as string | undefined,
			fightHistory: undefined as string | undefined,
			dinoz: undefined as DinozFiche | undefined
		};
	},
	computed: {
		...mapState(sessionStore, ['getFightResult']),
		...mapState(playerStore, ['getMoney']),
		...mapState(dinozStore, ['getDinozList', 'getDinoz']),
		placeName(): string | undefined {
			if (this.dinoz === undefined) {
				EventBus.emit('toast', { message: 'MissingDinozInformations', type: 'error' });
			}
			return placeList.find(place => place.placeId === this.dinoz.placeId)?.name;
		}
	},
	methods: {
		...mapActions(sessionStore, ['setFightResult']),
		...mapActions(playerStore, ['setMoney']),
		displayFight(): void {
			this.fightText = this.$t(`fight.resume`, { enemy: this.$t(`missions.target.${this.fight.opponent}`) });
			this.fightHistory = this.fight.history
				.map(step => translateFightStep(step, this.$t))
				.filter(Boolean)
				.join('<br />');
		},
		async processFight() {
			EventBus.emit('isLoading', true);
			try {
				const result: FightResult = await FightService.processFight(this.dinozId!);
				this.setFightResult(result);
				this.fight = this.getFightResult!;
				if (result.result) {
					const newMoney: number = this.getMoney! + this.fight.goldEarned;
					this.setMoney(newMoney);
					const dinozInStore: Array<DinozFiche> = this.getDinozList!;
					const dinoz: DinozFiche = dinozInStore.find(dinoz => dinoz.id! === this.dinozId)!;
					dinoz.experience! += this.fight.xpEarned;
				}
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		}
	},
	created(): void {
		this.dinozId = parseInt(this.$route.params.dinozId as string);
		this.dinoz = this.getDinoz(this.dinozId);
		if (this.getFightResult) {
			this.fight = this.getFightResult;
			this.setMoney(this.getMoney! + this.fight.goldEarned);
		}
	},
	unmounted(): void {
		this.setFightResult(undefined);
	}
});
</script>

<style lang="scss" scoped>
.fight-history :deep(strong) {
	color: inherit;
}
</style>
