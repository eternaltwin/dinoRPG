import { Dinoz, FightResult, PlayerOptions, StoreStateSession } from '@/models';
import { defineStore } from 'pinia';

export const sessionStore = defineStore('sessionStore', {
	state: (): StoreStateSession => ({
		jwt: undefined,
		money: undefined,
		dinozList: [],
		dinozCount: undefined,
		playerId: undefined,
		fight: undefined,
		tab: 1,
		playerOptions: {
			hasPDA: false
		}
	}),
	getters: {
		getJwt: (state: StoreStateSession) => state.jwt,
		getMoney: (state: StoreStateSession) => state.money,
		getDinozList: (state: StoreStateSession) => state.dinozList,
		getDinozCount: (state: StoreStateSession) => state.dinozCount,
		getPlayerId: (state: StoreStateSession) => state.playerId,
		getFightResult: (state: StoreStateSession) => state.fight,
		getTab: (state: StoreStateSession) => state.tab,
		getPlayerOptions: (state: StoreStateSession) => state.playerOptions
	},
	actions: {
		setJwt(jwt: string): void {
			this.jwt = jwt;
		},
		setMoney(money: number): void {
			this.money = money;
		},
		setDinozList(dinozList: Array<Dinoz>): void {
			this.dinozList = dinozList;
		},
		setDinozCount(dinozCount: number): void {
			this.dinozCount = dinozCount;
		},
		setPlayerId(playerId: number): void {
			this.playerId = playerId;
		},
		setFightResult(fight: FightResult): void {
			this.fight = fight;
		},
		setTab(tab: number): void {
			this.tab = tab;
		},
		setPlayerOptions(playerOptions: PlayerOptions): void {
			this.playerOptions = playerOptions;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
