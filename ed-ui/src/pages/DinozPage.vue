<template>
	<template v-if="nameChoosen === false">
		<ChooseDinozName :dinozData="dinozData" @setNameChoosen="setNameChoosen" />
	</template>
	<Suspense
		><DinozDisplay
			v-if="nameChoosen === true"
			v-show="isReady"
			:dinozData="dinozData"
			:key="dinozData.display" /><template #fallback> <Loading /> </template
	></Suspense>
	<div class="dinozPanels" v-if="nameChoosen === true">
		<DinozActions
			v-show="isReady"
			:updateActions="updateActions"
			:dinoz="dinozData"
			@continueMission="continueMission()"
			@endMission="getFiche()"
		/>
		<TabPanel v-show="isReady" :dinozData="dinozData" />
		<!--		<div class="footer" />-->
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { errorHandler } from '../utils/index.js';
import { DinozService } from '../services/index.js';
import EventBus from '../events/index.js';
import { dinozStore, playerStore } from '../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import ChooseDinozName from '../components/dinoz/ChooseDinozName.vue';
import DinozActions from '../components/dinoz/DinozActions.vue';
import TabPanel from '../components/common/TabPanel.vue';
import { ActionFiche } from '@drpg/core/models/dinoz/ActionList';

export default defineComponent({
	name: 'DinozPage',
	data() {
		return {
			dinozStore: dinozStore(),
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
		DinozDisplay: defineAsyncComponent(() => import('../components/dinoz/DinozDisplay.vue'))
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
			EventBus.emit('isLoading', true);
			try {
				const dinozId = this.$route.params.id as string;
				this.dinozData = await DinozService.getDinozFiche(parseInt(dinozId));
				const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList;
				const dinozToUpdate = dinozList.find(dinoz => dinoz.id.toString() === dinozId);
				if (dinozToUpdate) {
					dinozToUpdate.missionId = this.dinozData.missionId;
					dinozToUpdate.missionHUD = this.dinozData.missionHUD;
				}
				this.dinozStore.setDinozList(dinozList);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async getFiche(): Promise<void> {
			const dinozId = this.$route.params.id as string;
			this.dinozData = await DinozService.getDinozFiche(parseInt(dinozId));
			const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList;
			const dinozToUpdate = dinozList.findIndex(dinoz => dinoz.id.toString() === dinozId);
			if (dinozToUpdate === -1) {
				this.dinozData = await DinozService.getDinozFiche(parseInt(dinozId));
				dinozList.push(this.dinozData);
			} else {
				dinozList.splice(dinozToUpdate, 1, {
					...dinozList.find(dinoz => dinoz.id.toString() === dinozId),
					...this.dinozData
				});
			}
			if (this.dinozData.followers.length >= 1) {
				for (const follower of this.dinozData.followers) {
					const followerToUpdate = await DinozService.getDinozFiche(follower.id);
					const followerIndex = dinozList.findIndex(dinoz => dinoz.id === followerToUpdate.id);
					dinozList.splice(followerIndex, 1, {
						...dinozList.find(dinoz => dinoz.id === followerToUpdate.id),
						...followerToUpdate
					});
				}
			}
			const storedFollowers = dinozList.filter(d => d.leaderId === +dinozId);
			if (storedFollowers.length > 0) {
				storedFollowers.map(d => {
					if (!this.dinozData.followers.some(f => f.id === d.id)) {
						d.leaderId = null;
					}
				});
			}
			this.dinozStore.setDinozList(dinozList);
			this.playerStore.setPlayerOptions({
				...this.playerStore.playerOptions
			});
			this.dinozStore.setCurrentDinozId(parseInt(dinozId));
			this.isReady = true;
		},
		updateActions(actions: ActionFiche[]) {
			this.dinozData.actions = actions;
		}
	},
	// Get dinoz data
	async mounted(): Promise<void> {
		EventBus.on('refreshDinoz', async e => {
			if (e) {
				try {
					await this.getFiche();
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		});
		EventBus.emit('isLoading', true);
		try {
			await this.getFiche();
			EventBus.emit('isLoading', false);
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
