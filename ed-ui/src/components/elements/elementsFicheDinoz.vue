<template>
	<div id="elementsFicheDinoz">
		<img :src="getImg(0)">
		<span>{{ fire }}</span>
		<img :src="getImg(1)">
		<span>{{ wood }}</span>
		<img :src="getImg(2)">
		<span>{{ water }}</span>
		<img :src="getImg(3)">
		<span>{{ light }}</span>
		<img :src="getImg(4)">
		<span>{{ air }}</span>
	</div>
</template>

<script>
export default {
	props: {
		fire: Number,
		wood: Number,
		water: Number,
		light: Number,
		air: Number
	},
	methods: {
		getImg (index) {
			return require('@/assets/elements/elem_' + index + '.png');
		}
	}
};
</script>

<style>
</style>
