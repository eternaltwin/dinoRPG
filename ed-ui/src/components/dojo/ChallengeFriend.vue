<template>
	<TitleHeader :title="$t('pageTitle.challengeFriend')" />
	<div class="preparation" v-if="!fightTransformed">
		<DZDisclaimer round help :content="$t('dojo.challengeFriend.disclaimer')" />
		<SelectDinoz :dinozList="myDinoz" :selectLimit="6" @validate="composeMyTeam"></SelectDinoz>
		<template v-if="opponentDinoz.length <= 0">
			<DZButton v-for="friend in clanMembers" :key="friend.player.id" @click="selectPlayer(friend.player.id)">
				{{ friend.player.name }}</DZButton
			>
		</template>
		<template v-else>
			<DZDisclaimer round help :content="$t('dojo.challengeFriend.friend')" />
			<SelectDinoz :dinozList="opponentDinoz" :selectLimit="6" @validate="composeEnnemyTeam"></SelectDinoz>
		</template>
		<div
			class="fight"
			@click="startFight()"
			v-if="myTeam.length > 0 && opponentTeam.length > 0"
			v-html="formatContent($t('dojo.challengeFriend.startFight', { gold: fightCost }))"
		/>
	</div>
	<template v-if="fightTransformed">
		<div id="fightContent">
			<FightersHeader :leftPlayer="leftPlayer" :rightPlayer="rightPlayer" />
			<div v-show="loaded" class="content">
				<Suspense>
					<FullFightAnimation :fight="fightTransformed" />
					<template #fallback> <Loading /> </template>
				</Suspense>
			</div>
		</div>
		<FightRecap :stats="fightStat" />
		{{ shareLink }}
	</template>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import { dinozStore, playerStore, useLoadingStore } from '../../store/index.js';
import { errorHandler } from '../../utils/index.js';
import DZButton from '../common/DZButton.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { DinozDojoFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { ClanService, PlayerService } from '../../services/index.js';
import { ClanMember } from '@drpg/core/models/clan/clanMember';
import SelectDinoz from './SelectDinoz.vue';
import { DojoService } from '../../services/DojoService.js';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { resolveFightingPlace, transpileFight } from '../../utils/transpileFight.js';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterRecap, FullFightStats } from '@drpg/core/models/fight/FightResult';
import { UnavailableReason } from '@drpg/prisma/enums';
import FightRecap from './FightRecap.vue';
import FightersHeader from '../fight/FightersHeader.vue';

export default defineComponent({
	name: 'ChallengeFriend',
	components: {
		DZButton,
		TitleHeader,
		DZDisclaimer,
		SelectDinoz,
		FightersHeader,
		FightRecap,
		FullFightAnimation: defineAsyncComponent(() => import('../fight/FullFightAnimation.vue'))
	},
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			selectedDinoz: [] as number[],
			clanMembers: [] as Array<ClanMember>,
			myDinoz: [] as DinozDojoFiche[],
			opponentDinoz: [] as DinozDojoFiche[],
			myTeam: [] as number[],
			opponentTeam: [] as number[],
			fightCost: 0 as number,
			opponentId: undefined as undefined | string,
			fightTransformed: undefined as undefined | preFightLoader,
			loaded: false,
			shareLink: '',
			fightStat: {} as FullFightStats,
			leftPlayer: null as null | { id: string; name: string },
			rightPlayer: null as null | { id: string; name: string }
		};
	},
	methods: {
		async selectPlayer(playerId: string) {
			try {
				const player = await PlayerService.getPlayerData(playerId);
				this.opponentDinoz = player.dinoz
					.filter(d => !d.isFrozen)
					.map(d => {
						return {
							id: d.id,
							name: d.name,
							display: d.display,
							level: d.level
						};
					});
				this.opponentId = playerId;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async startFight() {
			if (!this.opponentId) return;
			if (this.myTeam.some(dinoz => this.opponentTeam.includes(dinoz))) {
				this.$toast.open({ message: this.$t('dojo.challengeFriend.doubleDinoz'), type: 'error' });
				return;
			}
			try {
				const rawFight = await DojoService.fightMyFriend(this.myTeam, this.opponentTeam, this.opponentId);
				const fightResult = rawFight.fight;
				this.fightStat = rawFight.stats;
				const fightSteps = fightResult.history as FightStep[];
				const fighters = fightResult.fighters as FighterRecap[];
				if (!fightSteps || !fighters) return;

				const nexFight = transpileFight(structuredClone(toRaw(fighters)), fightSteps, this.$t, fightResult.result);
				if (!nexFight) {
					return;
				}
				const initPlace = resolveFightingPlace(116);
				this.fightTransformed = {
					...initPlace,
					history: nexFight.filter(n => n != undefined)
					// lang: this.lang
				};
				this.leftPlayer = fightResult.leftPlayer;
				this.rightPlayer = fightResult.rightPlayer;
				this.loaded = true;
				this.shareLink = `${window.location.origin}/dojo/share/${fightResult.id}`;
				await this.$refreshGold();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		composeMyTeam(data: number[]) {
			this.myTeam = data;
			this.fightCost = (this.myTeam.length + this.opponentTeam.length) * 50;
		},
		composeEnnemyTeam(data: number[]) {
			this.opponentTeam = data;
			this.fightCost = (this.myTeam.length + this.opponentTeam.length) * 50;
		}
	},
	async mounted() {
		const myClan = this.playerStore.getClanId;
		if (!myClan) {
			this.$router.push({ name: 'DojoHome' });
			return;
		}
		this.myDinoz = this.dinozStore.getDinozList
			.filter(d => d.unavailableReason !== UnavailableReason.frozen)
			.map(d => {
				return {
					id: d.id,
					name: d.name,
					display: d.display,
					level: d.level
				};
			});
		useLoadingStore().setLoaderOn();
		try {
			this.clanMembers = await ClanService.getClanMembersList(myClan);
			// this.clanMembers = this.clanMembers.filter(p => p.player.id !== this.playerStore.getPlayerId);
			useLoadingStore().setLoaderOff();
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style lang="scss" scoped>
#fightContent {
	align-self: center;
}
.fight {
	padding-top: 6px;
	box-sizing: border-box;
	background-image: url('../../assets/icons/combat.webp');
	width: 112px;
	height: 59px;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	color: white;
	text-transform: uppercase;
	font-size: 13pt;
	font-weight: bold;
	text-shadow: 1px 1px 0px #000000;
	gap: 4px;
	&:hover {
		filter: saturate(120%);
	}
}
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}
.preparation {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}
.wrapper {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;

	.dinoz-button {
		width: 96px;
		margin: 4px;
		border-radius: 5px;
		text-align: center;
		border: 1px solid #874b2e;
		cursor: pointer;
		user-select: none;

		.background {
			background-image: url('../../assets/battle/forcebrut.webp');
			background-repeat: no-repeat;
			background-size: cover;
		}

		.textbox {
			background: rgb(255 249 0);
			background: linear-gradient(180deg, rgb(255 249 0) 0%, rgb(176 153 20) 100%);
			border-top: 1px solid #874b2e;
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			font-size: 10px;
			font-weight: bold;

			.name {
				color: #874b2e;
			}

			.level {
				color: #fce3bc;
			}
		}

		&.not-selected {
			filter: grayscale(100%);
		}
	}
}
.content {
	display: flex;
	justify-content: center;
}
</style>
