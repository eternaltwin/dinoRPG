<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div v-if="nameChoosen === false">
		<ChooseDinozName :dinozData="dinozData" @setNameChoosen="setNameChoosen" />
	</div>
	<div
		class="ml-[-45px] mt-0 min-h-[265px] min-w-full bg-none bg-contain bg-no-repeat sm:ml-0 sm:mt-0 sm:bg-[url('./assets/background/dinoz_bg_cut.webp')]"
		v-if="nameChoosen === true"
	>
		<Suspense>
			<DinozDisplay v-if="isReady" :dinozData="dinozData" />
		</Suspense>
	</div>
	<div
		class="flex flex-col flex-wrap gap-[20px] bg-none bg-repeat-y sm:relative sm:top-[18px] sm:flex-row sm:gap-0 sm:bg-[url('./assets/design/dinoz_panels_bg.webp')]"
		v-if="nameChoosen === true"
	>
		<div
			class="relative top-[-10px] h-[24px] w-full rotate-180 bg-none bg-contain bg-no-repeat sm:bg-[url('./assets/design/dinoz_footer.webp')]"
			style="background-position: top right"
		/>
		<div class="flex flex-col items-center justify-center gap-[20px] sm:block sm:gap-0">
			<DinozActions
				v-if="isReady"
				:updateActions="updateActions"
				:dinoz="dinozData"
				@continueMission="continueMission()"
				@endMission="getFiche()"
				:key="dinozData"
			/>
			<TabPanel v-if="isReady" :dinozData="dinozData" :key="dinozData" />
		</div>
		<div class="h-[24px] w-full bg-none bg-contain bg-no-repeat sm:bg-[url('./assets/design/dinoz_footer.webp')]" />
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
				const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;
				const dinozToUpdate = dinozList.find(dinoz => dinoz.id!.toString() === dinozId)!;
				dinozToUpdate.missionId = this.dinozData.missionId;
				dinozToUpdate.missionHUD = this.dinozData.missionHUD;
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
