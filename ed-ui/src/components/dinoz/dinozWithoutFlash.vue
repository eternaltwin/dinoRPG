<template>
	<component
		:is="dinozToDisplay"
		:display="display"
		:life="60"
		:flip="-1"
	></component>
</template>

<script lang="ts">
import { raceList } from '@/constants';
import { defineAsyncComponent, defineComponent } from 'vue';

export default defineComponent({
	name: 'DinozWithoutFlash',
	props: {
		display: { type: String, required: true },
		life: { type: Number, required: true }
	},
	computed: {
		dinozToDisplay(): string {
			const raceName: string = Object.entries(raceList).find(
				race => race[0].toString() === this.display[0]
			)![1];
			return defineAsyncComponent(() =>
				import(`@/components/dinoz/${raceName}/${raceName}.vue`)
			);
		}
	}
});
</script>
