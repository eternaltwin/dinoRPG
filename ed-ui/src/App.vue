<template>
	<div id="app">
		<auth v-if="auth && !collectData" @idChoisi="leaveAuth()"></auth>
		<common-elements v-if="!auth && !collectData"></common-elements>
		<data-collector v-if="!auth && collectData"></data-collector>
		<button v-if="!auth && !collectData" @click='showDataCollector()'>Collect data</button>
	</div>
</template>

<script>
import auth from '@/components/authentication/authentication.vue';
import PlayerService from '@/services/PlayerService';
import CommonElements from '@/pages/CommonElements.vue';
import DataCollector from '@/pages/data/dataCollector.vue';

export default {
	name: 'App',
	data () {
		return {
			auth: false,
			collectData: false
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
		showDataCollector () {
			this.collectData = true;
		}
	},
	components: {
		auth,
		CommonElements,
		DataCollector
	}
};
</script>

<style>
</style>
