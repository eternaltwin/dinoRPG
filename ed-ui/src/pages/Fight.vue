<template>
	<TitleHeader :title="$t('pageTitle.fight')" :header="$t(`fight.pageName`)" />
	<div v-show="loaded" class="content">
		<Suspense>
			<FullFightAnimation :fight="fightTransformed" @animationEnded="onFightEnd" />
			<template #fallback>
				<Loading />
			</template>
		</Suspense>
		<FightBounce v-if="fight && fightEnded" :fight="fight" :dinozId="dinozId" />
	</div>
</template>

<script lang="ts">
import { FighterRecap, FightResult } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { itemList } from '@drpg/core/models/item/ItemList';
import { defineAsyncComponent, defineComponent, PropType, toRaw } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { localStore, playerStore, sessionStore, useDinozStore } from '../store';
import { resolveFightingPlace, transpileFight } from '../utils/transpileFight.js';
import { formatText } from '../utils/formatText.js';
import FightBounce from '../components/fight/FightBounce.vue';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

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

			sessionStore: sessionStore(),
			fight: null as FightResult | null,
			dinozId: +this.$route.params.dinozId,
			lang: localStore().getLanguage ?? 'fr',
			fightEnded: false,
			fightTransformed: {} satisfies preFightLoader as preFightLoader,
			loaded: false,
			moneyGiven: false
		};
	},
	props: {
		display: { type: Object as PropType<FightResult>, required: false }
	},
	methods: {
		onFightEnd() {
			this.fightEnded = true;
		}
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
		}

		const fightSteps = fightResult.history as FightStep[];
		const fighters = fightResult.fighters as FighterRecap[];
		if (!fightSteps || !fighters) return;

		const nexFight = transpileFight(
			structuredClone(toRaw(fighters)),
			fightSteps,
			this.$t,
			fightResult.result,
			fightResult.startText,
			fightResult.endText
		);
		if (!nexFight) {
			return;
		}
		if (this.fight) {
			const initPlace = resolveFightingPlace(this.fight.place);
			this.fightTransformed = {
				...initPlace,
				history: nexFight.filter(n => n != undefined),
				lang: this.lang,
				statusReward: this.fight.statusReward
			};
		}

		this.loaded = true;
		if (this.playerStore.getPlayerOptions.skipFight) {
			this.onFightEnd();
		}
	},
	unmounted(): void {
		this.$refreshGold();

		// Comment this to replay fight with refresh
		this.loaded = false;
		const dinozList = useDinozStore().getDinozList;

		if (!dinozList) {
			this.$toast.open({
				message: formatText(this.$t(`toast.missingData`)),
				type: 'error'
			});
			return;
		}

		const dinozs: Array<DinozFiche> = dinozList.map(dinoz => {
			if (dinoz.id === this.dinozId || dinoz.leaderId === this.dinozId) {
				// Update dinoz HP
				dinoz.life -= this.fight?.hpLost.find(hpLost => hpLost.id === dinoz.id)?.hpLost || 0;
			}
			return dinoz;
		});

		useDinozStore().setDinozList(dinozs);
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
