<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${10.0 * size}px`"
		:width="`${8.4 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(1.0, 0.0, 0.0, 1.0, ${4.2 * size}, ${5.0 * size})`">
			<path
				d="M4.15 -4.7 L4.2 -4.55 Q2.15 -3.25 -0.95 0.85 L-4.2 5.0 Q-3.7 2.45 -1.0 -1.25 1.7 -5.0 3.0 -5.0 L4.15 -4.7"
				fill="#a61515"
				fill-rule="evenodd"
				stroke="none"
			/>
		</g>
	</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'PigmouHeadMinorInjury4',
	props: {
		size: Number
	}
});
</script>
