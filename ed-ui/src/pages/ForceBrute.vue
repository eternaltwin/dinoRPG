<template>
	<TitleHeader :title="$t('pageTitle.fb_tournament')" :header="$t('fb_tournament.title')" />
	<DZDisclaimer help round :content="$t('fb_tournament.disclaimer')" />
	<div class="fb" v-if="!fightTransformed">
		<div class="dinoz" v-if="dinoz">
			<div class="dinozCard">
				<DinozWithoutFlash :display="dinoz.display" flip :key="dinoz.display" :life="1" />
				<div class="dinozInfo">
					<p class="name">
						{{ dinoz.name }}
					</p>
					<p class="lvl">{{ $t('myAccount.level') }} {{ dinoz.level }}</p>
				</div>
			</div>
		</div>
		<div class="vs" v-if="opponent">
			<img :src="getImgURL('design', 'vs')" alt="" />
			<span class="stage">{{ $t('fb_tournament.stage', { stage: stage }) }}</span>
		</div>
		<div class="opponent" v-if="opponent">
			<div class="opponentCard">
				<DinozWithoutFlash :display="opponent.display" flip :key="opponent.display" :life="1" />
				<div class="opponentInfo">
					<p class="name">
						{{ opponent.name }}
					</p>
					<p class="lvl">{{ $t('myAccount.level') }} {{ opponent.level }}</p>
				</div>
			</div>
		</div>
	</div>
	<div class="fight" v-if="!fightTransformed && opponent">
		<div class="launch-fight" @click="launchFight()">
			<img :src="getImgURL('icons', 'act_attack')" alt="" />
			<span>{{ $t('fb_tournament.fight', { opponent: opponent.name }) }}</span>
		</div>
	</div>
	<div class="wrapper" v-if="fightTransformed && fight">
		<Suspense>
			<FullFightAnimation :fight="fightTransformed" @animationEnded="fightEnded = true" />
			<template #fallback> <Loading /> </template>
		</Suspense>
		<FightBounce v-if="fightEnded" :fight="fight" :dinozId="+dinozId" />
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
import { dinozStore, localStore, playerStore, sessionStore } from '../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

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
			dinozStore: dinozStore(),
			opponent: undefined as undefined | FBOpponent,
			stage: null as number | null,
			fightTransformed: undefined as undefined | preFightLoader,
			displayFight: undefined as undefined | DojoFightResume,
			fight: undefined as undefined | FightResult,
			dinoz: undefined as undefined | DinozFiche,
			lang: localStore().getLanguage ?? 'fr',
			fightEnded: false as boolean,
			playerStore: playerStore(),
			sessionStore: sessionStore()
		};
	},
	props: {
		dinozId: { type: String, required: true }
	},
	methods: {
		async getDinozInfo(): Promise<void> {
			try {
				const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList;
				this.dinoz = dinozList.find(d => d.id === +this.dinozId);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async launchFight() {
			EventBus.emit('isLoading', true);
			try {
				this.fight = await FBService.fightOpponent(+this.dinozId);
				this.sessionStore.setFightResult(this.fight);
				const fightSteps = this.fight.history as FightStep[];
				const fighters = this.fight.fighters as FighterRecap[];
				if (!fightSteps || !fighters) return;

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
					history: nexFight.filter(n => n != undefined),
					lang: this.lang
				};
				EventBus.emit('isLoading', false);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		try {
			await this.getDinozInfo();
			this.opponent = await FBService.getOpponent(+this.dinozId);
			this.stage = this.opponent.stage;
			if (this.playerStore.getPlayerOptions.skipFight) {
				this.fightEnded = true;
			}
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style scoped lang="scss">
.fb {
	display: flex;
	align-self: center;
	overflow: hidden;
	position: relative;
}
.dinoz,
.opponent {
	width: 100%;
	height: auto;
	background-color: #bc683c;
	border: 3px solid #bc683c;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	padding-block: 15px;
	padding-inline: 15px;
	img {
		width: 100%;
	}
}
.dinozCard,
.opponentCard {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	overflow: hidden;
}
.dinozInfo,
.opponentInfo {
	display: flex;
	flex-direction: column;
	gap: 8px;
	text-align: center;
	color: #fce3bc;
	.name {
		text-align: center;
		font-weight: bold;
		line-height: 10pt;
		background-color: transparent;
		margin-top: -5px;
		align-self: center;
	}
	.lvl {
		font-size: 9pt;
	}
}
.vs {
	background-color: #fce3bc;
	width: 30px;
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: center;
	& img {
		position: relative;
		left: 11.3px;
		top: -1px;
	}
	.stage {
		position: relative;
		top: 55px;
		left: -60px;
		right: 0;
		text-align: center;
		font-size: 10pt;
		font-weight: bold;
		color: black;
	}
}
.fight {
	background-color: #bc683c;
	border: 3px solid #bc683c;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	display: flex;
	align-items: center;
	align-self: center;
	justify-content: center;
	margin-top: 10px;
	width: 80%;
	height: 50px;
}
.launch-fight {
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #7a4528;
	border-radius: 10px;
	padding-right: 5px;
	gap: 10px;
	min-height: 30px;
	cursor: pointer;
	& span {
		color: #fce3bc;
		font-size: 12pt;
	}
	&:hover {
		background-color: #53260e;
	}
}
@media (max-width: 580px) {
	.fb {
		width: 90%;
	}
	.fight {
		width: 90%;
	}
	.launch-fight {
		width: 80%;
		gap: 5px;
		padding: 0 5px 0 0;
	}
}
.wrapper {
	display: flex;
	align-self: center;
	flex-direction: column;
}
</style>
