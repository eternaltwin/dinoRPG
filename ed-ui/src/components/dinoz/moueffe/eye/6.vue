<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${2.6 * size}px`"
		:width="`${4.3 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, 0.0, 0.0)`">
			<path
				d="M2.8 2.45 L0.75 2.35 0.1 1.65 0.05 1.6 0.0 1.3 0.05 1.2 0.05 1.1 0.05 1.05 0.3 0.8 0.4 0.8 3.7 0.05 4.0 0.05 4.05 0.05 4.3 0.3 4.3 0.4 4.3 0.7 Q3.85 2.0 2.8 2.45 M2.2 0.7 L1.7 0.95 Q1.25 0.95 1.25 1.4 1.25 1.9 1.95 1.9 3.1 1.9 3.1 1.15 3.1 0.7 2.2 0.7"
				fill="#ff0000"
				fill-rule="evenodd"
				stroke="none"
			/>
			<path
				d="M2.2 0.7 Q3.1 0.7 3.1 1.15 3.1 1.9 1.95 1.9 1.25 1.9 1.25 1.4 1.25 0.95 1.7 0.95 L2.2 0.7"
				fill="#ffd5d5"
				fill-rule="evenodd"
				stroke="none"
			/>
		</g>
	</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'MoueffeEye6',
	props: {
		size: Number
	}
});
</script>
