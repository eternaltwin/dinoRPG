<template>
	<div id="dinozShop">
		<img :src="getImg('shop_dinoz_bg')">
		<div v-for="dinoz in dinozList">
			<dinozSWF :height="165" :width="190" :url="url" :params="params" :flashVars="getFlashVars(dinoz.display)"></dinozSWF>
			<span>{{ dinoz.race.name }}</span>
			<span>{{ dinoz.race.price }}</span>
			<span>{{ dinoz.race.nbrFireCase }}</span>
			<span>{{ dinoz.race.nbrWoodCase }}</span>
			<span>{{ dinoz.race.nbrWaterCase }}</span>
			<span>{{ dinoz.race.nbrLightCase }}</span>
			<span>{{ dinoz.race.nbrAirCase }}</span>
		</div>
	</div>
</template>

<script>
import ShopService from '@/services/ShopService';
import DinozService from '@/services/DinozService';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';
import Constants from '@/Constants.js';

	export default {
		async created () {
			this.url = Constants.getDinozSWF();
			await this.getDinozFromDinozShop();
		},
		data() {
			return {
				params: {
		          allowScriptAccess: 'always',
		          bgcolor: '#fce3bb',
		          menu: 'false',
		          scale: 'noscale',
		          wmode: 'transparent'
		        },
		        flashVars: {},
        		width: 190,
        		height: 165,
        		url: '',
				dinozList: undefined
			}
		},
		methods: {
			getImg (imgName) {
				var images = require.context('@/assets/shop/', false, /\.png$/);
			    return images('./' + imgName + '.png');
			},
			async getDinozFromDinozShop() {
				ShopService.getDinozFromDinozShop(localStorage.idPlayer).then(res => {
					this.dinozList = res.data;
				});
			},
			getFlashVars(display) {
				return {
					data: display,
		         	chk: 0,
		          	damages: 0,
		          	flip: 1
				};
			}
		},
		components: {
			DinozSWF
		}
	}
	
</script>

<style>

</style>
