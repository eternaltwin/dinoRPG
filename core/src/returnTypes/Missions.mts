import { Mission } from "../models/missions/mission.mjs";
import { MissionID } from "../models/missions/missionList.mjs";
import { npcList } from "../models/npc/NpcList.mjs";

export type MissionsPageData = {
	id: number;
	name: string;
	missions: {
		npc: typeof npcList[keyof typeof npcList]['name'];
		missions: {
			id: MissionID;
			name: string;
		}[];
	}[];
}[];
