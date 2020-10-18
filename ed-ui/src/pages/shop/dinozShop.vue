<template>
	<div id="dinozShop">
		<img :src="getImg('shop_dinoz_bg')">
		<div v-for="dinoz in dinozList">
			<dinozSWF :height="165" :width="190" url="http://data.dinorpg.com/swf/dino.swf" :params="params" :flashVars="getFlashVars(dinoz.display)"></dinozSWF>
		</div>
	</div>
</template>

<script>
import ShopService from '@/services/ShopService';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';

	export default {
		async created () {
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
        		url: 'http://data.dinorpg.com/swf/dino.swf',
				dinozList: undefined
			}
		},
		methods: {
			getImg (imgName) {
				var images = require.context('@/assets/shop/', false, /\.png$/);
			    return images('./' + imgName + '.png');
			},
			getDinozFromDinozShop() {
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
