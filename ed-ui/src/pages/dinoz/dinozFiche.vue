<template>
	<div id="dinozFiche" v-if="!isLoading">
		<equipement type="dinoz" :objects="dinozData.objects"></equipement>
	</div>
</template>

<script>
import DinozService from '@/services/DinozService';
import Equipement from '@/components/equipement/equipement.vue';

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
			Equipement
		}
	}
</script>

<style>

</style>
