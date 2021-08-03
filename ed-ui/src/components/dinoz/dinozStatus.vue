<template>
	<div class="fx">
		<img
			:src="getImg('status', status.name)"
			v-for="(status, index) in dinozData.status"
			:key="index"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'DinozStatus',
	props: ['dinozData'],
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.png`);
		}
	}
});
</script>

<style lang="scss" scoped>
.fx {
	font-size: 0pt;
	position: absolute;
	margin-left: 195px;
	margin-top: 115px;
	width: 212px;

	img {
		border: 1px solid transparent;
		border-radius: 5px;

		&:hover {
			border-color: white;
		}
	}
}
</style>
