<template>
	<div id="chooseDinozName">
		<dinozSWF :display="display"></dinozSWF>
	</div>
</template>

<script>
import DinozSWF from '@/components/dinoz/dinozSWF.vue';

	export default {
		props: {
			display: String
		},
		components: {
			DinozSWF
		}
	}
</script>

<style>

</style>
