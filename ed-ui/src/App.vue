<template>
	<link rel="icon" href="public/favicon.ico" />
	<Title :title="$t('pageTitle.default')" />
	<HomePage v-if="displayAuth" />
	<MainPage v-else />
	<Spinner />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainPage from '@/pages/MainPage.vue';
import HomePage from '@/pages/HomePage.vue';
import Title from '@/components/utils/Title.vue';
import Spinner from '@/components/utils/Spinner.vue';
import { isNil } from 'lodash';
import { sessionStore } from './store';

export default defineComponent({
	name: 'App',
	data() {
		return {
			displayAuth: true as boolean
		};
	},
	components: {
		MainPage,
		HomePage,
		Title,
		Spinner
	},
	mounted(): void {
		this.displayAuth = isNil(sessionStore.getters.getJwt);
	}
});
</script>

<style lang="scss">
#data {
	margin-top: 20px;
	margin-left: 20px;
}
</style>
