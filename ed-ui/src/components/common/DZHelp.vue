<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<Tippy tag="img" :src="getImgURL('icons', `help${getLanguage()}`)" theme="normal" class="help">
		<template #content>
			<h1 v-html="title" />
			<p v-html="content" />
		</template>
	</Tippy>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Tippy } from 'vue-tippy';

export default defineComponent({
	name: 'DZHelp',
	props: {
		title: {
			type: String,
			required: true
		},
		content: {
			type: String,
			required: true
		}
	},
	components: { Tippy },
	methods: {
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		}
	}
});
</script>

<style lang="scss" scoped>
.help {
	border: 1px solid #bc683c;
	cursor: help;
	margin-left: 5px;

	&:hover {
		outline: 1px solid white;
	}
}
</style>
