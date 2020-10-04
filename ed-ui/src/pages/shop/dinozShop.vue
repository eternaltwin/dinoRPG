<template>
	<div id="dinozShop">
		<img :src="getImg('shop_dinoz_bg')">
	</div>
</template>

<script>
import ShopService from '@/services/ShopService';

	export default {
		async created () {
			await this.getDinozFromDinozShop();
		},
		methods: {
			getImg (imgName) {
				var images = require.context('@/assets/shop/', false, /\.png$/);
			    return images('./' + imgName + '.png');
			},
			getDinozFromDinozShop() {
				ShopService.getDinozFromDinozShop(this.$session.get('idPlayer'));
			}
		}
	}
	
</script>

<style>

</style>
