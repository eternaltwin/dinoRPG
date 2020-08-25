<template>
	<div id="accueil">
		Bienvenue sur DinoRPG 2 !</br>
		<button @click="getAllDinoz()">Get all dinoz from database</button>
		<div v-for="dinoz in dinozList">
			<p>{{ dinoz }}</p>
		</div>
	</div>
</template>

<script>
import DinozService from '../services/DinozService';

	export default {
		data () {
			return {
				dinozList: []
			}
		},
		methods: {
			getAllDinoz() {
				DinozService.getAll().then(res =>
					this.dinozList = res.data
				);
			}
		}
	}
</script>

<style>

</style>
