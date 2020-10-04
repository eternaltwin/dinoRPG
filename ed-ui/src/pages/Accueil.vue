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
import listeDinoz from '@/components/dinoz/listeDinoz.vue';

	export default {
		methods: {
			goToDinozShop () {
				this.$router.push({ name: 'dinozShop' });
			}
		},
		components: {
			listeDinoz
		}
	}
	
</script>

<style>

</style>
