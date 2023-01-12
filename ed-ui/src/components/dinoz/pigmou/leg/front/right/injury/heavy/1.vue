<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${19.8 * size}px`"
		:width="`${11.3 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, ${6.6 * size}, ${4.35 * size})`">
			<path
				d="M-3.15 -1.2 L-2.2 0.7 Q-1.05 3.3 -0.45 3.8 4.7 8.25 4.7 9.35 L3.65 14.6 3.45 14.6 Q3.35 14.8 3.35 14.4 L3.75 11.25 Q3.75 8.85 -0.2 5.9 -3.5 3.5 -4.05 0.3 -4.85 1.75 -4.85 3.35 -4.85 5.85 -3.65 9.0 L-5.55 14.55 -5.1 15.35 -5.3 15.45 -6.15 14.55 Q-4.4 9.35 -4.4 9.05 L-5.5 6.45 Q-6.6 4.1 -6.6 1.6 -6.6 1.25 -3.0 -4.35 L-2.3 -3.75 Q-2.3 -2.7 -3.15 -1.2"
				fill="#a51616"
				fill-rule="evenodd"
				stroke="none"
			/>
		</g>
	</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'PigmouFrontRightLegHeavyInjury1',
	props: {
		size: Number
	}
});
</script>
