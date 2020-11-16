<template>
	<div id="api">
	</div>
</template>

<script>
import DataService from '@/services/DataService';

export default {
	props: {
		code: String
	},
	created() {
		DataService.getApiData(this.code).then(res => {
			console.log(res.data);
		});
	}
};
</script>

<style>

</style>
