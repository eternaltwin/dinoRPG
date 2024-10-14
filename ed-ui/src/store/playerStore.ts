import { defineStore, Store } from 'pinia';
import { PlayerOptions } from '@drpg/core/models/player/PlayerOptions';
import { StorePlayer } from '@drpg/core/models/store/StorePlayer';

export const playerStore = defineStore('playerStore', {
	state: (): StorePlayer => ({
		money: 0,
		playerId: undefined,
		playerName: '',
		clanId: undefined,
		playerOptions: {
			hasPDA: false,
			hasPMI: false,
			currentDinozId: undefined
		},
		admin: false,
		priest: false,
		shopkeeper: false,
	}),
	getters: {
		getMoney: (state: StorePlayer) => state.money,
		getPlayerId: (state: StorePlayer) => state.playerId ?? 0,
		getPlayerOptions: (state: StorePlayer) => state.playerOptions,
		getClanId: (state: StorePlayer) => state.clanId,
		isPriest: (state: StorePlayer) => state.priest,
		isShopkeeper: (state: StorePlayer) => state.shopkeeper
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
		setPlayerName(playerName: string): void {
			this.playerName = playerName;
		},
		setPlayerOptions(playerOptions: PlayerOptions): void {
			this.playerOptions = playerOptions;
		},
		setAdmin(admin: boolean): void {
			this.admin = admin;
		},
		setPriest(priest: boolean): void {
			this.priest = priest;
		},
		setShopkeeper(shopkeeper: boolean): void {
			this.shopkeeper = shopkeeper;
		},
		setClanId(clanId: number | undefined): void {
			this.clanId = clanId;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
