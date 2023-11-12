<template>
	<TitleHeader :title="$t('pageTitle.fight')" />
	<div class="section">
		<div class="titlePage">{{ $t(`fight.pageName`) }}</div>
	</div>
	<PixiFight></PixiFight>
	<br />{{ fightText }}<br />
	<p v-html="fightHistory"></p>
	<FightRecap :fight="fight" @displayFight="displayFight" @fightAgain="processFight"></FightRecap>
</template>

<script lang="ts">
import { sessionStore } from '../store/index.js';
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
			fightHistory: undefined as string | undefined
		};
	},
	computed: {
		...mapState(sessionStore, ['getFightResult', 'getMoney', 'getDinozList'])
	},
	methods: {
		...mapActions(sessionStore, ['setFightResult', 'setMoney']),
		displayFight(): void {
			this.fightText = this.$t(`fight.resume`, { enemy: this.$t(`missions.target.${this.fight.opponent}`) });
			this.fightHistory = this.fight.history.replace(/\n/g, '<br>');
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
		this.dinozId = parseInt(this.$router.currentRoute.value.query.dinozId as string);
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

<style lang="scss" scoped></style>
