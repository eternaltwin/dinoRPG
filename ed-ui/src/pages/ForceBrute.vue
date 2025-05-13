<template>
	<TitleHeader :title="$t('pageTitle.fb_tournament')" />
	<DZDisclaimer help round :content="$t('fb_tournament.disclaimer')" />
	<div class="wrapper" v-if="opponent && !fightTransformed" @click="launchFight()">
		<div class="dinoz">
			<DinozWithoutFlash :display="opponent.display" flip :key="opponent.display" :life="1" />
			<p class="name">
				{{ opponent.name }}
			</p>
			<div class="dinozInfo">{{ $t('myAccount.level') }} {{ opponent.level }}</div>
		</div>
	</div>
	<div class="wrapper" v-if="fightTransformed && fight">
		<Suspense>
			<FullFightAnimation :fight="fightTransformed" />
			<template #fallback> <Loading /> </template>
		</Suspense>
		<FightBounce :fight="fight" :dinozId="+dinozId" />
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import { FBService } from '../services/FBTournamentService.js';
import { errorHandler } from '../utils/index.js';
import { FBOpponent } from '@drpg/core/models/dojo/ForceBrute';
import DinozWithoutFlash from '../components/dinoz/DinozWithoutFlash.vue';
import { DojoFightResume } from '@drpg/core/models/dojo/dojoFightResume';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterRecap, FightResult } from '@drpg/core/models/fight/FightResult';
import { resolveFightingPlace, transpileFight } from '../utils/transpileFight.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import EventBus from '../events/index.js';
import FightBounce from '../components/fight/FightBounce.vue';

export default defineComponent({
	name: 'ForceBrute',
	components: {
		FightBounce,
		DinozWithoutFlash,
		DZDisclaimer,
		TitleHeader,
		FullFightAnimation: defineAsyncComponent(() => import('../components/fight/FullFightAnimation.vue'))
	},
	data() {
		return {
			opponent: undefined as undefined | FBOpponent,
			fightTransformed: undefined as undefined | preFightLoader,
			displayFight: undefined as undefined | DojoFightResume,
			fight: undefined as undefined | FightResult
		};
	},
	props: {
		dinozId: { type: String, required: true }
	},
	methods: {
		async launchFight() {
			EventBus.emit('loading', true);
			try {
				this.fight = await FBService.fightOpponent(+this.dinozId);
				const fightSteps = this.fight.history as FightStep[];
				const fighters = this.fight.fighters as FighterRecap[];
				if (!fightSteps || !fighters) return;

				console.log(fightSteps);

				console.log(fighters);
				const nexFight = transpileFight(
					structuredClone(toRaw(fighters)),
					fightSteps,
					this.$t,
					this.fight.result,
					undefined,
					undefined,
					undefined,
					true
				);
				if (!nexFight) {
					return;
				}
				const initPlace = resolveFightingPlace(PlaceEnum.FORCEBRUT);
				this.fightTransformed = {
					...initPlace,
					history: nexFight.filter(n => n != undefined)
					// lang: this.lang
				};
				// this.loaded = true;
				EventBus.emit('loading', false);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		try {
			this.opponent = await FBService.getOpponent(+this.dinozId);
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style scoped lang="scss">
.wrapper {
	display: flex;
	align-self: center;
	flex-direction: column;
}
.dinoz {
	width: auto;
	height: auto;
	background-color: #fbdba8;
	cursor: default;
	border: 1px solid #fce3bc;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 5px;
	max-width: 200px;
	&:hover {
		border: 1px solid #f1c98e;
		cursor: pointer;
	}
	img {
		width: 100%;
	}
}
.name {
	text-align: center;
	font-weight: bold;
	line-height: 10pt;
	color: #52646b;
	background-color: transparent;
	margin-top: -5px;
	align-self: center;
}
.dinozInfo {
	text-align: center;
	font-size: 9pt;
	line-height: 10pt;
	color: #bc683c;
	width: 170px;
	margin-bottom: 10px;
}
</style>
