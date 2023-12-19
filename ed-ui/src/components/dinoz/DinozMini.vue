<template>
	<div ref="dino" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { sdino } from '@drpg/dino-animation';

export default defineComponent({
	name: 'DinozMini',
	props: {
		display: { type: String, required: true }
	},
	mounted() {
		const dinoAnimDiv = this.$refs.dino;
		if (!dinoAnimDiv) return;
		new sdino({
			data: this.display,
			flip: 1,
			pflag: true
		}).toAnimation(
			div => {
				dinoAnimDiv.appendChild(div);
			},
			45,
			45
		);

		setInterval(() => {
			const e = dinoAnimDiv.firstChild as Element;
			if (!e) return;
			const length = parseInt(e.getAttribute('data-length') ?? '0');
			let idx = parseInt(e.getAttribute('data-idx') ?? '0');
			if (length > 1) {
				e.children.item(idx)!.hidden = true;
				idx = (idx + 1) % length;
				e.children.item(idx)!.hidden = false;
				e.setAttribute('data-idx', idx.toString());
			}
		}, 1000 / 24.0);
	}
});
</script>
