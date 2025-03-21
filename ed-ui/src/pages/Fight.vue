<template>
	<TitleHeader :title="$t('pageTitle.fight')" :header="$t(`fight.pageName`)" />
	<div v-show="loaded" class="content">
		<Suspense>
			<FullFightAnimation :fight="fightTransformed" @animationEnded="fightEnded = true" />
			<template #fallback> <Loading /> </template>
		</Suspense>
		<Transition name="bounce">
			<div v-if="fightEnded" class="wrapper">
				<div class="debrief">
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
					<div class="result">
						<span class="text">{{ $t(`fight.life`) }}</span>
						<img :src="getImgURL('icons', `small_pv`)" />
						<span class="data">{{ fight.totalHpLost }}</span>
					</div>
					<div class="result">
						<span class="text">{{ $t(`fight.experience`) }}</span>
						<img :src="getImgURL('icons', `small_xp`)" />
						<span class="data">
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
						</span>
					</div>
					<div class="result">
						<span class="text">{{ $t(`fight.gold`) }}</span>
						<img :src="getImgURL('icons', `small_gold`)" />
						<span class="data">
							{{ fight.goldEarned }}
						</span>
					</div>
					<img v-if="!fight.itemWon" :src="getImgURL('design', `large_empty`)" alt="empty" />
					<Tippy
						theme="small"
						tag="img"
						v-else
						:src="getImgURL('item', `item_${itemList[fight.itemWon].name}`)"
						:alt="itemList[fight.itemWon].name"
					>
						<template #content>
							<p v-html="formatContent($t(`fight.event.${itemList[fight.itemWon].name}`))" />
						</template>
					</Tippy>
				</div>
				<DZButton @click="returnToDinoz()">{{ $t(`fight.continue`) }}</DZButton>
				<DZButton @click="processFight()" v-if="isDevEnv()">[Dev] Fight again</DZButton>
				<DZButton @click="displayFight()">{{ $t(`fight.display`) }}</DZButton>
			</div>
		</Transition>
		<p v-if="fightHistory" class="fight-history" v-html="fightHistory" />
	</div>
</template>

<script lang="ts">
import { FighterRecap, FightResult } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { itemList } from '@drpg/core/models/item/ItemList';
import { defineAsyncComponent, defineComponent, PropType, toRaw } from 'vue';
import DZButton from '../components/common/DZButton.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import EventBus from '../events/index.js';
import { FightService } from '../services/index.js';
import { dinozStore, localStore, playerStore, sessionStore } from '../store/index.js';
import { errorHandler } from '../utils/index.js';
import translateFightStep from '../utils/translateFightStep.js';
import { resolveFightingPlace, transpileFight } from '../utils/transpileFight.js';
import { formatText } from '../utils/formatText.js';

export default defineComponent({
	name: 'Fight',
	computed: {
		itemList() {
			return itemList;
		}
	},
	components: {
		DZButton,
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

.debrief {
	display: flex;
	align-self: center;
	width: 100%;
	justify-content: space-around;
	align-items: center;
	height: 56px;
	color: #ffee92;
	background: url('../assets/background/debriefing_left.webp'), url('../assets/background/debriefing_right.webp'),
		url('../assets/background/debriefing_center.webp');
	background-position-x: left, right, center;
	background-repeat: no-repeat, no-repeat, repeat-x;
	img {
		flex-shrink: 0;
		align-self: center;
	}
	.result {
		background-color: #cc8a51;
		width: 87px;
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
			text-align: left;
			font-size: 13.5pt;
			color: #fff;
		}
		img {
			grid-area: left;
			align-self: center;
			justify-self: center;
			padding-left: 1px;
		}
	}
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
	margin-top: -4px;
	max-width: 488px;
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
