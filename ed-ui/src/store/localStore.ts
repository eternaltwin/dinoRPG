import { StoreStateLocal } from '@drpg/core/models/store/StoreStateLocal';
import { defineStore } from 'pinia';

export const localStore = defineStore('localStore', {
	state: (): StoreStateLocal => ({
		jwt: undefined,
		langue: undefined
	}),
	getters: {
		getJwt: (state: StoreStateLocal) => state.jwt,
		getLanguage: (state: StoreStateLocal) => state.langue
	},
	actions: {
		setJwt(jwt: string): void {
			this.jwt = jwt;
		},
		setLanguage(langue: string): void {
			this.langue = langue;
		}
	},
	persist: {
		storage: window.localStorage
	}
});
