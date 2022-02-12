import { StoreStateLocal } from '@/models';
import VuexPersistence from 'vuex-persist';
import { createStore } from 'vuex';

const stateLocal = {
	langue: undefined
} as StoreStateLocal;

const mutationsLocal = {
	setLanguage: (state: StoreStateLocal, langue: string) => {
		state.langue = langue;
	}
};

const gettersLocal = {
	getLanguage: (state: StoreStateLocal) => state.langue
};

const vuexLocal = new VuexPersistence<StoreStateLocal>({
	storage: window.localStorage
});

export const localStore = createStore({
	state: stateLocal,
	getters: gettersLocal,
	mutations: mutationsLocal,
	plugins: [vuexLocal.plugin]
});
