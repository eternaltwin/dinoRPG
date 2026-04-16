<template>
	<div class="wrapper">
		<DZButton v-if="clanStore.getClan && !clanStore.getClan.castle" @click="buildCastle()">{{
			$t('clan.war.buildCastle')
		}}</DZButton>
		<DZDisclaimer v-else round :content="$t('clan.war.disclaimerCastle', { place })" />
		<div id="pixiCanvas" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import { ClanService } from '../../services';
import { errorHandler } from '../../utils';
import { clanStore } from '../../store/clanStore';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { Fight } from '@eternaltwin/dinorpg_animations';
import { DinoAction } from '@drpg/core/models/fight/transpiler';
import { resolveFightingPlace } from '../../utils/transpileFight';

export default defineComponent({
	name: 'ClanWar',
	components: { DZDisclaimer, DZButton },
	data() {
		return {
			castlePlace: undefined as undefined | number,
			clanStore: clanStore(),
			loadedCastle: {} as Fight
		};
	},
	computed: {
		place() {
			return this.$t(
				'place.name.' +
					Object.values(placeList).find(place => place.placeId === this.clanStore.getClan?.castle?.placeId)?.name
			);
		}
	},
	methods: {
		async buildCastle() {
			try {
				await ClanService.buildCastle();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		loadAnimation() {
			const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
			const placeId = this.clanStore.getClan?.castle?.placeId;
			if (!placeId) {
				return;
			}
			this.loadedCastle = new Fight({
				...resolveFightingPlace(placeId),
				history: [
					{
						action: DinoAction.ADDCASTLE,
						castle: {
							life: 50,
							maxLife: 100,
							enclos: false,
							invisible: false
						}
					}
				]
			});
			const display = this.loadedCastle.getDisplay();
			display.style.maxWidth = '100%';
			canvas.appendChild(display);
		}
	},
	mounted() {
		this.loadAnimation();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	width: auto;
}
</style>
