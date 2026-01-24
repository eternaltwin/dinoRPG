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
import TitleHeader from '../components/utils/TitleHeader.vue';
import { errorHandler } from '../utils/index.js';
import { DojoService } from '../services/DojoService.js';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { resolveFightingPlace, transpileFight } from '../utils/transpileFight.js';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

export default defineComponent({
	name: 'ReplayFight',
	components: {
		TitleHeader,
		FullFightAnimation: defineAsyncComponent(() => import('../components/fight/FullFightAnimation.vue'))
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

		try {
			const fightResult = await DojoService.getSharedFight(archiveId);
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
				true
			);
			if (!nexFight) {
				return;
			}
			const initPlace = resolveFightingPlace(PlaceEnum.FORCEBRUT);
			this.fightTransformed = {
				...initPlace,
				history: nexFight.filter(n => n != undefined)
				// lang: this.lang
			};
			this.loaded = true;
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style lang="scss" scoped>
.content {
	display: flex;
	justify-content: center;
}
</style>
