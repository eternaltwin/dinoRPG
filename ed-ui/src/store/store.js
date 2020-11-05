import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
	dinozList: []
};

const mutations = {
	SET_DINOZ_LIST: (state, dinozList) => {
		state.dinozList = dinozList;
	},
	SET_DINOZ_NAME: (state, dinoz) => {
		var dinozFound = state.dinozList.find(elem => elem.dinozId === dinoz.dinozId);
		dinozFound.name = dinoz.name;
	},
	ADD_DINOZ: (state, dinoz) => {
		state.dinozList.push(dinoz);
	}
};

const getters = {
	getDinozList: (state) => state.dinozList
};

const actions = {
	setDinozList: (store, dinozList) => {
		store.commit('SET_DINOZ_LIST', dinozList);
	},
	setDinozName: (store, dinoz) => {
		store.commit('SET_DINOZ_NAME', dinoz);
	},
	addDinoz: (store, dinoz) => {
		store.commit('ADD_DINOZ', dinoz);
	}
};

export default new Vuex.Store({
	state: state,
	getters: getters,
	mutations: mutations,
	actions: actions,
	strict: true
});
