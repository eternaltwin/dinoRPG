<template>
	<TitleHeader :title="$t('pageTitle.default')" />
	<RouterView />
	<Spinner />
	<FooterComp />
	<ErrorMessage />
	<Toast />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import TitleHeader from '@/components/utils/TitleHeader.vue';
import FooterComp from '@/components/utils/Footer.vue';

export default defineComponent({
	name: 'App',
	components: {
		TitleHeader,
		FooterComp,
		Spinner: defineAsyncComponent(() => import('@/components/utils/Spinner.vue')),
		ErrorMessage: defineAsyncComponent(() => import('@/components/utils/ErrorMessage.vue')),
		Toast: defineAsyncComponent(() => import('@/components/utils/Toast.vue'))
	}
});
</script>

<style lang="scss"></style>
