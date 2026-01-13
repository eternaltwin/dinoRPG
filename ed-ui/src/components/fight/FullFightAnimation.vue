<template>
	<div id="pixiCanvas"></div>
</template>

<script lang="ts">
import { preFightLoader } from '@drpg/core/models/fight/transpiler';
import { Fight } from '@eternaltwin/dinorpg_animations';
import { defineComponent, PropType } from 'vue';
import { playerStore } from '../../store';

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
			loadedFight: {} as Fight,
			playerStore: playerStore()
		};
	},
	methods: {
		loadAnimation() {
			const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
			this.loadedFight = new Fight(this.fight);
			const display = this.loadedFight.getDisplay();
			display.style.maxWidth = '100%';
			canvas.appendChild(display);
		},
		onFightEnd() {
			this.$emit('animationEnded');

			if (this.fight.statusReward) {
				this.$toast.success(
					this.formatContent(
						this.$t('fight.statusReward', {
							reward: `:status_${this.fight.statusReward}: ${this.$t(`status.name.${this.fight.statusReward}`)}`
						})
					)
				);
			}
		}
	},
	mounted() {
		this.loadAnimation();
		if (this.playerStore.getPlayerOptions.skipFight) {
			this.onFightEnd();
		}
		this.loadedFight.onFightEnd = () => {
			if (!this.playerStore.getPlayerOptions.skipFight) {
				this.onFightEnd();
			}
		};
	},
	unmounted() {
		this.loadedFight.destroy();
	}
});
</script>

<style scoped lang="scss">
#pixiCanvas :deep(canvas) {
	border-top: 1px solid #874a16;
	border-bottom: 1px solid #874a16;
}
</style>
