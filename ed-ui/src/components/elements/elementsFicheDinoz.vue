<template>
	<div id="elementsFicheDinoz">
		<img :src="getImg(0)">
		<span>{{ elements.fire }}</span>
		<img :src="getImg(1)">
		<span>{{ elements.wood }}</span>
		<img :src="getImg(2)">
		<span>{{ elements.water }}</span>
		<img :src="getImg(3)">
		<span>{{ elements.light }}</span>
		<img :src="getImg(4)">
		<span>{{ elements.air }}</span>
	</div>
</template>

<script>
export default {
	props: {
		elements: Object
	},
	methods: {
		getImg (index) {
			var images = require.context('@/assets/elements/', false, /\.png$/);
			return images('./elem_' + index + '.png');
		}
	}
};
</script>

<style>
</style>
