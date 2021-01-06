<template>
	<div id="common">
		<p>{{ money | beautifulNumber }}</p>
		<button>{{ $t('bouton.obtenirDeLor') }}</button>
		<button>{{ $t('bouton.boutique') }}</button>
		<listeDinoz></listeDinoz>
		<button @click="goToDinozShop()">{{ $t('bouton.acheterDinoz') }}</button>
		<router-view />
	</div>
</template>

<script>
import ListeDinoz from '@/components/dinoz/listeDinoz.vue';
import DinozService from '@/services/DinozService';
import { mapActions } from 'vuex';

export default {
	name: 'CommonElements',
	data() {
		return {
			money: 0
		};
	},
	created() {
		this.money = localStorage.money;
		var idPlayer = parseInt(localStorage.idPlayer);
		// On fait une requête au serveur seulement si la liste des dinoz n'est pas présente dans le store
		if (this.$store.state.dinozList.length === 0) {
			DinozService.getDinozPlayer(idPlayer).then(res => {
				this.dinozList = res.data;
				this.setDinozList(res.data);
			});
		}
	},
	methods: {
		...mapActions(['setDinozList']),
		goToDinozShop () {
			if (this.$router.currentRoute.name !== 'dinozShop') {
				this.$router.push({ name: 'dinozShop' });
			}
		}
	},
	components: {
		ListeDinoz
	}
};
</script>

<style>
</style>
