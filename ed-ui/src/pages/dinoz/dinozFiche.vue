<template>
	<div id="dinozFiche">
		<equipement :nbrColonnes="2" :nbrLignes="3" :objects="dinozData.objects" @objectClicked="test"></equipement>
	</div>
</template>

<script>
import DinozService from '@/services/DinozService';
import Equipement from '@/components/equipement/equipement.vue';

	export default {
		data () {
			return {
				dinozData: {}
			}
		},
		created () {
			DinozService.getDinozFiche(this.$route.params.id).then(res =>
				this.dinozData = res.data);
		},
		methods: {
			test (valeur) {
				console.log(valeur);
			}
		},
		components: {
			Equipement
		}
	}
</script>

<style>

</style>
