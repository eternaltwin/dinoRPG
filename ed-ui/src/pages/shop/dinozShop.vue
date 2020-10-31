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

export default {
	created () {
		ShopService.getDinozFromDinozShop(localStorage.idPlayer).then(res => {
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
		async openPopinConfirm(dinoz) {
			var res = confirm('Confirmer cette action ?');
			if (res) {
				let listeDinoz = await DinozService.buyDinoz(dinoz);
				// Put the new dinoz list into localStorage
				localStorage.listeDinoz = JSON.stringify(listeDinoz.data);
				let dinozBought = listeDinoz.data.find(elem => elem.display === dinoz.display);
				// Redirect to dinoz page
				this.$router.push({ name: 'dinozFiche', params: { id: parseInt(dinozBought.dinozId) } });
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
