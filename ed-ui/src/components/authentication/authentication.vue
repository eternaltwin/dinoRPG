<template>
	<div id="auth">
		<input type="text" name="login" v-model="login">
		<br>
		<input type="password" name="password" v-model="password">
		<br>
		<button @click="authenticateToET()">Validate player ID</button>
	</div>
</template>

<script>
import OauthService from '@/services/OauthService';

export default {
	data () {
		return {
			login: undefined,
			password: undefined
		};
	},
	methods: {
		validateName () {
			localStorage.idPlayer = this.login;
			this.$emit('idChoisi');
		},
		authenticateToET() {
			const loginToSend = this.login.toLowerCase();
			const passwordToSend = Buffer.from(this.password, 'utf-8').toString('hex');

			return OauthService.authenticateUser(loginToSend, passwordToSend).then(res => {
				console.log(res);
			}).catch(err => {
				console.log(err);
			});
		}
	}
};
</script>

<style>
</style>
