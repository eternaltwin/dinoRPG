<template>
	<ol>
		<img
			v-for="(lang, i) in langs"
			:key="`Lang${i}`"
			:value="lang.caption"
			@click="switchLocale(i)"
			:src="lang.icon"
			:class="$i18n.locale === lang.short ? 'selected' : ''"
		/>
	</ol>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Locales } from '@/i18n';
import { localStore } from '@/store';

export default defineComponent({
	name: 'LocaleChange',
	data() {
		return {
			localStore: localStore(),
			langs: Locales
		};
	},
	methods: {
		switchLocale(locale: string) {
			if (this.$i18n.locale !== locale) {
				this.$i18n.locale = locale;
				this.localStore.setLanguage(locale);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
ol {
	display: flex;
	padding: 0;
	padding-right: 10px;
	padding-bottom: 5px;
}
img {
	width: auto;
	height: auto;
	margin: 0.6em auto 0.1em;
	padding: 2px;
}
.selected {
	background-color: #9a4029;
}
</style>
