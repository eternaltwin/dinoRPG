<template>
	<div id="listeDinoz">
		<div v-for="dinoz in dinozList" :key="dinoz.name">
			<!-- Bouton temporaire, uniquement pour accéder à la fiche du dinoz -->
			<button @click="goToDinozPage(dinoz.dinozId)">
			<DinozSWF :display="dinoz.display" :flip="1" :width="40" :height="40" type="sdino"></DinozSWF>
			{{ dinoz.name }}
			{{ $t('place.' + dinoz.place.name) }}
			</button>
		</div>
	</div>
</template>

<script>
import DinozService from '@/services/DinozService';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';

export default {
	name: 'listeDinoz',
	data () {
		return {
			dinozList: []
		};
	},
	created() {
		var idPlayer = parseInt(localStorage.idPlayer);
		DinozService.getDinozPlayer(idPlayer).then(res => {
			this.dinozList = res.data;
		});
	},
	methods: {
		goToDinozPage(dinozId) {
			this.$router.push({ name: 'dinozFiche', params: { id: dinozId } });
		}
	},
	components: {
		DinozSWF
	}
};
</script>

<style>

</style>
