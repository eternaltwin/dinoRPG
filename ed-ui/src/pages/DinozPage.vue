<template>
	<div v-if="nameChoosen === false">
		<ChooseDinozName :dinozData="dinozData" @setNameChoosen="setNameChoosen" />
	</div>
	<div class="dinoz" v-if="nameChoosen === true">
		<DinozDisplay :dinozData="dinozData" />
	</div>
	<div class="dinozPanels" v-if="nameChoosen === true">
		<!--<div class="header" />(à implémenter)-->
		<DinozActions :dinozActions="dinozData.actions" />
		<TabPanel :dinozData="dinozData" />
		<div class="footer" />
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { Dinoz } from '@/models';
import { errorHandler } from '@/utils';
import { DinozService } from '@/services';
import { isNil } from 'lodash';
import EventBus from '@/events';

export default defineComponent({
	name: 'DinozPage',
	data() {
		return {
			nameChoosen: undefined as boolean | undefined,
			dinozData: {} as Dinoz
		};
	},
	components: {
		ChooseDinozName: defineAsyncComponent(() =>
			import('@/components/dinoz/chooseDinozName.vue')
		),
		DinozDisplay: defineAsyncComponent(() =>
			import('@/components/dinoz/dinozDisplay.vue')
		),
		DinozActions: defineAsyncComponent(() =>
			import('@/components/dinoz/dinozActions.vue')
		),
		TabPanel: defineAsyncComponent(() =>
			import('@/components/common/TabPanel.vue')
		)
	},
	methods: {
		getBarSize(value: number, maxValue: number): string {
			const width: number = Math.round((value / maxValue) * 98);
			return `width : ${width}px ; height : 11px`;
		},
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		},
		// Set dinoz name and display dinoz page
		setNameChoosen(newName: string): void {
			this.nameChoosen = true;
			this.dinozData.name = newName;
		}
	},
	// Get dinoz data
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			const dinozId = this.$route.params.id as string;
			this.dinozData = await DinozService.getDinozFiche(dinozId);
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
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
	background-image: url('~@/assets/design/dinoz_panels_bg.webp');
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
		flex-grow: 100%;
		height: 24px;
		width: 100%;
		background-image: url('~@/assets/design/dinoz_footer.webp');
	}
}
.dinoz {
	background-image: url('~@/assets/background/dinoz_bg_cut.webp');
	background-repeat: no-repeat;
	min-height: 265px;
}
</style>
