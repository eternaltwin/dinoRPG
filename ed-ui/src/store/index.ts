import { createStore } from 'vuex';
import { StoreState, Dinoz } from '@/models';
import VuexPersistence from 'vuex-persist';

const state = {
	jwt: undefined,
	money: undefined,
	dinozList: [],
	dinozCount: undefined
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
	},
	setDinozCount: (state: StoreState, dinozCount: number) => {
		state.dinozCount = dinozCount;
	}
};

const getters = {
	getJwt: (state: StoreState) => state.jwt,
	getMoney: (state: StoreState) => state.money,
	getDinozList: (state: StoreState) => state.dinozList,
	getDinozCount: (state: StoreState) => state.dinozCount
};

const vuexLocal = new VuexPersistence<StoreState>({
	storage: window.sessionStorage
});

export default createStore({
	state: state,
	getters: getters,
	mutations: mutations,
	plugins: [vuexLocal.plugin]
});
