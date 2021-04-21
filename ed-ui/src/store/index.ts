import { createStore } from 'vuex';
import { StoreState, Dinoz } from '@/models';
import VuexPersistence from 'vuex-persist';

const state = {
	jwt: undefined,
	money: undefined,
	dinozList: []
} as StoreState;

const mutations = {
	setJwt: (state: StoreState, jwt: string) => {
		state.jwt = jwt;
	},
	setMoney: (state: StoreState, money: number) => {
		state.money = money;
	},
	setDinozList: (state: StoreState, dinozList: Array<Dinoz>) => {
		state.dinozList = dinozList;
	}
};

const getters = {
	getJwt: (state: StoreState) => state.jwt,
	getMoney: (state: StoreState) => state.money,
	getDinozList: (state: StoreState) => state.dinozList
};

const vuexLocal = new VuexPersistence<StoreState>({
	storage: window.localStorage
});

export default createStore({
	state: state,
	getters: getters,
	mutations: mutations,
	plugins: [vuexLocal.plugin]
});
