import { MissionID } from '../models/missions/missionList.mjs';
import { NpcName } from '../models/npc/npc.mjs';

export type MissionsPageData = {
	id: number;
	name: string;
	display: string;
	missions: {
		npc: NpcName;
		missions: {
			id: MissionID;
			name: string;
		}[];
	}[];
}[];

export type ManagePageData = {
	id: number;
	name: string;
	level: number;
	status: {
		statusId: number;
	}[];
	life: number;
	maxLife: number;
	experience: number;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	order: number;
	display: string;
}[];

export type LearnSkillData = {
	newMaxExperience: number;
	discoveredSkill: number;
};
