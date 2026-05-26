<template>
	<div id="shareFight">
		<TitleHeader :title="$t('pageTitle.challengeFriend')" />
		<FightersHeader
			:leftPlayer="leftPlayer"
			:rightPlayer="rightPlayer"
			:rightName="rightClanName"
			:rightTitle="rightClanName ? $t('fight.clan') : null"
		/>
		<template v-if="fightTransformed">
			<div v-show="loaded" class="content">
				<Suspense>
					<FullFightAnimation :fight="fightTransformed" />
					<template #fallback> <Loading /> </template>
				</Suspense>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { errorHandler } from '../utils/index.js';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { resolveFightingPlace, transpileFight } from '../utils/transpileFight.js';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import FightersHeader from '../components/fight/FightersHeader.vue';
import { FightService } from '../services';

export default defineComponent({
	name: 'ReplayFight',
	components: {
		TitleHeader,
		FightersHeader,
		FullFightAnimation: defineAsyncComponent(() => import('../components/fight/FullFightAnimation.vue'))
	},
	data() {
		return {
			fightTransformed: undefined as undefined | preFightLoader,
			loaded: false,
			leftPlayer: null as null | { id: string; name: string },
			rightPlayer: null as null | { id: string; name: string },
			rightClanName: null as null | string
		};
	},
	methods: {},
	async mounted() {
		const archiveId = this.$route.params.archive.toString();

		try {
			const fightResult = await FightService.getReplay(archiveId);
			const fightSteps = fightResult.history as FightStep[];
			const fighters = fightResult.fighters as FighterRecap[];
			if (!fightSteps || !fighters) return;

			const nexFight = transpileFight(
				structuredClone(toRaw(fighters)),
				fightSteps,
				this.$t,
				fightResult.result,
				undefined,
				undefined,
				false
			);
			if (!nexFight) {
				return;
			}
			const initPlace = resolveFightingPlace(fightResult.metadata.placeId);
			this.fightTransformed = {
				...initPlace,
				history: nexFight.filter(n => n != undefined)
				// lang: this.lang
			};
			this.leftPlayer = fightResult.leftPlayer;
			this.rightPlayer = fightResult.rightPlayer;
			this.rightClanName = fightResult.metadata.rightClanName ?? null;
			this.loaded = true;
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style lang="scss" scoped>
#shareFight {
	align-self: center;
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
