<template>
	<TitleHeader :title="$t('pageTitle.fight')" :header="$t(`fight.pageName`)" />
	<div v-show="loaded" class="content">
		<Suspense>
			<FullFightAnimation :fight="fightTransformed" @animationEnded="fightEnded = true" />
			<template #fallback> <Loading /> </template>
		</Suspense>
		<FightBounce v-if="fightEnded" :fight="fight" :dinozId="dinozId" />
	</div>
</template>

<script lang="ts">
import { FighterRecap, FightResult } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { itemList } from '@drpg/core/models/item/ItemList';
import { defineAsyncComponent, defineComponent, PropType, toRaw } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import EventBus from '../events/index.js';
import { dinozStore, localStore, playerStore, sessionStore } from '../store/index.js';
import { resolveFightingPlace, transpileFight } from '../utils/transpileFight.js';
import { formatText } from '../utils/formatText.js';
import FightBounce from '../components/fight/FightBounce.vue';

export default defineComponent({
	name: 'Fight',
	computed: {
		itemList() {
			return itemList;
		}
	},
	components: {
		FightBounce,
		TitleHeader,
		FullFightAnimation: defineAsyncComponent(() => import('../components/fight/FullFightAnimation.vue'))
	},
	data() {
		return {
			playerStore: playerStore(),
			dinozStore: dinozStore(),
			sessionStore: sessionStore(),
			fight: {} as FightResult,
			dinozId: +this.$route.params.dinozId as number,
			lang: localStore().getLanguage ?? 'fr',
			fightEnded: false as boolean,
			fightTransformed: {} as preFightLoader,
			loaded: false as boolean
		};
	},
	props: {
		display: { type: Object as PropType<FightResult>, required: false }
	},
	created(): void {
		const fightResult = this.sessionStore.getFightResult;
		if (fightResult === undefined) {
			this.$toast.open({
				message: this.$t('toast.noFight'),
				type: 'error'
			});
			this.$router.push({
				name: 'DinozPage',
				params: { id: this.dinozId }
			});
			return;
		}
		if (fightResult) {
			this.fight = fightResult;
			this.playerStore.setMoney(this.playerStore.getMoney + this.fight.goldEarned);
		}

		const fightSteps = fightResult.history as FightStep[];
		const fighters = fightResult.fighters as FighterRecap[];
		if (!fightSteps || !fighters) return;

		console.log(fightSteps);

		console.log(fighters);
		const nexFight = transpileFight(
			structuredClone(toRaw(fighters)),
			fightSteps,
			this.$t,
			fightResult.result,
			fightResult.startText,
			fightResult.dialog,
			fightResult.endText
		);
		if (!nexFight) {
			return;
		}
		const initPlace = resolveFightingPlace(this.fight.place);
		this.fightTransformed = {
			...initPlace,
			history: nexFight.filter(n => n != undefined),
			lang: this.lang
		};

		console.log(nexFight.filter(n => n != undefined));
		this.loaded = true;
		if (this.playerStore.getPlayerOptions.skipFight) {
			this.fightEnded = true;
		}
		EventBus.emit('isLoading', false);
	},
	unmounted(): void {
		// Comment this to replay fight with refresh
		this.loaded = false;
		const dinozList = this.dinozStore.getDinozList;

		if (!dinozList) {
			this.$toast.open({
				message: formatText(this.$t(`toast.missingData`)),
				type: 'error'
			});
			return;
		}

		this.dinozStore.setDinozList(
			dinozList.map(dinoz => {
				if (dinoz.id === this.dinozId || dinoz.leaderId === this.dinozId) {
					// Update dinoz HP
					dinoz.life -= this.fight.hpLost.find(hpLost => hpLost.id === dinoz.id)?.hpLost || 0;
				}
				return dinoz;
			})
		);
		this.sessionStore.setFightResult(undefined);
	}
});
</script>

<style lang="scss" scoped>
.content {
	display: flex;
	flex-flow: column;
	align-items: center;
}
</style>
