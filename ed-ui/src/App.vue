<template>
	<TitleHeader :title="$t('pageTitle.default')" />
	<RouterView />
	<Spinner />
	<FooterComp />
	<ErrorMessage />
	<Toast />
	<div class="impact verdana"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from './components/utils/TitleHeader.vue';
import FooterComp from './components/utils/Footer.vue';
import Spinner from './components/utils/Spinner.vue';
import ErrorMessage from './components/utils/ErrorMessage.vue';
import Toast from './components/utils/Toast.vue';

export default defineComponent({
	name: 'App',
	components: {
		TitleHeader,
		FooterComp,
		Spinner,
		ErrorMessage,
		Toast
	}
});
</script>

<style lang="scss">
.impact {
	font-family: 'Impact';
	display: none;
}
.verdana {
	font-family: 'Verdana';
	display: none;
}
</style>
