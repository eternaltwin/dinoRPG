<template>
	<TitleHeader :title="$t('pageTitle.challengeFriend')" />
	<template v-if="composeTeam">
		<DZDisclaimer content="dojo.challenge.disclaimer" help round />
		<SelectDinoz :dinozList="myDinoz" :selectLimit="10" :minLimit="5" @validate="composeMyTeam"></SelectDinoz>
	</template>
	<div class="challenge" v-if="!fightTransformed">
		<p v-html="$t(`dojo.challenge.challenge.${activeChallenge.type}`, { goal: activeChallenge.goal })" />
	</div>
	<div class="challenge" v-if="fightTransformed" :class="challengeWon ? 'won' : 'lost'">
		<p v-html="$t(`dojo.challenge.challenge.${activeChallenge.type}`, { goal: activeChallenge.goal })" />
	</div>
	<template v-if="!fightTransformed">
		<CarousselDinoz
			v-if="!opponent.id"
			:ennemyList="opponents"
			@validate="selectOpponent"
			@refresh="refresh()"
		></CarousselDinoz>
		<div class="versus" v-if="opponent.id">
			<div class="dinozHolder">
				<DinozWithoutFlash :display="opponent.display" :life="1" flip />
				<p class="name">{{ opponent.name }}</p>
			</div>
			<div
				class="fight"
				:class="opponent.id && myFighter.id ? 'show' : 'hidden'"
				v-html="$t('dojo.challenge.launch')"
				@click="launchChallenge()"
			/>
			<div class="dinozHolder">
				<DinozWithoutFlash v-if="myFighter.id" :display="myFighter.display" :life="1" />
				<p class="name">{{ myFighter.name }}</p>
			</div>
		</div>
		<CarousselDinoz
			v-if="opponent.id && !myFighter.id"
			:dinozList="myTeam"
			@validate="selectMyFighter"
		></CarousselDinoz>
	</template>
	<template v-if="fightTransformed">
		<div v-show="loaded" class="content">
			<Suspense>
				<FullFightAnimation :fight="fightTransformed" />
				<template #fallback> <Loading /> </template>
			</Suspense>
		</div>
		<FightRecap :stats="fightStat" />
	</template>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import EventBus from '../../events/index.js';
import { DojoService } from '../../services/DojoService.js';
import { errorHandler } from '../../utils/index.js';
import { Challenge } from '@drpg/core/models/dojo/challenge';
import { DinozDojoFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { dinozStore } from '../../store/index.js';
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';
import SelectDinoz from './SelectDinoz.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { Dinoz, DojoOpponents, DojoTeam } from '@drpg/prisma';
import CarousselDinoz from './CarousselDinoz.vue';
import DinozWithoutFlash from '../dinoz/DinozWithoutFlash.vue';
import FightRecap from './FightRecap.vue';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterRecap, FullFightStats } from '@drpg/core/models/fight/FightResult';
import { resolveFightingPlace, transpileFight } from '../../utils/transpileFight.js';

