<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${22.8 * size}px`"
		:width="`${27.75 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, ${14.0 * size}, ${11.4 * size})`">
			<path
				d="M1.9 -11.4 Q6.25 -11.4 6.25 -10.45 9.45 -7.3 9.45 -6.85 L1.8 -5.7 -2.7 -4.15 -11.05 1.0 Q-13.3 -1.3 -14.0 -3.6 -14.0 -5.3 -8.35 -8.4 -2.6 -11.55 0.55 -11.35 L1.9 -11.4 M13.25 0.15 L13.75 2.35 Q12.8 5.2 8.25 7.75 2.2 11.05 -5.1 11.4 -8.0 8.75 -8.3 5.55 L-8.2 5.4 -7.0 5.45 Q-1.35 5.45 6.15 1.55 10.45 -0.65 12.2 -2.5 L13.25 0.15"
				:fill="tattooColor"
				fill-rule="evenodd"
				stroke="none"
			/>
		</g>
	</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'MoueffeArmTattoo0',
	props: {
		mainFirstColor: String,
		mainSecondColor: String,
		mainThirdColor: String,
		tattooColor: String,
		size: Number
	}
});
</script>
