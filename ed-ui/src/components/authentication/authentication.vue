<template>
	<div id="auth">
		Login : <input type="text" name="login" v-model="login">
		<br>
		Password : <input type="password" name="password" v-model="password">
		<br>
		<div v-if="erreurAuthentification">
			<span>Incorrect login or password</span>
			<br>
		</div>
		<button @click="authenticateToET()">Authenticate to Eternal-Twin</button>
	</div>
</template>

<script>
import OauthService from '@/services/OauthService';

export default {
	data () {
		return {
			login: undefined,
			password: undefined,
			erreurAuthentification: false
		};
	},
	methods: {
		authenticateToET() {
			const loginToSend = this.login.toLowerCase();
			const passwordToSend = Buffer.from(this.password, 'utf-8').toString('hex');

			return OauthService.authenticateUser(loginToSend, passwordToSend).then(res => {
				localStorage.jwt = res.data;
				this.$emit('idChoisi');
				console.log(res);
			}).catch(err => {
				this.erreurAuthentification = true;
				console.log(err);
			});
		}
	}
};
</script>

<style>
</style>
