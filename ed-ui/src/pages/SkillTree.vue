<template>
	<TitleHeader :title="$t('pageTitle.skillTree')" :header="$t(`skillTree.title`)" />
	TODO
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';

export default defineComponent({
	name: 'ManageDinoz',
	components: {
		TitleHeader
	},
	data() {
		return {};
	},
	methods: {},
	async mounted() {}
});
</script>

<style lang="scss" scoped></style>
