<template>
	<ol>
		<a
			v-for="(lang, i) in langs"
			:key="`Lang${i}`"
			@click="switchLocale(i)"
			:class="[$i18n.locale === lang.short ? 'selected' : '', lang.short]"
			class="flag"
		></a>
	</ol>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Locales } from '../../i18n';
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
		switchLocale(locale: string): void {
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
.flag {
	width: 12px;
	height: 7px;
	margin: 0.6em auto 0.1em;
	padding: 2px;
}
.fr {
	background-image: url('/src/assets/design/lang_fr.webp');
}
.en {
	background-image: url('/src/assets/design/lang_en.webp');
}
.de {
	background-image: url('/src/assets/design/lang_de.webp');
}
.es {
	background-image: url('/src/assets/design/lang_es.webp');
}
.selected {
	outline: #9a4029 solid 3px;
}
</style>
