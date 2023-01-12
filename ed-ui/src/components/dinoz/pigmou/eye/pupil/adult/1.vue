<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${15.75 * size}px`"
		:width="`${28.3 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, ${19.1 * size}, ${2.65 * size})`">
			<path
				d="M6.0 13.1 Q2.75 13.05 2.8 9.95 2.9 6.4 5.9 6.4 9.15 6.4 9.2 10.05 9.2 13.05 6.0 13.1 M-16.55 3.25 Q-18.85 3.25 -19.1 0.45 -19.15 -2.65 -15.95 -2.65 -13.55 -2.65 -13.3 0.35 -13.35 3.25 -16.55 3.25"
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
	name: 'PigmouPupil1',
	props: {
		size: Number
	}
});
</script>
