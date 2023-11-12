import { defineStore } from 'pinia';
import { PlayerOptions } from '@drpg/core/models/player/PlayerOptions';
import { StorePlayer } from '@drpg/core/models/store/StorePlayer';

export const playerStore = defineStore('playerStore', {
	state: (): StorePlayer => ({
		money: 0,
		playerId: undefined,
		playerOptions: {
			hasPDA: false
		}
	}),
	getters: {
		getMoney: (state: StorePlayer) => state.money,
		getPlayerId: (state: StorePlayer) => state.playerId,
		getPlayerOptions: (state: StorePlayer) => state.playerOptions
	},
	actions: {
		setMoney(money: number): void {
			this.money = money;
		},
		addMoney(quantity: number): void {
			this.money += quantity;
		},
		setPlayerId(playerId: number): void {
			this.playerId = playerId;
		},
		setPlayerOptions(playerOptions: PlayerOptions): void {
			this.playerOptions = playerOptions;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
