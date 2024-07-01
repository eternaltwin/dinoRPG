<template>
	<div v-if="nameChoosen === false">
		<ChooseDinozName :dinozData="dinozData" @setNameChoosen="setNameChoosen" />
	</div>
	<div class="dinoz" v-if="nameChoosen === true">
		<DinozDisplay v-if="isReady" :dinozData="dinozData" />
	</div>
	<div class="dinozPanels" v-if="nameChoosen === true">
		<DinozActions
			v-if="isReady"
			:updateActions="updateActions"
			:dinoz="dinozData"
			@continueMission="continueMission()"
			@endMission="getFiche()"
			:key="dinozData"
		/>
		<TabPanel v-if="isReady" :dinozData="dinozData" :key="dinozData" />
		<div class="footer" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { errorHandler } from '../utils/index.js';
import { DinozService } from '../services/index.js';
import EventBus from '../events/index.js';
import { dinozStore, playerStore } from '../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import ChooseDinozName from '../components/dinoz/ChooseDinozName.vue';
import DinozDisplay from '../components/dinoz/DinozDisplay.vue';
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
		DinozDisplay,
		DinozActions,
		TabPanel
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
				const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;
				const dinozToUpdate = dinozList.find(dinoz => dinoz.id!.toString() === dinozId)!;
				dinozToUpdate.missionId = this.dinozData.missionId;
				dinozToUpdate.missionHUD = this.dinozData.missionHUD;
				this.dinozStore.setDinozList(dinozList);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		},
		async getFiche(): Promise<void> {
			const dinozId = this.$route.params.id as string;
			this.dinozData = await DinozService.getDinozFiche(parseInt(dinozId));
			const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;
			const dinozToUpdate = dinozList.findIndex(dinoz => dinoz.id!.toString() === dinozId);
			if (dinozToUpdate === -1) {
				this.dinozData = await DinozService.getDinozFiche(parseInt(dinozId));
				dinozList.push(this.dinozData);
			} else {
				dinozList.splice(dinozToUpdate, 1, {
					...dinozList.find(dinoz => dinoz.id!.toString() === dinozId),
					...this.dinozData
				});
			}
			if (this.dinozData.followers.length >= 1) {
				for (const follower of this.dinozData.followers) {
					const followerToUpdate = await DinozService.getDinozFiche(follower);
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
					if (!this.dinozData.followers.includes(d.id)) {
						d.leaderId = null;
					}
				});
			}
			this.dinozStore.setDinozList(dinozList);
			this.playerStore.setPlayerOptions({
				...this.playerStore.playerOptions,
				currentDinozId: parseInt(dinozId)
			});
			this.isReady = true;
		},
		updateActions(actions: ActionFiche[]) {
			this.dinozData.actions = actions;
		}
	},
	// Get dinoz data
	async mounted(): Promise<void> {
		EventBus.on('refreshDinoz', async e => {
			if (e) await this.getFiche();
		});
		EventBus.emit('isLoading', true);
		try {
			await this.getFiche();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
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
	background-image: url('../assets/design/dinoz_panels_bg.webp');
	background-repeat: repeat-y;
	display: flex;
	flex-wrap: wrap;
	position: relative;
	top: -11px;

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
	min-height: 265px;
}
</style>
