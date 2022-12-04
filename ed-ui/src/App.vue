<template>
	<TitleHeader :title="$t('pageTitle.default')" />
	<RouterView />
	<Spinner />
	<Version />
	<Thanks />
	<ErrorMessage />
	<Toast />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import Version from '@/components/utils/Version.vue';
import TitleHeader from '@/components/utils/TitleHeader.vue';
import Thanks from '@/components/utils/Thanks.vue';

export default defineComponent({
	name: 'App',
	components: {
		TitleHeader,
		Version,
		Thanks,
		Spinner: defineAsyncComponent(() => import('@/components/utils/Spinner.vue')),
		ErrorMessage: defineAsyncComponent(() => import('@/components/utils/ErrorMessage.vue')),
		Toast: defineAsyncComponent(() => import('@/components/utils/Toast.vue'))
	}
});
</script>

<style lang="scss"></style>
