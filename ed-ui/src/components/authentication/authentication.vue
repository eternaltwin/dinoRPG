<template>
	<div id="auth">
		<input v-model="idPlayer"></br>
		<button @click="validateName()">Validate player ID</button>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				idPlayer: undefined
			}
		},
		methods: {
			validateName () {
				this.$session.set('idPlayer', this.idPlayer);
				this.$emit('idChoisi');
			}
		}
	}
</script>

<style>
	
</style>