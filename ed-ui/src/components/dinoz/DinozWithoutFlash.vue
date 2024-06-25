<template>
	<img v-if="loaded" :src="dinoImg" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dino } from '@drpg/dino-animation';

export default defineComponent({
	name: 'DinozWithoutFlash',
	data() {
		return {
			dinoImg: undefined as string | undefined,
			loaded: false as boolean
		};
	},
	props: {
		display: { type: String, required: true },
		life: { type: Number, required: true },
		flip: { type: Number, required: true },
		isFrozen: { type: Boolean, required: false }
	},
	mounted() {
		const dinos = new dino({
			data: this.display,
			flip: this.flip ? 1 : 0,
			damages: this.life > 0.5 ? 0 : this.life > 0.1 ? 1 : 2,
			dark: false,
			scale: 1,
			shadow: true,
			congel: this.isFrozen ?? false
		});
		dinos.toRawImage(
			value => {
				this.dinoImg = value;
				this.loaded = true;
			},
			190,
			165
		);
	}
});
</script>
