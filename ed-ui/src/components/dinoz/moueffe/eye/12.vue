<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${4.2 * size}px`"
		:width="`${11.25 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g
			:transform="
				`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, ${5.4 * size}, ${3.05 *
					size})`
			"
		>
			<path
				d="M4.05 -3.05 Q4.9 -3.05 5.45 -2.2 L5.85 -1.2 Q5.85 0.05 4.1 0.05 2.4 0.05 2.25 -1.6 2.25 -3.05 4.05 -3.05 M-3.6 -1.9 Q-2.3 -1.9 -2.3 -0.15 -2.3 1.15 -3.9 1.15 -5.4 1.15 -5.4 -0.35 L-4.85 -1.25 Q-4.2 -1.9 -3.6 -1.9"
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
	name: 'MoueffeEye12',
	props: {
		size: Number
	}
});
</script>
