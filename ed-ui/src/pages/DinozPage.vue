<template>
	<template v-if="nameChoosen === false">
		<ChooseDinozName :dinozData="dinozData" @setNameChoosen="setNameChoosen" />
	</template>
	<DinozDisplay v-if="nameChoosen === true" v-show="isReady" :dinozData="dinozData" :key="dinozData.display" />
	<div class="dinozPanels" v-if="nameChoosen === true">
		<DinozActions
			v-show="isReady"
			:refresh-dinoz="refreshDinoz"
			@continueMission="continueMission()"
			@endMission="getFiche()"
		/>
		<TabPanel v-if="isReady" :dinozData="dinozData" />
		<!--		<div class="footer" />-->
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { errorHandler } from '../utils/index.js';
import { DinozService } from '../services/index.js';
import EventBus from '../events/index.js';
import { playerStore, useDinozStore } from '../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import ChooseDinozName from '../components/dinoz/ChooseDinozName.vue';
import DinozActions from '../components/dinoz/DinozActions.vue';
import TabPanel from '../components/common/TabPanel.vue';
import DinozDisplay from '../components/dinoz/DinozDisplay.vue';

export default defineComponent({
	name: 'DinozPage',
	data() {
		return {
			playerStore: playerStore(),
			nameChoosen: undefined as boolean | undefined,
			dinozData: {} as DinozFiche,
			isReady: false as boolean
		};
	},
	components: {
		ChooseDinozName,
		DinozActions,
		TabPanel,
		DinozDisplay
	},
	methods: {
		getBarSize(value: number, maxValue: number): string {
			const width: number = Math.round((value / maxValue) * 98);
			return `width : ${width}px ; height : 11px`;
		},
		// Set dinoz name and display dinoz page
		setNameChoosen(newName: string): void {
			this.nameChoosen = true;
			this.dinozData.name = newName;
		},
		async continueMission(): Promise<void> {
			try {
				const dinozId = this.$route.params.id as string;
				this.dinozData = await DinozService.getDinozFiche(parseInt(dinozId));
				const dinozList: Array<DinozFiche> = useDinozStore().getDinozList;
				const dinozToUpdate = dinozList.find(dinoz => dinoz.id.toString() === dinozId);
				if (dinozToUpdate) {
					dinozToUpdate.missionId = this.dinozData.missionId;
					dinozToUpdate.missionHUD = this.dinozData.missionHUD;
				}
				useDinozStore().setDinozList(dinozList);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async getFiche(): Promise<void> {
			const dinozId = +this.$route.params.id;
			useDinozStore().setCurrentDinozId(dinozId);
			this.dinozData = await useDinozStore().refreshDinozFiche(dinozId);
			this.playerStore.setPlayerOptions({ ...this.playerStore.playerOptions });
			this.isReady = true;
		},
		async refreshDinoz() {
			try {
				await this.getFiche();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	},
	// Get dinoz data
	async mounted(): Promise<void> {
		EventBus.on('refreshDinoz', async e => {
			if (e) {
				await this.refreshDinoz();
			}
		});
		try {
			await this.getFiche();
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}

		this.nameChoosen = this.dinozData.name !== '?';
	},
	unmounted() {
		EventBus.off('refreshDinoz');
	},
	watch: {
		// Reload page if player go on another dinoz page
		'$route.params.id': async function (to) {
			if (to !== undefined && this.$route.name === 'DinozPage') {
				await this.getFiche();
			}
		},
		'dinozData.name': function () {
			this.nameChoosen = this.dinozData.name !== '?';
		}
	}
});
</script>

<style lang="scss" scoped>
.dinozPanels {
	//background-image: url('../assets/design/dinoz_panels_bg.webp');
	background-repeat: repeat-y;
	display: flex;
	flex-wrap: wrap;
	width: fit-content;
	align-self: center;

	// For futur implementation of header div
	// .header {
	// 	flex-grow: 100%;
	// 	height: 24px;
	// 	width: 100%;
	// 	background-image: url(../../assets/design/dinoz_footer.webp);
	// }
	.footer {
		height: 24px;
		width: 100%;
		background-image: url('../assets/design/dinoz_footer.webp');
	}
}
.dinoz {
	background-image: url('../assets/background/dinoz_bg_cut.webp');
	background-repeat: no-repeat;
	//min-height: 265px;
	display: grid;
	padding-top: 15px;
	height: 250px;
	grid-template-columns: [first] 180px [line1] 225px [line2] 100px [end];
	grid-template-rows: [first] 40px [row1] 40px [row2] 100px [row3] 40px [row4] 30px [end];
	column-gap: 2px;
	row-gap: 2px;
	grid-template-areas:
		'. . . '
		'dinoz name name '
		'dinoz status equip '
		'vie elements equip ';

	//grid-template-columns: [first] 2% [line1] 15% [line2] auto [line3] 35% [line4] 3% [end];
	//grid-template-rows: [first] 35px [row1] 170px [row2] 100px [last-line];
}
@media (max-width: 539px) {
	.dinoz {
		grid-template-columns: [first] 2.5% [line1] 26% [line2] 8% [line3] 13% [line3] 1%[line4] 13% [line5] 8% [line6] 26% [line7] 2.5% [end];
		grid-template-rows: [first] 40px [row2] 120px [row3] 20px [row4] 30px [row5] auto [row6] 3px [row7] auto [end];
		column-gap: 0;
		row-gap: 0;
		width: 100%;
		height: auto;
		grid-template-areas:
			'. . name name name name name . .'
			'. dinoz dinoz dinoz dinoz dinoz equip equip .'
			'. vie vie vie vie vie equip equip .'
			'. vie vie vie vie vie . . .'
			'. elements elements elements elements elements elements elements .'
			'. . . . . . . . .'
			'. status status status status status status status .';
		margin-bottom: 5px;
	}
	.dinozPanels {
		//background-image: url('../assets/design/dinoz_panels_bg.webp');
		background-repeat: repeat-y;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		width: auto;
		align-self: auto;

		// For futur implementation of header div
		// .header {
		// 	flex-grow: 100%;
		// 	height: 24px;
		// 	width: 100%;
		// 	background-image: url(../../assets/design/dinoz_footer.webp);
		// }
		.footer {
			display: none;
		}
	}
}
</style>
