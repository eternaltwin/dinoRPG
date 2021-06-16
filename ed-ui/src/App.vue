<template>
	<div id="nav">
		<div v-if="displayAuth">
			<authentication-page></authentication-page>
		</div>
		<div v-else>
			<Data v-if="collectData" id="data"></Data>
			<main-page v-else></main-page>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainPage from '@/pages/MainPage.vue';
import Data from '@/components/data/data.vue';
import AuthenticationPage from '@/pages/AuthenticationPage.vue';
import store from '@/store';
import { isNil } from 'lodash';

export default defineComponent({
	name: 'App',
	data() {
		return {
			displayAuth: true as boolean,
			collectData: false as boolean
		};
	},
	components: {
		MainPage,
		Data,
		AuthenticationPage
	},
	mounted(): void {
		this.displayAuth = isNil(store.getters.getJwt);
	}
});
</script>

<style lang="scss">
@import '@/css/_main.scss';

#data {
	margin-top: 20px;
	margin-left: 20px;
}
</style>
