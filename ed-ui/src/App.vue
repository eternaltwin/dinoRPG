<template>
	<link rel="icon" href="public/favicon.ico" />
	<Title :title="$t('pageTitle.default')" />
	<RouterView />
	<Spinner />
	<Version />
	<ErrorMessage />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import Version from '@/components/utils/Version.vue';
import Title from '@/components/utils/Title.vue';

export default defineComponent({
	name: 'App',
	components: {
		Title,
		Version,
		Spinner: defineAsyncComponent(() =>
			import('@/components/utils/Spinner.vue')
		),
		ErrorMessage: defineAsyncComponent(() =>
			import('@/components/utils/ErrorMessage.vue')
		)
	}
});
</script>

<style lang="scss"></style>
