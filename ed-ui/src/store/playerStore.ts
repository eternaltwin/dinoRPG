import { Notification } from '@drpg/core/models/notifications/notification';
import { PlayerOptions } from '@drpg/core/models/player/PlayerOptions';
import { StorePlayer } from '@drpg/core/models/store/StorePlayer';
import { defineStore } from 'pinia';

export const playerStore = defineStore('playerStore', {
	state: (): StorePlayer => ({
		money: 0,
		playerId: undefined,
		name: '',
		clanId: undefined,
		playerOptions: {
			hasPDA: false,
			hasPMI: false,
			skipFight: false,
			skipLevel: false
		},
		admin: false,
		priest: false,
		shopkeeper: false,
		sortOption: 'default',
		notificationCounter: 0,
		notifications: []
	}),
	getters: {
		getMoney: (state: StorePlayer) => state.money,
		getPlayerName: (state: StorePlayer) => state.name,
		getPlayerId: (state: StorePlayer) => state.playerId ?? 0,
		getPlayerOptions: (state: StorePlayer) => state.playerOptions,
		getClanId: (state: StorePlayer) => state.clanId,
		isPriest: (state: StorePlayer) => state.priest,
		isShopkeeper: (state: StorePlayer) => state.shopkeeper,
		getSortOption: (state: StorePlayer) => state.sortOption,
		isAdmin: (state: StorePlayer) => state.admin,
		getNotificationsCounter: (state: StorePlayer) => state.notificationCounter,
		getNotifications: (state: StorePlayer) => state.notifications
	},
	actions: {
		setMoney(money: number): void {
			this.money = money;
		},
		addMoney(quantity: number): void {
			this.money += quantity;
		},
		setPlayerId(playerId: string): void {
			this.playerId = playerId;
		},
		setPlayerName(playerName: string): void {
			this.name = playerName;
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
		setSortOption(sortOption: string): void {
			this.sortOption = sortOption;
		},
		setClanId(clanId: number | undefined): void {
			this.clanId = clanId;
		},
		setNotificationsCounter(notif: number): void {
			this.notificationCounter = notif;
		},
		setNotifications(notif: Notification[]): void {
			this.notifications = notif;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
