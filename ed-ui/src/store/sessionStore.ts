import { StoreStateSession } from '@drpg/core/models/store/StoreStateSession';
import { defineStore } from 'pinia';
import { FightResult } from '@drpg/core/models/fight/FightResult';

export const sessionStore = defineStore('sessionStore', {
	state: (): StoreStateSession => ({
		fight: undefined,
		tab: 1
	}),
	getters: {
		getFightResult: (state: StoreStateSession) => state.fight,
		getTab: (state: StoreStateSession) => state.tab
	},
	actions: {
		setFightResult(fight: FightResult | undefined): void {
			this.fight = fight;
		},
		setTab(tab: number): void {
			this.tab = tab;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
