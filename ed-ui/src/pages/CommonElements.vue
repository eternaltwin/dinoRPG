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
import { errorHandler } from '@/helpers/errorHandler';

export default {
	name: 'CommonElements',
	data() {
		return {
			money: 0
		};
	},
	created() {
		this.money = localStorage.money;
		// On fait une requête au serveur seulement si la liste des dinoz n'est pas présente dans le store
		if (this.$store.state.dinozList.length === 0) {
			DinozService.getDinozPlayer().then(res => {
				this.dinozList = res.data;
				this.setDinozList(res.data);
			}).catch(err => {
				errorHandler.handle(err);
			});
		}
	},
	methods: {
		...mapActions(['setDinozList']),
		goToDinozShop () {
			this.$router.push({ name: 'dinozShop' }).catch(() => {});
		}
	},
	components: {
		ListeDinoz
	}
};
</script>

<style>
</style>
