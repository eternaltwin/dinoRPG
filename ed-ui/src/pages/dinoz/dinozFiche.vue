<template>
	<div id="dinozFiche" v-if="!isLoading">
		<div v-if="!dinozData.name">
			<choose-dinoz-name :dinozData="dinozData"></choose-dinoz-name>
		</div>
		<div v-else>
			<img src="@/assets/dinoz/dinoz_bg.jpg" alt="background dinoz">
			<equipement type="dinoz" :objects="dinozData.objects"></equipement>
			<status :status="dinozData.status"></status>
			<p>{{ dinozData.level.level }}</p>
			<p>{{ dinozData.name }}</p>
			<elements :elements="dinozData.elements"></elements>
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
	created () {
		DinozService.getDinozFiche(this.$route.params.id).then(res => {
			this.dinozData = res.data;
			this.isLoading = false;
		}).catch(err => {
			errorHandler.handle(err);
			this.$router.push({ name: 'Accueil' });
		});
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
