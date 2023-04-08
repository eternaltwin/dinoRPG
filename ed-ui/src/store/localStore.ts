import { StoreStateLocal } from '@drpg/core/dist/models/store/StoreStateLocal.mjs';
import { defineStore } from 'pinia';

export const localStore = defineStore('localStore', {
	state: (): StoreStateLocal => ({
		langue: undefined
	}),
	getters: {
		getLanguage: (state: StoreStateLocal) => state.langue
	},
	actions: {
		setLanguage(langue: string): void {
			this.langue = langue;
		}
	},
	persist: {
		storage: window.localStorage
	}
});
