<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${17.9 * size}px`"
		:width="`${24.9 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, ${19.8 * size}, ${4.65 * size})`">
			<path
				d="M-12.9 -2.25 L-12.65 -1.05 -12.65 -0.75 Q-12.65 0.35 -13.05 1.25 L-13.1 1.3 Q-14.0 3.3 -16.5 3.3 -19.15 3.45 -19.75 0.25 L-19.8 0.05 Q-19.95 -2.2 -19.0 -3.25 -18.05 -4.65 -15.95 -4.65 -13.85 -4.7 -13.0 -2.45 L-12.9 -2.25 M0.8 9.1 L1.0 8.95 0.8 8.95 0.8 9.1 M0.65 13.25 Q-3.2 13.25 -3.15 9.65 -3.15 4.95 1.2 5.0 4.6 5.0 5.1 8.35 L5.1 8.55 Q5.1 13.3 0.65 13.25"
				fill="#660000"
				fill-rule="evenodd"
				stroke="none"
			/>
		</g>
	</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'PigmouBabyEye2',
	props: {
		size: Number
	}
});
</script>
