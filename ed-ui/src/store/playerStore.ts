import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { Notification } from '@drpg/core/models/notifications/notification';
import { PlayerOptions } from '@drpg/core/models/player/PlayerOptions';
import { StorePlayer } from '@drpg/core/models/store/StorePlayer';
import { defineStore } from 'pinia';
import { PlayerService } from '../services';
import { AdminRoleFront } from '@drpg/core/models/enums/AdminRoleFront';
import { dinozStore, useDinozStore } from './dinozStore';
import { setCookie } from '../utils/cookies';
import { NotificationSeverity } from '@drpg/prisma/enums';

export const playerStore = defineStore('playerStore', {
	state: (): StorePlayer => ({
		money: 0,
		playerId: undefined,
		name: '',
		clanId: undefined,
		playerOptions: {
			hasPDA: false,
			hasPMI: false,
			hasPAC: false,
			skipFight: false,
			skipLevel: false
		},
		role: AdminRoleFront.PLAYER,
		priest: false,
		shopkeeper: false,
		sortOption: 'default',
		notificationCounter: 0,
		notifications: [],
		discoveredSkills: []
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
		getRole: (state: StorePlayer) => state.role,
		getNotificationsCounter: (state: StorePlayer) => state.notificationCounter,
		getNotifications: (state: StorePlayer) => state.notifications,
		getDiscoveredSkills: (state: StorePlayer) => state.discoveredSkills
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
		setRole(role: AdminRoleFront): void {
			this.role = role;
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
		setNotifications(notifs: Notification[]): void {
			this.notifications = notifs;
			this.notificationCounter = notifs.length;
		},
		addNotification(notif: Notification): void {
			this.notifications.push(notif);
			this.notificationCounter++;
			if (notif.severity === NotificationSeverity.clanApplyAccepted) {
				this.update();
			}
		},
		setDiscoveredSkills(skills: Skill[]): void {
			this.discoveredSkills = skills;
		},
		async update() {
			const commonData = await PlayerService.getLoggedInData();
			// Set cookies
			const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
			setCookie(`x-drpg-${channel}-user`, commonData.id, 7);
			setCookie(`x-drpg-${channel}-token`, commonData.connexionToken, 7);
			// Set data in sessionStore
			this.setMoney(commonData.money);
			this.setClanId(commonData.clanId);
			this.setPriest(commonData.priest);
			this.setShopkeeper(commonData.shopkeeper);
			this.setNotifications(commonData.notifications);
			this.setPlayerId(commonData.id);
			this.setPlayerName(commonData.name);
			this.setPlayerOptions(commonData.playerOptions);
			this.setRole(commonData.role as AdminRoleFront);
			this.setDiscoveredSkills(commonData.discoveredSkills);
			dinozStore().setDinozList(commonData.dinoz);
			useDinozStore().setDinozList(commonData.dinoz);
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
