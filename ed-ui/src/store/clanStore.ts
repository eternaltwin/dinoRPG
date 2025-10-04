import { defineStore } from 'pinia';
import { StoreClan } from '@drpg/core/models/store/StoreClan';
import { ClanService } from '../services';
import { LocalesEnum } from '../i18n';

export const clanStore = defineStore('clanStore', {
	state: (): StoreClan => ({
		clan: undefined
	}),
	getters: {
		getClan: (state: StoreClan) => state.clan,
		getClanId: (state: StoreClan) => state.clan?.id ?? 0
	},
	actions: {
		async loadClan(clanId: number) {
			this.clan = await ClanService.getClan(clanId);
		},
		async updateLang(clanId: number, languages: LocalesEnum[]) {
			if (this.clan) {
				this.clan.langs.splice(0);
				this.clan.langs.push(...(await ClanService.updateClanLangs(clanId, languages)));
			}
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
