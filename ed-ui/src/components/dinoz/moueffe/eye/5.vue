<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${3.8 * size}px`"
		:width="`${7.15 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g :transform="`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, 0.0, 0.0)`">
			<path
				d="M5.75 1.15 L5.75 0.85 5.75 0.75 5.5 0.5 5.45 0.5 5.15 0.5 1.85 1.25 1.75 1.25 1.5 1.5 1.5 1.55 1.5 1.65 1.45 1.75 1.5 2.05 1.55 2.1 2.2 2.8 4.25 2.9 Q5.3 2.45 5.75 1.15 M5.3 3.2 L4.5 3.6 3.6 3.8 2.35 3.5 Q0.85 3.0 0.0 1.6 3.35 -0.2 7.15 0.05 6.75 2.0 5.3 3.2"
				fill="#000000"
				fill-rule="evenodd"
				stroke="none"
			/>
		</g>
	</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'MoueffeEye5',
	props: {
		size: Number
	}
});
</script>
