<!-- eslint-disable-next-line -->
<template></template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'TitleHeader',
	props: {
		title: String
	},
	watch: {
		title: {
			immediate: true,
			handler: function () {
				return (document.title = this.title!);
			}
		}
	}
});
</script>
