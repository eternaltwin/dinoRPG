<template>
	<Transition name="bounce">
		<div class="wrapper">
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
			<DZButton @click="displayFight()">{{ $t(`fight.display`) }}</DZButton>
		</div>
	</Transition>
	<p v-if="fightHistory" class="fight-history" v-html="fightHistory" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import DZButton from '../common/DZButton.vue';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { itemList } from '@drpg/core/models/item/ItemList';
import translateFightStep from '../../utils/translateFightStep.js';
import { dinozStore } from '../../store/index.js';

export default defineComponent({
	name: 'FightBounce',
	computed: {
		itemList() {
			return itemList;
		}
	},
	components: { DZButton },
	props: {
		fight: { type: Object as PropType<FightResult>, required: true },
		dinozId: { type: Number, required: true }
	},
	data() {
		return {
			dinozStore: dinozStore(),
			fightHistory: undefined as string | undefined,
			npcSpeech: undefined as string | undefined,
			npcName: undefined as string | undefined
		};
	},
	methods: {
		returnToDinoz() {
			if (this.npcSpeech && this.fight.result) {
				this.$router.push({
					name: 'NPC',
					params: { id: this.dinozId.toString(), npc: this.npcName }
				});
			} else {
				this.dinozStore.clearNpc(this.dinozId);
				this.$router.push({ name: 'DinozPage', params: { id: this.dinozId.toString() } });
			}
		},
		displayFight(): void {
			this.fightHistory = this.fight.history
				.map(step => translateFightStep(step, this.$t))
				.filter(Boolean)
				.join('<br />');
		}
	},
	mounted() {
		if (this.fight.result) {
			this.npcSpeech = this.dinozStore.getNpc(this.dinozId)?.npcSpeech;
			this.npcName = this.dinozStore.getNpc(this.dinozId)?.npcName;
		} else {
			this.dinozStore.clearNpc(this.dinozId);
		}
	}
});
</script>

<style scoped lang="scss">
.debrief {
	display: flex;
	align-self: center;
	width: 100%;
	justify-content: space-around;
	align-items: center;
	height: 56px;
	color: #ffee92;
	background: url('../../assets/background/debriefing_left.webp'), url('../../assets/background/debriefing_right.webp'),
		url('../../assets/background/debriefing_center.webp');
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
