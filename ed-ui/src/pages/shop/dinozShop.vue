<template>
	<div id="dinozShop">
		<img :src="getImg('shop_dinoz_bg')">
	</div>
</template>

<script>

	export default {
		methods: {
			getImg (imgName) {
				var images = require.context('@/assets/shop/', false, /\.png$/);
			    return images('./' + imgName + '.png');
			}
		}
	}
	
</script>

<style>

</style>
