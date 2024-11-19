<template>
	<div class="section" v-if="header">
		<div class="titlePage">
			<h3 v-html="header" />
		</div>
		<div
			class="subTitlePage"
			width="520"
			height="27"
			v-html="subHeader"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'TitleHeader',
	props: {
		title: String,
		header: String,
		subHeader: String
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
