<template>
	<div id="app">
		<!--<auth v-if="auth && !collectData" @idChoisi="leaveAuth()"></auth>-->
		<!--<common-elements v-if="!auth && !collectData"></common-elements>-->
		<router-view @hideButton="hideButton()"/>
		<button v-if="!auth && !collectData && showGetDataButton" @click="authorizeApplication()">Get data</button>
	</div>
</template>

<script>
import auth from '@/components/authentication/authentication.vue';
import PlayerService from '@/services/PlayerService';
import CommonElements from '@/pages/CommonElements.vue';

export default {
	name: 'App',
	data () {
		return {
			auth: false,
			collectData: false,
			showGetDataButton: true
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
		},
		authorizeApplication () {
			window.open('http://localhost:50320/oauth/authorize?response_type=code&acess_type=offline&client_id=dinorpg&redirect_uri=http://localhost:8080/api&scope=&state=authentification');
		},
		hideButton() {
			this.showGetDataButton = false;
		}
	},
	components: {
		auth,
		CommonElements
	}
};
</script>

<style>
</style>
