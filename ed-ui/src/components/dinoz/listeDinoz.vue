<template>
	<div id="listeDinoz">
		<div v-for="(dinoz, index) in dinozList" :key="index">
			<!-- Bouton temporaire, uniquement pour accéder à la fiche du dinoz -->
			<button @click="goToDinozPage(dinoz.dinozId)" >
				<SDinozSWF :display="dinoz.display" :flip="1" :width="40" :height="40" type="sdino"></SDinozSWF>
				{{ dinoz.name }}
				{{ $t('place.' + dinoz.place.name) }}
			</button>
		</div>
	</div>
</template>

<script>
import DinozService from '@/services/DinozService';
import SDinozSWF from '@/components/dinoz/dinozSWF.vue';

export default {
	name: 'listeDinoz',
	data () {
		return {
			dinozList: []
		};
	},
	created() {
		var idPlayer = parseInt(localStorage.idPlayer);
		// On fait une requête au serveur seulement si la liste des dinoz n'est pas présente dans le localStorage
		if (localStorage.listeDinoz === undefined || localStorage.listeDinoz === 'undefined') {
			DinozService.getDinozPlayer(idPlayer).then(res => {
				this.dinozList = res.data;
				localStorage.listeDinoz = JSON.stringify(res.data);
			});
		} else {
			this.dinozList = JSON.parse(localStorage.listeDinoz);
		}
	},
	methods: {
		goToDinozPage(dinozId) {
			this.$router.push({ name: 'dinozFiche', params: { id: dinozId } });
		}
	},
	components: {
		SDinozSWF
	}
};
</script>

<style>

</style>
