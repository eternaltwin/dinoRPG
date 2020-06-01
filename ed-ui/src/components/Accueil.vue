<template>
	<div id="accueil">
		Bienvenue sur DinoRPG 2 !</br>
		<button @click="getAllDinoz()">Get all dinoz from database</button>
	</div>
</template>

<script>
import DinozService from '../services/DinozService';

	export default {
		data(){
			return {

			}
		},
		methods: {
			getAllDinoz() {
				DinozService.getAll().then(function(res){
					console.log(res);
				});
			}
		}
	}
</script>

<style>

</style>
