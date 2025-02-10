<template>
	<TitleHeader :title="$t('pageTitle.challengeFriend')" />
	<div id="dojoChallenge">
		<template v-if="composeTeam">
			<DZDisclaimer content="dojo.challenge.disclaimer" help round />
			<SelectDinoz :dinozList="myDinoz" :selectLimit="10" :minLimit="5" @validate="composeMyTeam"></SelectDinoz>
		</template>
		<div class="challenge" v-if="!fightTransformed">
			<p v-html="$t(`dojo.challenge.challenge.${activeChallenge.type}`, { goal: activeChallenge.goal })" />
		</div>
		<div v-if="fightTransformed" class="recap">
			<div
				class="challenge"
				:class="[
					{
						won: challengeWon && fightAnimationEnded,
						lost: !challengeWon && fightAnimationEnded
					}
				]"
			>
				<p v-html="$t(`dojo.challenge.challenge.${activeChallenge.type}`, { goal: activeChallenge.goal })" />
			</div>
			<div v-if="!challengeWon && fightAnimationEnded" class="debrief">
				<p v-if="!victory" v-html="$t(`dojo.challenge.challengeExplanation.looseFight`)" />
				<p
					v-if="victory && !challengeWon"
					v-html="
						$t(`dojo.challenge.challengeExplanation.${activeChallenge.type}`, {
							goal: calculateMissedGoal(activeChallenge)
						})
					"
				/>
			</div>
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
					<DinozWithoutFlash v-if="myFighter.id" :display="myFighter.display" flip :life="1" />
					<p class="name">{{ myFighter.name }}</p>
				</div>
				<div
					class="fight"
					:class="opponent.id && myFighter.id ? 'show' : 'hidden'"
					v-html="$t('dojo.challenge.launch')"
					@click="launchChallenge()"
				/>

				<div class="dinozHolder right">
					<DinozWithoutFlash :display="opponent.display" :life="1" />
					<p class="name">{{ opponent.name }}</p>
				</div>
			</div>
			<CarousselDinoz
				v-if="opponent.id && !myFighter.id"
				:dinozList="myTeam"
				@validate="selectMyFighter"
			></CarousselDinoz>
		</template>

		<template v-if="fightTransformed && fightStat">
			<div v-show="loaded" class="content">
				<Suspense>
					<FullFightAnimation :fight="fightTransformed" @animationEnded="fightAnimationEnded = true" />
					<template #fallback> <Loading /> </template>
				</Suspense>
			</div>
			<Transition name="bounce">
				<FightRecap :stats="fightStat" v-if="fightAnimationEnded" />
			</Transition>
		</template>

		<DZButton style="align-self: center" @click="nextChallenge()">{{ $t('dojo.return') }}</DZButton>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import EventBus from '../../events/index.js';
import { DojoService } from '../../services/DojoService.js';
import { errorHandler } from '../../utils/index.js';
import { Challenge, ChallengeType } from '@drpg/core/models/dojo/challenge';
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
import DZButton from '../common/DZButton.vue';

