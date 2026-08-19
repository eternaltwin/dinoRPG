import { Skill } from '../dinoz/SkillList.mjs';
import { Notification } from '../notifications/notification.mjs';
import { PlayerOptions } from '../player/PlayerOptions.mjs';
import { AdminRole } from '@drpg/prisma/enums';

export interface StorePlayer {
	money: number;
	playerId?: string;
	name: string;
	playerOptions: PlayerOptions;
	clanId: number | undefined;
	role: AdminRole;
	priest: boolean;
	shopkeeper: boolean;
	sortOption: string;
	notificationCounter: number;
	notifications: Notification[];
	discoveredSkills: Skill[];
	tosAccepted: boolean;
}
