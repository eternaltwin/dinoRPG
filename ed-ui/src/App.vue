<template>
	<div id="app">
		<auth v-if="auth" @idChoisi="leaveAuth()"></auth>
		<router-view v-else />
	</div>
</template>

<script>
import auth from '@/components/authentication/authentication.vue';
import PlayerService from '@/services/PlayerService';

export default {
	name: 'App',
	data () {
		return {
			auth: false
		};
	},
	created () {
		this.auth = localStorage.idPlayer === undefined;
	},
	methods: {
		async leaveAuth () {
			// If money isn't in localStorage, get it
			if (localStorage.money === undefined) {
				let res = await PlayerService.getMoney(localStorage.idPlayer);
				localStorage.money = res.data.money;
			}
			this.auth = false;
		}
	},
	components: {
		auth
	}
};
</script>

<style>
</style>
