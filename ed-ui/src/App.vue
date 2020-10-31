<template>
	<div id="app">
		<auth v-if="auth" @idChoisi="leaveAuth()"></auth>
		<router-view v-else />
	</div>
</template>

<script>
import auth from '@/components/authentication/authentication.vue';

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
		leaveAuth () {
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
