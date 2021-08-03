<template>
	<div id="centerContent">
		<div v-if="nameChoosen === false">
			<ChooseDinozName
				:dinozData="dinozData"
				@setNameChoosen="setNameChoosen"
			/>
		</div>
		<div class="dinoz" v-if="nameChoosen === true">
			<DinozDisplay :dinozData="dinozData" />
		</div>
		<div class="dinozPanels" v-if="nameChoosen === true">
			<!--<div class="header" />(à implémenter)-->
			<DinozActions />
			<TabPanel />
			<div class="footer" />
		</div>
	</div>
</template>

<script lang="ts">
import DinozActions from '@/components/dinoz/dinozActions.vue';
import DinozDisplay from '@/components/dinoz/dinozDisplay.vue';
import TabPanel from '@/components/common/TabPanel.vue';
import { defineComponent } from 'vue';
import { Dinoz } from '@/models';
import { errorHandler } from '@/utils';
import { DinozService } from '@/services';
import { isNil } from 'lodash';
import ChooseDinozName from '@/components/dinoz/chooseDinozName.vue';

export default defineComponent({
	name: 'DinozPage',
	data() {
		return {
			nameChoosen: undefined as boolean | undefined,
			dinozData: {} as Dinoz
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
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.png`);
		},
		// Set dinoz name and display dinoz page
		setNameChoosen(newName: string): void {
			this.nameChoosen = true;
			this.dinozData.name = newName;
		}
	},
	// Get dinoz data
	async mounted(): Promise<void> {
		try {
			const dinozId = this.$route.params.id as string;
			this.dinozData = await DinozService.getDinozFiche(dinozId);
		} catch (err) {
			errorHandler.handle(err);
			return Promise.reject(err);
		}

		this.nameChoosen = this.dinozData.name !== '?';
	},
	watch: {
		// Reload page if player go on another dinoz page
		'$route.params.id': function(to) {
			if (!isNil(to)) {
				this.$router.go(0);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.dinozPanels {
	background-image: url('~@/assets/design/dinoz_panels_bg.png');
	background-repeat: repeat-y;
	display: flex;
	flex-wrap: wrap;

	// For futur implementation of header div
	// .header {
	// 	flex-grow: 100%;
	// 	height: 24px;
	// 	width: 100%;
	// 	background-image: url(../../assets/design/dinoz_footer.png);
	// }
	.footer {
		flex-grow: 100%;
		height: 24px;
		width: 100%;
		background-image: url('~@/assets/design/dinoz_footer.png');
	}
}
.dinoz {
	background-image: url('~@/assets/dinoz/dinoz_bg.jpg');
	background-repeat: no-repeat;
	min-height: 265px;
	margin-top: 5px;
}
</style>
