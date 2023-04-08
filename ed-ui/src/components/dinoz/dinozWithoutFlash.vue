<template>
	<component
		v-if="raceName === 'moueffe' || raceName === 'pigmou'"
		:is="dinozToDisplay"
		:display="display"
		:life="life"
		:flip="flip"
	></component>
	<DinozSWF v-else :display="display" :width="190" :height="165" type="dino" :flip="-flip" :shop="shop"></DinozSWF>
</template>

<script lang="ts">
import { raceList } from '../../constants/index.js';
import { defineAsyncComponent, defineComponent } from 'vue';

export default defineComponent({
	name: 'DinozWithoutFlash',
	components: {
		DinozSWF: defineAsyncComponent(() => import('../../components/dinoz/dinozSWF.vue'))
	},
	props: {
		display: { type: String, required: true },
		life: { type: Number, required: true },
		flip: { type: Number, required: true },
		race: { type: Number, required: true },
		shop: { type: Boolean, required: false }
	},
	computed: {
		dinozToDisplay(): string {
			const raceName: string = Object.entries(raceList).find(race => parseInt(race[0]) === this.race)![1];
			return defineAsyncComponent(() => import(`./${raceName}/${raceName}.vue`));
		},
		raceName(): string {
			return Object.entries(raceList).find(race => parseInt(race[0]) === this.race)![1];
		}
	}
});
</script>
