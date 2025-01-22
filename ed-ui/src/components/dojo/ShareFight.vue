<template>
	<TitleHeader :title="$t('pageTitle.challengeFriend')" />
	<template v-if="fightTransformed">
		<div v-show="loaded" class="content">
			<Suspense>
				<FullFightAnimation :fight="fightTransformed" />
				<template #fallback> <Loading /> </template>
			</Suspense>
		</div>
	</template>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import { errorHandler } from '../../utils/index.js';
import EventBus from '../../events/index.js';
import { DojoService } from '../../services/DojoService.js';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { resolveFightingPlace, transpileFight } from '../../utils/transpileFight.js';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';

export default defineComponent({
	name: 'ShareFight',
	components: {
		TitleHeader,
		FullFightAnimation: defineAsyncComponent(() => import('../fight/FullFightAnimation.vue'))
	},
	data() {
		return {
			fightTransformed: undefined as undefined | preFightLoader,
			loaded: false
		};
	},
	methods: {},
	async mounted() {
		const archiveId = this.$route.params.archive.toString();
		EventBus.emit('loading', true);
		try {
			const fightResult = await DojoService.getSharedFight(archiveId);
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
			EventBus.emit('loading', false);
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style lang="scss" scoped>
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
