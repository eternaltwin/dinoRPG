<!-- eslint-disable tailwindcss/no-custom-classname -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Loading'
});
</script>

<template>
	<div class="spinner size-[56px] rounded-[50%]"></div>
</template>

<style scoped lang="scss">
.spinner {
	border: 9px solid;
	border-color: #edd2ba;
	border-right-color: #ffb347;
	animation: spinner-d3wgkg 1.4s infinite linear;
}
@keyframes spinner-d3wgkg {
	to {
		transform: rotate(1turn);
	}
}
</style>
