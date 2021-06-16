<template src="./DinozPage.html"></template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dinoz } from '@/models';
import { errorHandler } from '@/utils';
import { DinozService } from '@/services';
import { isNil } from 'lodash';
import ChooseDinozName from '@/components/dinoz/chooseDinozName.vue';
import Elements from '@/components/elements/elements.vue';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';

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
		Elements,
		DinozSWF
	},
	methods: {
		// Set dinoz name and display dinoz page
		setNameChoosen(newName: string): void {
			this.nameChoosen = true;
			this.dinozData.name = newName;
		},
		getImg(folder: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgName}.png`);
		},
		getBarSize(value: number, maxValue: number): string {
			const width: number = Math.round((value / maxValue) * 98);
			return `width : ${width}px ; height : 11px`;
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
