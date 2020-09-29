<template>
	<div id="dinozFiche" v-if="!isLoading">
		<img src="./../../assets/dinoz/dinoz_bg.jpg" alt="background dinoz">
		<equipement type="dinoz" :objects="dinozData.objects"></equipement>
		<status :status="dinozData.status"></status>
		<p>{{ dinozData.level.level }}</p>
	</div>
</template>

<script>
import DinozService from '@/services/DinozService';
import Equipement from '@/components/equipement/equipement.vue';
import Status from '@/components/status/statusList.vue';

	export default {
		data () {
			return {
				dinozData: {},
				isLoading: true
			}
		},
		created () {
			DinozService.getDinozFiche(this.$route.params.id).then(res => {this.dinozData = res.data;
				this.isLoading = false;
			});
		},
		components: {
			Equipement,
			Status
		}
	}
</script>

<style>

</style>