export default defineComponent({
	name: 'DojoChallenge',
	components: {
		FightRecap,
		DinozWithoutFlash,
		DZDisclaimer,
		TitleHeader,
		SelectDinoz,
		CarousselDinoz,
		FullFightAnimation: defineAsyncComponent(() => import('../fight/FullFightAnimation.vue'))
	},
	data() {
		return {
			myTeam: [] as (Pick<DojoTeam, 'fighted'> & { dinoz: Pick<Dinoz, 'id' | 'name' | 'level' | 'display'> })[],
			activeChallenge: {} as Challenge,
			opponents: [] as (Pick<DojoOpponents, 'fighted' | 'achieved'> & {
				dinoz: Pick<Dinoz, 'id' | 'name' | 'level' | 'display'>;
			})[],
			composeTeam: false as boolean,
			myDinoz: [] as DinozDojoFiche[],
			dinozStore: dinozStore(),
			opponent: {} as Pick<Dinoz, 'id' | 'name' | 'level' | 'display'>,
			myFighter: {} as Pick<Dinoz, 'id' | 'name' | 'level' | 'display'>,
			fightTransformed: undefined as undefined | preFightLoader,
			loaded: false,
			fightStat: {} as FullFightStats,
			challengeWon: false
		};
	},
	methods: {
		async composeMyTeam(data: number[]) {
			const myTeam = data;
			EventBus.emit('isLoading', true);
			try {
				const dojo = await DojoService.createMyTeam(myTeam);
				this.myTeam = dojo.team.sort((a, b) => b.dinoz.level - a.dinoz.level);
				this.opponents = dojo.DojoOpponents.sort((a, b) => b.dinoz.level - a.dinoz.level);
				this.composeTeam = false;
				EventBus.emit('isLoading', false);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		selectOpponent(data: number) {
			const possible = this.opponents.find(d => d.dinoz.id === data);
			if (!possible) return;
			this.opponent = possible.dinoz;
		},
		selectMyFighter(data: number) {
			const possible = this.myTeam.find(d => d.dinoz.id === data);
			if (!possible) return;
			this.myFighter = possible.dinoz;
		},
		async launchChallenge() {
			if (!this.myFighter.id || !this.opponent.id) return;
			EventBus.emit('isLoading', true);
			try {
				const rawFight = await DojoService.fightChallenge(this.myFighter.id, this.opponent.id);
				const fightResult = rawFight.fight;
				this.fightStat = rawFight.stats;
				this.challengeWon = rawFight.challengeWon;
				const fightSteps = fightResult.history as FightStep[];
				const fighters = fightResult.fighters as FighterRecap[];
				if (!fightSteps || !fighters) return;

				console.log(fightSteps);

				console.log(fighters);
				const nexFight = transpileFight(
					structuredClone(toRaw(fighters)),
					fightSteps,
					this.$t,
					undefined,
					undefined,
					fightResult.result,
					true
				);
				if (!nexFight) {
					return;
				}
				const initPlace = resolveFightingPlace(116);
				this.fightTransformed = {
					...initPlace,
					history: nexFight.filter(n => n != undefined)
					// lang: this.lang
				};
				this.loaded = true;
				EventBus.emit('refreshDojo', true);
				EventBus.emit('isLoading', false);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async refresh() {
			EventBus.emit('isLoading', true);
			try {
				const dojo = await DojoService.getMyTeam();
				if (dojo.team.length === 0) {
					this.composeTeam = true;
					this.myDinoz = this.dinozStore.getDinozList
						.filter(d => d.unavailableReason !== UnavailableReasonFront.frozen)
						.map(d => {
							return {
								id: d.id,
								name: d.name,
								display: d.display,
								level: d.level
							};
						});
				} else {
					this.myTeam = dojo.team.sort((a, b) => b.dinoz.level - a.dinoz.level);
					this.opponents = dojo.DojoOpponents.sort((a, b) => b.dinoz.level - a.dinoz.level);
				}
				this.activeChallenge = await DojoService.getMyChallenge();
				EventBus.emit('refreshDojo', true);
				EventBus.emit('isLoading', false);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		await this.refresh();
	}
});
</script>

<style lang="scss" scoped>
.challenge {
	background-image: url('../../assets/design/dojo_challenge.webp');
	background-repeat: no-repeat;
	height: 64px;
	width: 530px;
	align-self: center;
	display: flex;
	justify-content: space-around;
	p {
		color: white;
		align-self: center;
		max-width: 430px;
		text-align: center;
	}
}
.versus {
	margin-top: 5px;
	background-image: url('../../assets/design/dojo_vs.webp');
	background-repeat: no-repeat;
	align-self: center;
	width: 527px;
	height: 247px;
	display: flex;
	align-items: center;
	justify-content: center;
	.dinozHolder {
		width: 190px;
		display: grid;
		padding-top: 35px;
		grid-template-rows: 165px 40px;
		img {
			max-width: 190px;
			max-height: 165px;
		}
		.name {
			display: flex;
			justify-content: center;
			align-items: center;
			text-align: center;
			color: white;
			font-variant: small-caps;
		}
	}

	.fight {
		width: 112px;
		height: 59px;
	}
	.show {
		background-image: url('../../assets/icons/combat.webp');
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		text-transform: uppercase;
		font-size: 10pt;
		text-align: center;
		//color: #ffee92;
		font-weight: bold;
		margin-top: auto;
		&:hover {
			filter: saturate(120%);
		}
	}
	.hidden {
		filter: opacity(0);
	}
}
.content {
	display: flex;
	justify-content: center;
}
.won {
	filter: hue-rotate(90deg);
}
.lost {
	filter: hue-rotate(-90deg);
}
</style>
