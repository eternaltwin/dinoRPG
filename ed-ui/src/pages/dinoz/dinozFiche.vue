<template>
	<div id="dinozFiche" v-if="!isLoading">
		<div v-if="dinozData.name === '?'">
			<choose-dinoz-name :dinozData="dinozData"></choose-dinoz-name>
		</div>
		<div v-else>
			<img src="@/assets/dinoz/dinoz_bg.jpg" alt="background_dinoz">
			<equipement type="dinoz" :objects="dinozData.assDinozObject"></equipement>
			<status :status="dinozData.status"></status>
			<p>{{ dinozData.level.level }}</p>
			<p>{{ dinozData.name }}</p>
			<elements :fire="dinozData.nbrUpFire" :wood="dinozData.nbrUpWood" :water="dinozData.nbrUpWater" :light="dinozData.nbrUpLight" :air="dinozData.nbrUpAir"></elements>
			<dinozSWF :display="dinozData.display" :width="190" :height="165" type="dino"></dinozSWF>
		</div>
	</div>
</template>

<script>
import DinozService from '@/services/DinozService';
import Equipement from '@/components/equipement/equipement.vue';
import Status from '@/components/status/statusList.vue';
import Elements from '@/components/elements/elementsFicheDinoz.vue';
import ChooseDinozName from '@/components/dinoz/chooseDinozName.vue';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';
import { errorHandler } from '@/helpers/errorHandler';

export default {
	data () {
		return {
			dinozData: {},
			isLoading: true
		};
	},
	async created () {
		try {
			const dinozDetails = await DinozService.getDinozFiche(this.$route.params.id);
			this.dinozData = dinozDetails.data;
		} catch (err) {
			errorHandler.handle(err);
		}

		this.isLoading = false;
	},
	components: {
		Equipement,
		Status,
		Elements,
		ChooseDinozName,
		DinozSWF
	}
};
</script>

<style>

</style>
