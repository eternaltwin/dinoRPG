import { StoreStateSession } from '@drpg/core/models/store/StoreStateSession';
import { defineStore } from 'pinia';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { PlayerOptions } from '@drpg/core/models/player/PlayerOptions';

export const sessionStore = defineStore('sessionStore', {
	state: (): StoreStateSession => ({
		jwt: undefined,
		money: 0,
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
		getPlayerOptions: (state: StoreStateSession) => state.playerOptions,
		getDinoz: (state: StoreStateSession) => {
			return (dinozId: number) => state.dinozList!.find((dinoz: DinozFiche) => dinoz.id === dinozId);
		}
	},
	actions: {
		setJwt(jwt: string): void {
			this.jwt = jwt;
		},
		setMoney(money: number): void {
			this.money = money;
		},
		addMoney(quantity: number): void {
			this.money += quantity;
		},
		setDinozList(dinozList: Array<DinozFiche>): void {
			this.dinozList = dinozList;
		},
		setDinozCount(dinozCount: number): void {
			this.dinozCount = dinozCount;
		},
		setPlayerId(playerId: number): void {
			this.playerId = playerId;
		},
		setFightResult(fight: FightResult | undefined): void {
			this.fight = fight;
		},
		setTab(tab: number): void {
			this.tab = tab;
		},
		setPlayerOptions(playerOptions: PlayerOptions): void {
			this.playerOptions = playerOptions;
		},
		setDinoz(dinoz: DinozFiche): void {
			const dinozToUpdate = this.dinozList!.findIndex(dinozs => dinozs.id === dinoz.id);
			this.dinozList!.splice(dinozToUpdate, 1, dinoz);
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
