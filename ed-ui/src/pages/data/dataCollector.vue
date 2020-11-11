<template>
	<div id="dataCollector">
		<router-view />
		<button @click="getApiData()">Get Data from API</button>
	</div>
</template>

<script>
export default {
	methods: {
		getApiData() {
			window.open('https://twinoid.com/oauth/auth?response_type=code&client_id=373&redirect_uri=http://localhost:8080/api&scope=contacts+www.dinorpg.com&state=authentification');
		}
	}
};
</script>

<style>

</style>
