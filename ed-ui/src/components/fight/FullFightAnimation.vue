<template>
	<div id="pixiCanvas"></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Fight } from '@drpg/dino-animation';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';

export default defineComponent({
	name: 'Fight',
	props: {
		fight: {
			type: Object as PropType<preFightLoader>,
			required: true
		}
	},
	emits: ['animationEnded'],
	data() {
		return {
			loadedFight: {} as Fight
		};
	},
	methods: {
		loadAnimation() {
			const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
			this.loadedFight = new Fight(this.fight);
			canvas.appendChild(this.loadedFight.getDisplay());
		}
	},
	mounted() {
		this.loadAnimation();
		this.loadedFight.onFightEnd = () => {
			this.$emit('animationEnded');
		};
	},
	unmounted() {
		this.loadedFight.destroy();
	}
});
</script>

<style scoped lang="scss"></style>
