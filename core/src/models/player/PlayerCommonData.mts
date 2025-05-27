import { DinozFiche } from '../dinoz/DinozFiche.mjs';
import { PlayerOptions } from './PlayerOptions.mjs';
import { Notification } from '../notifications/notification.mjs';
import { Skill } from '../dinoz/SkillList.mjs';

export interface PlayerCommonData {
	money: number;
	dinoz: DinozFiche[];
	dinozCount: number;
	id: string;
	connexionToken: string;
	name: string;
	clanId: number | undefined;
	playerOptions: PlayerOptions;
	admin: boolean;
	priest: boolean;
	shopkeeper: boolean;
	notifications: Notification[];
	discoveredSkills: Skill[];
}
