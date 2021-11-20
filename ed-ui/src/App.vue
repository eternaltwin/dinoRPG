<template>
	<link rel="icon" href="public/favicon.ico" />
	<Title :title="$t('pageTitle.default')" />
	<HomePage v-if="displayAuth" />
	<MainPage v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainPage from '@/pages/MainPage.vue';
import HomePage from '@/pages/HomePage.vue';
import Title from '@/components/utils/Title.vue';
import store from '@/store';
import { isNil } from 'lodash';

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
		Title
	},
	mounted(): void {
		this.displayAuth = isNil(store.getters.getJwt);
	}
});
</script>

<style lang="scss">
#data {
	margin-top: 20px;
	margin-left: 20px;
}
</style>
