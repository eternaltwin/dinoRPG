import { Skill } from '../dinoz/SkillList.mjs';
import { Notification } from '../notifications/notification.mjs';
import { PlayerOptions } from '../player/PlayerOptions.mjs';

export interface StorePlayer {
	money: number;
	playerId?: string;
	name: string;
	playerOptions: PlayerOptions;
	clanId: number | undefined;
	admin: boolean;
	priest: boolean;
	shopkeeper: boolean;
	sortOption: string;
	notificationCounter: number;
	notifications: Notification[];
	discoveredSkills: Skill[];
}
