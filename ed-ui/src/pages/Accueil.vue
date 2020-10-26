<template>
	<div id="accueil">
		Bienvenue sur DinoRPG 2 !
		</br>
		</br>
		<listeDinoz></listeDinoz>
		<button @click="goToDinozShop()">{{ $t('bouton.acheterDinoz') }}</button>
	</div>
</template>

<script>
import ListeDinoz from '@/components/dinoz/listeDinoz.vue';

	export default {
		methods: {
			goToDinozShop () {
				this.$router.push({ name: 'dinozShop' });
			}
		},
		components: {
			ListeDinoz
		}
	}
	
</script>

<style>

</style>
