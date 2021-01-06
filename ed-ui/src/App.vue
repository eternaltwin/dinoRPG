<template>
	<div id="app">
		<auth v-if="auth && !collectData" @idChoisi="leaveAuth()"></auth>
		<common-elements v-if="!auth && !collectData"></common-elements>
		<!--<router-view @hideButton="hideButton()"/>-->
		<!--<form method="POST" :action="getURI()">
			<input type="submit" v-if="!auth && !collectData && showGetDataButton" value="Log in to Eternal-Twin" />
		</form>-->
	</div>
</template>

<script>
import auth from '@/components/authentication/authentication.vue';
import PlayerService from '@/services/PlayerService';
import CommonElements from '@/pages/CommonElements.vue';
import _ from 'lodash';

export default {
	name: 'App',
	data () {
		return {
			auth: true,
			collectData: false,
			showGetDataButton: false
		};
	},
	created () {
		this.auth = _.isNil(localStorage.jwt);
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
		hideButton() {
			this.showGetDataButton = false;
		},
		getURI() {
			return process.env.serverURI + 'oauth/redirect';
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
