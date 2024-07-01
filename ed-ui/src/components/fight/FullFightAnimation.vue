<template>
	<div id="pixiCanvas"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Fight } from '@drpg/dino-animation';

export default defineComponent({
	name: 'Fight',
	props: {
		fight: {
			type: Fight,
			required: true
		}
	},
	methods: {
		loadAnimation() {
			const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
			canvas.appendChild(this.fight.getDisplay());
		}
	},
	mounted() {
		this.loadAnimation();
	},
	unmounted() {
		this.fight?.destroy();
	}
});
</script>

<style scoped lang="scss">
#pixiCanvas {
	margin-left: 21px;
}
</style>
