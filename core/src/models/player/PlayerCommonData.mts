import { DinozFiche } from '../dinoz/DinozFiche.mjs';
import { PlayerOptions } from './PlayerOptions.mjs';
import { Notification } from '../notifications/notification.mjs';
import { Skill } from '../dinoz/SkillList.mjs';
import { AdminRole } from '@drpg/prisma';

export interface PlayerCommonData {
	money: number;
	dinoz: DinozFiche[];
	id: string;
	connexionToken: string;
	name: string;
	clanId: number | undefined;
	clanEvent?: { id: string; endDate: Date };
	playerOptions: PlayerOptions;
	role: AdminRole;
	priest: boolean;
	shopkeeper: boolean;
	notifications: Notification[];
	discoveredSkills: Skill[];
}

export interface PlayerLoginData {
	id: string;
	connexionToken: string;
}
