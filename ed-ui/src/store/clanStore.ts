import { defineStore } from 'pinia';
import { StoreClan } from '@drpg/core/models/store/StoreClan';
import { ClanService } from '../services';
import { LocalesEnum } from '../i18n';

export const clanStore = defineStore('clanStore', {
	state: (): StoreClan => ({
		clan: undefined,
		clanEvent: undefined
	}),
	getters: {
		getClan: (state: StoreClan) => state.clan,
		getClanId: (state: StoreClan) => state.clan?.id ?? 0,
		getOngoingEvent: (state: StoreClan) => {
			if (state.clanEvent && state.clanEvent.endDate > new Date()) {
				return state.clanEvent.id;
			}
		}
	},
	actions: {
		async loadClan(clanId: number) {
			this.clan = undefined;
			this.clan = await ClanService.getClan(clanId);
		},
		async updateLang(clanId: number, languages: LocalesEnum[]) {
			if (this.clan) {
				this.clan.langs.splice(0);
				this.clan.langs.push(...(await ClanService.updateClanLangs(clanId, languages)));
			}
		},
		updateBanner(bannerUrl: string): void {
			if (!this.clan) return;
			this.clan.bannerUrl = bannerUrl;
		},
		setClanEvent(clanEvent: { id: string; endDate: Date } | undefined): void {
			this.clanEvent = clanEvent;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
