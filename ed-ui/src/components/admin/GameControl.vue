<template>
	<DZButton @click="resetGame()">Reset le jeu</DZButton>
	<DZButton @click="softReset()">Reset les dinoz</DZButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import { AdminService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';

export default defineComponent({
	name: 'GameControl',
	components: { DZButton },
	methods: {
		async resetGame() {
			try {
				await AdminService.resetGame();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async softReset() {
			try {
				await AdminService.softReset();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	}
});
</script>

<style scoped lang="scss"></style>
