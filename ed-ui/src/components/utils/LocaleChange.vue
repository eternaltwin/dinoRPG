<template>
	<img
		v-for="(lang, i) in langs"
		:key="`Lang${i}`"
		:src="getImgURL('design', `lang_${lang.short}`)"
		@click="switchLocale(lang.short)"
		:class="[$i18n.locale === lang.short ? 'selected' : '']"
		class="flag"
	/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Locales, LocalesEnum, loadLanguage } from '../../i18n/index.js';
import { localStore } from '../../store/index.js';

export default defineComponent({
	name: 'LocaleChange',
	data() {
		return {
			localStore: localStore(),
			langs: Locales
		};
	},
	methods: {
		switchLocale(locale: LocalesEnum): void {
			if (this.$i18n.locale !== locale) {
				loadLanguage(locale);
				this.localStore.setLanguage(locale);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.flag {
	cursor: pointer;
	width: 15px;
	box-shadow: none;
	border: 1px solid rgb(108, 113, 136);

	&:not(.selected):hover {
		box-shadow: rgb(189, 61, 0) 0px 0px 8px;
	}
}
.selected {
	box-shadow: rgb(189, 61, 0) 0px 0px 8px;
}
</style>
