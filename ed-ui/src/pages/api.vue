<template>
	<div id="api">
		<span>{{ accountData }}</span>
	</div>
</template>

<script>
import DataService from '@/services/DataService';

export default {
	data() {
		return {
			accountData: {}
		};
	},
	props: {
		code: String
	},
	created() {
		DataService.getApiData(this.code).then(res => {
			this.accountData = res.data;
		});
	}
};
</script>

<style>

</style>
