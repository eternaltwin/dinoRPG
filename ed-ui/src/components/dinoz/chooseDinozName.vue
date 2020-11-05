<template>
	<div id="chooseDinozName">
		<p>{{ $t('chooseDinoz.information') }}</p>
		<dinozSWF :display="dinozData.display" :width="190" :height="165" type="dino"></dinozSWF>
		<p>{{ $t('chooseDinoz.nomDuDinoz') }}</p>
		<input type="text" v-model="name">
		<button @click="nameDinoz()">{{ $t('bouton.nommer') }}</button>
	</div>
</template>

<script>
import DinozSWF from '@/components/dinoz/dinozSWF.vue';
import DinozService from '@/services/DinozService';
import { mapActions } from 'vuex';

export default {
	props: {
		dinozData: Object
	},
	data() {
		return {
			name: '',
			regexName: /^[a-zA-Z0-9éèêëÉÈÊËîïÎÏôÔûÛ\-']{3,}$/
		};
	},
	methods: {
		...mapActions(['setDinozName']),
		nameDinoz() {
			// Check if dinoz name matches regex
			if (this.regexName.test(this.name)) {
				var dinoz = {
					dinozId: this.dinozData.dinozId,
					name: this.name
				};
				DinozService.setDinozName(dinoz).then(res => {
					this.dinozData.name = this.name;
					this.setDinozName(dinoz);
				});
			} else {
				// TODO : afficher popin d'erreur
				console.log('Seulement chiffres et lettres ! ');
			}
		}
	},
	components: {
		DinozSWF
	}
};
</script>

<style>

</style>
