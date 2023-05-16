import { Condition } from "../npc/NpcConditions.mjs";
import { Rewarder } from "../reward/Rewarder.mjs";
import { MissionSteps } from "./missionSteps.mjs";

export class Mission {
	missionId: number;
	missionName: string;
	condition?: Condition;
	rewards: Array<Rewarder>;
	steps: Array<MissionSteps>;
}
