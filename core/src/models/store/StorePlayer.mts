import { Skill } from '../dinoz/SkillList.mjs';
import { Notification } from '../notifications/notification.mjs';
import { PlayerOptions } from '../player/PlayerOptions.mjs';
import { AdminRoleFront } from '../enums/AdminRoleFront.mjs';

export interface StorePlayer {
	money: number;
	playerId?: string;
	name: string;
	playerOptions: PlayerOptions;
	clanId: number | undefined;
	role: AdminRoleFront;
	priest: boolean;
	shopkeeper: boolean;
	notificationCounter: number;
	notifications: Notification[];
	discoveredSkills: Skill[];
}
