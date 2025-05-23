<template>
	<input />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'DZInput',
	props: {
		type: {
			type: String,
			default: 'text'
		}
	}
});
</script>

<style lang="scss" scoped>
input {
	width: 64px;
	height: 20px;
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 2px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	background-image: url('../../assets/design/form_field_small.webp');
	background-repeat: no-repeat;
	background-color: transparent;
	&:focus {
		background-image: url('../../assets/design/form_field_small_hover.webp');
	}
}
</style>
