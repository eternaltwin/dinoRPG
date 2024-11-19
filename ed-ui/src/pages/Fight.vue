<template>
	<TitleHeader :title="$t('pageTitle.fight')" :header="$t(`fight.pageName`)"/>
	<div v-show="loaded" class="content">
		<Suspense>
			<FullFightAnimation :fight="fightTransformed" @animationEnded="fightEnded = true" />
			<template #fallback> <Loading /> </template>
		</Suspense>
		<Transition name="bounce">
			<div v-if="fightEnded" class="wrapper">
				<div class="debrief" :class="lang">
					<img
						v-if="fight.result"
						:src="getImgURL('design', `large_fight_win`)"
						alt="win"
						v-tippy="{
							content: formatContent($t(`fight.win`)),
							theme: 'small'
						}"
					/>
					<img
						v-else
						:src="getImgURL('design', `large_fight_lose`)"
						alt="lose"
						v-tippy="{
							content: formatContent($t(`fight.lose`)),
							theme: 'small'
						}"
					/>
					<div class="results life">{{ fight.totalHpLost }}</div>
					<div class="results xp">
						{{ fight.xpEarned }}
						<img
							v-if="fight.levelUp"
							:src="getImgURL('icons', `small_lup`)"
							alt="lup"
							v-tippy="{
								content: formatContent($t(`fight.lvlup`)),
								theme: 'small'
							}"
						/>
					</div>
					<div class="results money">{{ fight.goldEarned }}</div>
				</div>
				<a class="button" @click="returnToDinoz()">{{ $t(`fight.continue`) }}</a>
				<a class="button" v-if="isDevEnv()" @click="processFight()">[Dev] Fight again</a>
				<a class="button" @click="displayFight()">{{ $t(`fight.display`) }}</a>
			</div>
		</Transition>
		<p v-if="fightHistory" class="fight-history" v-html="fightHistory" />
	</div>
</template>

<script lang="ts">
import { FighterRecap, FightResult } from '@drpg/core/models/fight/FightResult';
import { FightService } from '../services/index.js';
import { localStore, playerStore, dinozStore, sessionStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { errorHandler } from '../utils/index.js';
import EventBus from '../events/index.js';
import { defineAsyncComponent, defineComponent, PropType, toRaw } from 'vue';
import translateFightStep from '../utils/translateFightStep.js';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { resolveFightingPlace, transpileFight } from '../utils/transpileFight.js';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';

export default defineComponent({
	name: 'Fight',
	components: {
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
			fightHistory: undefined as string | undefined,
			npcSpeech: undefined as string | undefined,
			npcName: undefined as string | undefined,
			fightEnded: false as boolean,
			fightTransformed: {} as preFightLoader,
			loaded: false as boolean
		};
	},
	props: {
		display: { type: Object as PropType<FightResult>, required: false }
	},
	methods: {
		returnToDinoz() {
			if (this.npcSpeech && this.fight.result) {
				this.$router.push({
					name: 'NPC',
					params: { id: this.$route.params.dinozId.toString(), npc: this.npcName }
				});
			} else {
				this.dinozStore.clearNpc(this.dinozId);
				this.$router.push({ name: 'DinozPage', params: { id: this.$route.params.dinozId } });
			}
		},
		async processFight() {
			EventBus.emit('isLoading', true);
			try {
				const result: FightResult = await FightService.processFight(this.dinozId!);
				this.sessionStore.setFightResult(result);
				this.fight = this.sessionStore.getFightResult!;
				if (result.result) {
					const newMoney: number = this.playerStore.getMoney! + this.fight.goldEarned;
					this.playerStore.setMoney(newMoney);
				}
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		isDevEnv(): boolean {
			return import.meta.env.MODE === 'development';
		},
		displayFight(): void {
			this.fightHistory = this.fight.history
				.map(step => translateFightStep(step, this.$t))
				.filter(Boolean)
				.join('<br />');
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
			if (this.fight.result) {
				this.npcSpeech = this.dinozStore.getNpc(this.dinozId)?.npcSpeech;
				this.npcName = this.dinozStore.getNpc(this.dinozId)?.npcName;
			} else {
				this.dinozStore.clearNpc(this.dinozId);
			}
			this.playerStore.setMoney(this.playerStore.getMoney! + this.fight.goldEarned);
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
			fightResult.startText,
			fightResult.endText,
			fightResult.result
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
		EventBus.emit('isLoading', false);
	},
	unmounted(): void {
		// Comment this to replay fight with refresh
		this.loaded = false;
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
.results {
	position: absolute;
	padding-left: 20px;
	margin-top: 18px;
	width: 80px;
	text-align: left;
	font-size: 15pt;
	color: white;
}
.life {
	margin-left: 53px;
}
.xp {
	margin-left: 148px;
}

.money {
	margin-left: 243px;
}

.debrief {
	// position: absolute;
	flex: 1 1 100%;
	width: 377px;
	height: 56px;
	margin-left: 66px;
	padding-left: 10px;
	padding-right: 10px;
	color: #ffee92;
	img {
		margin-top: 10px;
		margin-left: 5px;
		position: absolute;
	}
}

.fr {
	background-image: url('../assets/background/debriefing_fr.webp');
	background-repeat: no-repeat;
}
.es {
	background-image: url('../assets/background/debriefing_es.webp');
	background-repeat: no-repeat;
}
.en {
	background-image: url('../assets/background/debriefing_en.webp');
	background-repeat: no-repeat;
}
.de {
	background-image: url('../assets/background/debriefing_de.webp');
	background-repeat: no-repeat;
}
.filler {
	height: 180px;
	width: 550px;
}
.wrapper {
	display: flex;
	justify-content: space-around;
	gap: 10px;
	flex-wrap: wrap;
}

.fight-history {
	border: 1px solid black;
	padding: 10px;
	text-align: left;
	overflow: auto;
	height: 250px;
	margin-top: 10px;
	:deep(strong) {
		color: inherit;
	}
	:deep(img) {
		width: 15px;
	}
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
