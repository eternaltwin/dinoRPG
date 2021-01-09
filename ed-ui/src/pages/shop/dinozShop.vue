<template>
	<div id="dinozShop">
		<img src="@/assets/shop/shop_dinoz_bg.png">
		<div v-for="dinoz in dinozList" :key="dinoz.dinozId">
			<dinozSWF :display="dinoz.display" :width="190" :height="165" type="dino"></dinozSWF>
			<span>{{ dinoz.race.name }}</span>
			<span>{{ dinoz.race.price }}</span>
			<span>{{ dinoz.race.nbrFireCase }}</span>
			<span>{{ dinoz.race.nbrWoodCase }}</span>
			<span>{{ dinoz.race.nbrWaterCase }}</span>
			<span>{{ dinoz.race.nbrLightCase }}</span>
			<span>{{ dinoz.race.nbrAirCase }}</span>
			<span v-if="dinoz.race.skill">{{ dinoz.race.skill.name }}</span>
			<button @click="openPopinConfirm(dinoz)">Choisir</button>
		</div>
	</div>
</template>

<script>
import ShopService from '@/services/ShopService';
import DinozService from '@/services/DinozService';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';
import { mapActions } from 'vuex';

export default {
	created () {
		ShopService.getDinozFromDinozShop().then(res => {
			this.dinozList = res.data;
		});
	},
	data() {
		return {
			flashVars: {},
			dinozList: undefined
		};
	},
	methods: {
		...mapActions(['addDinoz']),
		async openPopinConfirm(dinoz) {
			var res = confirm('Confirmer cette action ?');
			if (res) {
				// Update player's money
				localStorage.money = parseInt(localStorage.money - dinoz.race.price);
				// Update dinoz list
				let dinozId = await DinozService.buyDinoz(dinoz.id);
				let dinozCreated = {
					dinozId: dinozId.data.toString(),
					name: '',
					display: dinoz.display,
					following: null,
					life: 100,
					place: {
						name: 'dinoville'
					}
				};
				this.addDinoz(dinozCreated);
				// Redirect to dinoz page
				this.$router.push({ name: 'dinozFiche', params: { id: dinozCreated.dinozId } });
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
