<template>
	<div class="replay-fight" data-testid="replay-fight">
		<FightersHeader
			v-if="loaded"
			:leftPlayer="leftPlayer"
			:rightPlayer="rightPlayer"
			:rightName="rightClanName"
			:rightTitle="rightClanName ? $t('fight.clan') : null"
		/>
		<p v-if="failed" class="failed">{{ $t('clanChampionship.replayView.fightUnavailable') }}</p>
		<div v-else-if="fight" class="animation">
			<Suspense>
				<FullFightAnimation :fight="fight" @animationEnded="emit('ended')" />
				<template #fallback> <Loading /> </template>
			</Suspense>
		</div>
		<Loading v-else />
	</div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import type { preFightLoader } from '@drpg/core/models/fight/transpiler';
import type { FightStep } from '@drpg/core/models/fight/FightStep';
import type { FighterRecap } from '@drpg/core/models/fight/FightResult';
import FightersHeader from '../../fight/FightersHeader.vue';
import { FightService } from '../../../services';
import { resolveFightingPlace, transpileFight } from '../../../utils/transpileFight.js';

const FullFightAnimation = defineAsyncComponent(() => import('../../fight/FullFightAnimation.vue'));

const props = defineProps<{ archiveId: string }>();
const emit = defineEmits<{ (e: 'ended'): void }>();
const { t } = useI18n();

const fight = ref<preFightLoader | null>(null);
const loaded = ref(false);
const failed = ref(false);
const leftPlayer = ref<{ id: string; name: string } | null>(null);
const rightPlayer = ref<{ id: string; name: string } | null>(null);
const rightClanName = ref<string | null>(null);

onMounted(async () => {
	try {
		const replay = await FightService.getReplay(props.archiveId);
		const steps = replay.history as FightStep[];
		const fighters = replay.fighters as FighterRecap[];
		const history = transpileFight(
			structuredClone(toRaw(fighters)),
			steps,
			t,
			replay.result,
			undefined,
			undefined,
			false
		);
		if (!history) throw new Error('Empty fight');
		leftPlayer.value = replay.leftPlayer;
		rightPlayer.value = replay.rightPlayer;
		rightClanName.value = replay.metadata?.rightClanName ?? null;
		fight.value = { ...resolveFightingPlace(replay.metadata?.placeId), history: history.filter(n => n != undefined) };
		loaded.value = true;
	} catch {
		// The step is still readable without its animation: the replay goes on
		failed.value = true;
		emit('ended');
	}
});
</script>

<style lang="scss" scoped>
.replay-fight {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}
.animation {
	display: flex;
	justify-content: center;
	max-width: 100%;
}
.failed {
	font-style: italic;
	text-align: center;
}
</style>
