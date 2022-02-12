import { Dinoz, FightResult, StoreStateSession } from '@/models';
import VuexPersistence from 'vuex-persist';
import { createStore } from 'vuex';

const stateSession = {
	jwt: undefined,
	money: undefined,
	dinozList: [],
	dinozCount: undefined,
	playerId: undefined,
	fight: undefined
} as StoreStateSession;

const mutationsSession = {
	setJwt: (state: StoreStateSession, jwt: string) => {
		state.jwt = jwt;
	},
	setMoney: (state: StoreStateSession, money: number) => {
		state.money = money;
	},
	setDinozList: (state: StoreStateSession, dinozList: Array<Dinoz>) => {
		state.dinozList = dinozList;
	},
	setDinozCount: (state: StoreStateSession, dinozCount: number) => {
		state.dinozCount = dinozCount;
	},
	setPlayerId: (state: StoreStateSession, playerId: number) => {
		state.playerId = playerId;
	},
	setFightResult: (state: StoreStateSession, fight: FightResult) => {
		state.fight = fight;
	}
};

const gettersSession = {
	getJwt: (state: StoreStateSession) => state.jwt,
	getMoney: (state: StoreStateSession) => state.money,
	getDinozList: (state: StoreStateSession) => state.dinozList,
	getDinozCount: (state: StoreStateSession) => state.dinozCount,
	getPlayerId: (state: StoreStateSession) => state.playerId,
	getFightResult: (state: StoreStateSession) => state.fight
};

const vuexSession = new VuexPersistence<StoreStateSession>({
	storage: window.sessionStorage
});

export const sessionStore = createStore({
	state: stateSession,
	getters: gettersSession,
	mutations: mutationsSession,
	plugins: [vuexSession.plugin]
});
