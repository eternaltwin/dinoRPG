<template>
	<DZDisclaimer
		v-if="state.round === 8"
		round
		:content="$t(`dojo.timer.nextQualif`, calculateTimeRemaining(state.nextScheduledMatch))"
	/>
	<DZDisclaimer
		v-else
		round
		:content="$t(`dojo.timer.${state.phase}`, calculateTimeRemaining(state.nextScheduledMatch))"
	/>
	<DZDisclaimer round :content="$t(`dojo.timer.cashPrice`, { cashPrice: state.cashPrice })" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { TournamentState } from '@drpg/core/models/dojo/tournament';

export default defineComponent({
	name: 'DojoTimer',
	props: {
		state: {
			type: Object as PropType<TournamentState>,
			required: true
		}
	},
	methods: {
		calculateTimeRemaining(targetDate: Date): { day: number; hours: number; minutes: number } {
			const now = new Date();
			const targetedDate = new Date(targetDate);
			const difference = targetedDate.getTime() - now.getTime();

			if (difference <= 0) {
				return {
					day: 0,
					hours: 0,
					minutes: 0
				};
			}

			const millisecondsPerMinute = 1000 * 60;
			const millisecondsPerHour = millisecondsPerMinute * 60;
			const millisecondsPerDay = millisecondsPerHour * 24;

			const day = Math.floor(difference / millisecondsPerDay);
			const remainingHours = Math.floor((difference % millisecondsPerDay) / millisecondsPerHour);
			const remainingMinutes = Math.floor((difference % millisecondsPerHour) / millisecondsPerMinute);

			return {
				day,
				hours: remainingHours,
				minutes: remainingMinutes
			};
		}
	},
	components: { DZDisclaimer }
});
</script>

<style scoped lang="scss"></style>
