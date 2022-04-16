<template>
	<svg
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:height="`${8.2 * size}px`"
		:width="`${9.85 * size}px`"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g
			:transform="
				`matrix(${1.0 * size}, 0.0, 0.0, ${1.0 * size}, ${-14.45 *
					size}, ${11.45 * size})`
			"
		>
			<path
				d="M17.95 -11.4 Q21.4 -11.85 23.15 -9.25 L24.3 -7.2 22.95 -6.15 20.8 -8.45 Q19.05 -9.8 16.8 -9.95 L17.95 -11.4 M15.9 -8.9 L18.4 -7.85 Q19.55 -7.35 20.35 -6.25 L21.5 -4.5 20.3 -3.25 17.85 -5.4 15.25 -6.85 14.45 -7.2 15.9 -8.9"
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
	name: 'MoueffeHeadTattoo0',
	props: {
		mainFirstColor: String,
		mainSecondColor: String,
		mainThirdColor: String,
		tattooColor: String,
		size: Number
	}
});
</script>
