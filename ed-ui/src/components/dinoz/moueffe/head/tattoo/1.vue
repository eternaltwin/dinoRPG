<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${6.8 * size}px`"
		:width="`${6.7 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, ${3.35 * size}, ${3.4 * size})`">
			<path
				d="M3.35 -1.0 Q3.35 0.05 2.6 1.4 1.5 3.4 -0.5 3.4 -3.6 3.4 -3.35 0.2 -3.35 -3.15 0.6 -3.4 3.35 -3.0 3.35 -1.0 M-0.25 1.1 Q1.45 1.1 1.45 -0.4 1.45 -1.75 0.15 -1.75 -1.5 -1.75 -1.5 -0.3 -1.25 1.1 -0.25 1.1"
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
	name: 'MoueffeHeadTattoo1',
	props: {
		mainFirstColor: String,
		mainSecondColor: String,
		mainThirdColor: String,
		tattooColor: String,
		size: Number
	}
});
</script>
