<template>
	<div id="accueil">
		<button>{{ $t('bouton.obtenirDeLor') }}</button>
		<button>{{ $t('bouton.boutique') }}</button>
		<listeDinoz></listeDinoz>
		<button @click="goToDinozShop()">{{ $t('bouton.acheterDinoz') }}</button>
	</div>
</template>

<script>
import ListeDinoz from '@/components/dinoz/listeDinoz.vue';

export default {
	// S'il ne l'a pas en mémoire, récupère le lieu du premier dinoz de la liste
	created() {

	},
	methods: {
		goToDinozShop () {
			this.$router.push({ name: 'dinozShop' });
		}
	},
	components: {
		ListeDinoz
	}
};
</script>

<style>

</style>
