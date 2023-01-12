<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${36.6 * size}px`"
		:width="`${43.75 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, ${41.95 * size}, ${22.75 * size})`">
			<path
				d="M1.8 -15.2 Q1.8 -13.85 -3.3 -1.85 L-10.25 13.85 -10.4 13.85 -5.0 -0.85 Q-1.85 -9.65 1.7 -15.45 L1.8 -15.45 1.8 -15.2"
				fill="#ffffff"
				fill-opacity="0.6509804"
				fill-rule="evenodd"
				stroke="none"
			/>
			<path
				d="M-41.85 -4.2 L-41.95 -4.45 -40.8 -7.2 -39.1 -10.3 -39.0 -9.75 Q-39.0 -9.05 -40.35 -6.65 L-41.75 -4.3 -41.85 -4.2 M-33.45 -19.1 L-35.4 -16.35 -36.65 -13.75 Q-37.4 -12.0 -37.95 -11.6 L-35.85 -17.6 Q-32.15 -25.45 -32.15 -21.35 -32.15 -21.1 -33.45 -19.1"
				fill="#ffffff"
				fill-rule="evenodd"
				stroke="none"
			/>
		</g>
	</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'PigmouHair18',
	props: {
		size: Number
	}
});
</script>
