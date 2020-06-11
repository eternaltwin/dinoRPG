<template>
	<div id="accueil">
		Bienvenue sur DinoRPG 2 !</br>
		<button @click="getAllDinoz()">Get all dinoz from database</button></br>
		<input type="text" v-model="newDinoz.name"></br>
		<input type="number" v-model="newDinoz.raceId"></br>
		<button @click="createDinoz()">Créer nouveau Dinoz !</button>
	</div>
</template>

<script>
import DinozService from '../services/DinozService';

	export default {
		data(){
			return {
				newDinoz: {}
			}
		},
		methods: {
			getAllDinoz() {
				DinozService.getAll().then(function(res){
					console.log(res);
				});
			},
			createDinoz() {
				this.newDinoz.raceId = parseInt(this.newDinoz.raceId);
				DinozService.create(this.newDinoz).then(function(res){
					console.log(res);
				});
			}
		}
	}
</script>

<style>

</style>
