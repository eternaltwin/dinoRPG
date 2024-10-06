<template>
	<input />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'DZInput',
	props: {}
});
</script>

<style lang="scss" scoped>
input {
	width: 80px;
	height: 25px;
	padding-left: 8px;
	padding-right: 8px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	background-image: url('../../assets/design/form_field_small.webp');
	background-repeat: no-repeat;
	background-color: transparent;
	outline: none;
	&:focus {
		background-image: url('../../assets/design/form_field_small_hover.webp');
	}
}
</style>
