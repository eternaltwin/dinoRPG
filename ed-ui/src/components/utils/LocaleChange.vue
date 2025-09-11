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
import { loadLanguage, Locales, LocalesEnum } from '../../i18n';
import { localStore, playerStore } from '../../store';
import { PlayerService } from '../../services';

export default defineComponent({
	name: 'LocaleChange',
	data() {
		return {
			localStore: localStore(),
			playerStore: playerStore(),
			langs: Locales
		};
	},
	methods: {
		async switchLocale(locale: LocalesEnum): Promise<void> {
			if (this.$i18n.locale !== locale) {
				try {
					// Mettre à jour la langue du joueur sur le backend
					if (this.playerStore.getPlayerId) {
						await PlayerService.updatePlayerLanguage(locale);
					}
					// Changer la langue localement
					loadLanguage(locale);
					this.localStore.setLanguage(locale);
				} catch (err) {
					console.error('Erreur lors de la mise à jour de la langue du joueur :', err);
				}
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