export default defineComponent({
	name: 'DojoChallenge',
	components: {
		DZButton,
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
			fightStat: undefined as undefined | FullFightStats,
			challengeWon: false,
			victory: false,
			fightAnimationEnded: false
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
		async nextChallenge() {
			this.fightAnimationEnded = false;
			this.victory = false;
			this.challengeWon = false;
			this.fightStat = undefined;
			this.loaded = false;
			this.fightTransformed = undefined;
			this.opponent = {} as Pick<Dinoz, 'id' | 'name' | 'level' | 'display'>;
			this.myFighter = {} as Pick<Dinoz, 'id' | 'name' | 'level' | 'display'>;
			await this.refresh();
		},
		calculateMissedGoal(challenge: Challenge) {
			if (!this.fightStat) return 0;
			switch (challenge.type) {
				case ChallengeType.Kill:
					return 0;
				case ChallengeType.TakeAttackQuantity:
					// Receive less than N attacks
					return this.fightStat.attack.times_attacked - challenge.goal;
				case ChallengeType.TakeRawDamage:
					// Lose les than N hp
					return this.fightStat.attack.hpLost - challenge.goal;
				case ChallengeType.TakePercentDamage:
					// Lose less than X% of hp
					return (
						Math.round(
							((this.fightStat.attack.startingHp - this.fightStat.attack.endingHp) / this.fightStat.attack.startingHp) *
								100
						) - challenge.goal
					);
				case ChallengeType.Assault:
					// Do at least N assaults
					return challenge.goal - this.fightStat.attack.assaults;
				case ChallengeType.AssaultPercentage:
					// X% of attacks are assaults
					return challenge.goal - Math.round((this.fightStat.attack.assaults / this.fightStat.attack.attacks) * 100);
				case ChallengeType.DealDamage:
					// Deal up to N damage
					return this.fightStat.defense.hpLost - challenge.goal;
				case ChallengeType.DealPercentDamage:
					// Deal at least X% of opponent hp
					return (
						challenge.goal -
						Math.round(
							((this.fightStat.defense.startingHp - this.fightStat.defense.endingHp) /
								this.fightStat.defense.startingHp) *
								100
						)
					);
				case ChallengeType.CounterAttack:
					// Counter a minimum of N times
					return challenge.goal - this.fightStat.attack.counters;
				case ChallengeType.Dodge:
					// Dodge a minimum of N times
					return challenge.goal - this.fightStat.attack.evasions;
				case ChallengeType.DodgePoison:
					// Never get poisoned
					return this.fightStat.attack.times_poisoned;
				case ChallengeType.PoisonOpponent:
					// Poison the opponent at least once
					return 0;
				default:
					return false;
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
				this.victory = rawFight.victory;
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
				this.activeChallenge = JSON.parse(dojo.activeChallenge) as Challenge;
				EventBus.emit('refreshDojo', true);
				EventBus.emit('isLoading', false);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		await this.refresh();
	},
	watch: {
		fightAnimationEnded() {
			EventBus.emit('refreshDojo', true);
		}
	}
});
</script>

<style lang="scss" scoped>
#dojoChallenge {
	display: flex;
	flex-direction: column;
	gap: 5px;
	.recap {
		align-self: center;
	}
}
.debrief {
	// position: absolute;
	display: flex;
	align-self: center;
	width: 530px;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	//width: 377px;
	height: 56px;
	//margin-left: 66px;
	//padding-left: 10px;
	//padding-right: 10px;
	color: white;
	background: url('../../assets/background/debriefing_left.webp'), url('../../assets/background/debriefing_right.webp'),
		url('../../assets/background/debriefing_center.webp');
	background-position-x: left, right, center;
	background-repeat: no-repeat, no-repeat, repeat-x;
	font-variant: small-caps;
	img {
		flex-shrink: 0;
		align-self: center;
	}
	.result {
		background-color: #cc8a51;
		width: 85px;
		height: 40px;
		border-radius: 8px;
		display: grid;
		grid-template-columns: 30% 1fr;
		grid-template-rows: 35% 1fr;
		grid-template-areas: 'top top' 'left center';
		.text {
			grid-area: top;
			align-self: center;
			justify-self: center;
			white-space: nowrap;
			font-weight: 1000;
			font-variant: all-petite-caps;
			font-size: smaller;
			color: #ffda97;
		}
		.data {
			grid-area: center;
			align-self: center;
			padding-left: 5px;
			text-align: left;
			font-size: 15pt;
			color: #fff;
		}
		img {
			grid-area: left;
			align-self: center;
			justify-self: center;
			padding-left: 8px;
		}
	}
}
.challenge {
	background-image: url('../../assets/design/dojo_challenge.webp');
	background-repeat: no-repeat;
	height: 64px;
	max-width: 75%;
	background-position: center;
	background-size: contain;
	padding-left: 50px;
	padding-right: 50px;
	align-self: center;
	display: flex;
	justify-content: space-around;
	p {
		color: white;
		align-self: center;
		max-width: 430px;
		text-align: center;
		padding-top: 5px;
		padding-bottom: 5px;
	}
}
.versus {
	background-image: url('../../assets/design/dojo_vs.webp');
	background-repeat: no-repeat;
	align-self: center;
	width: 95%;
	background-position: center;
	background-size: contain;
	//height: 247px;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 247px;
	.dinozHolder {
		width: 36%;
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
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
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
@media (max-width: 539px) {
	.versus .dinozHolder {
		margin-left: -45px;
		grid-template-rows: 75% 25%;
		padding-top: 0;
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
.bounce-enter-active {
	animation: bounce2 1s;
}
@keyframes bounce2 {
	0% {
		transform: translateY(-30px);
		opacity: 0;
	}
	20% {
		transform: translateY(0);
		opacity: 1;
	}
	40% {
		transform: translateY(-15px);
		opacity: 0.8;
	}
	60% {
		transform: translateY(0);
		opacity: 1;
	}
	80% {
		transform: translateY(-5px);
	}
	100% {
		transform: translateY(0px);
	}
}
</style>
