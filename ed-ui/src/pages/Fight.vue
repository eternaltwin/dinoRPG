<template>
	<TitleHeader :title="$t('pageTitle.fight')" />
	<div class="section">
		<div class="titlePage">{{ $t(`fight.pageName`) }}</div>
	</div>
	<FullFightAnimation :place="fight.place" @fightEnded="fightEnded = true" />
	<p class="fight-history" v-html="fightHistory" />
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
						v-if="fight.result && fight.xpEarned === 0"
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
</template>

<script lang="ts">
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { FightService } from '../services/index.js';
import { localStore, playerStore, dinozStore, sessionStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { errorHandler } from '../utils/index.js';
import EventBus from '../events/index.js';
import { defineComponent, PropType } from 'vue';
import FullFightAnimation from '../components/fight/FullFightAnimation.vue';
import translateFightStep from '../utils/translateFightStep.js';

export default defineComponent({
	name: 'Fight',
	components: {
		TitleHeader,
		FullFightAnimation
	},
	data() {
		return {
			playerStore: playerStore(),
			dinozStore: dinozStore(),
			sessionStore: sessionStore(),
			fight: {} as FightResult,
			dinozId: undefined as number | undefined,
			lang: localStore().getLanguage ?? 'fr',
			fightHistory: undefined as string | undefined,
			npcSpeech: undefined as string | undefined,
			npcName: undefined as string | undefined,
			fightEnded: false as boolean
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
				this.dinozStore.setNpc(undefined, undefined);
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
				errorHandler.handle(err);
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
		this.dinozId = parseInt(this.$router.currentRoute.value.query.dinozId as string);
		if (this.sessionStore.getFightResult) {
			this.fight = this.sessionStore.getFightResult;
			this.npcSpeech = this.dinozStore.getNpcSpeech;
			this.npcName = this.dinozStore.getNpcName;
			this.playerStore.setMoney(this.playerStore.getMoney! + this.fight.goldEarned);
		}
		EventBus.emit('isLoading', false);
	},
	unmounted(): void {
		this.sessionStore.setFightResult(undefined);
	}
});
</script>

<style lang="scss" scoped>
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
