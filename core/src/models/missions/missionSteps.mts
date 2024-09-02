import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { missionRequirement } from './missionRequirement.mjs';
import { ServiceEnum } from '../enums/ServiceEnum.mjs';
import { FightResult } from '../fight/FightResult.mjs';

export interface MissionStep {
	stepId: number;
	place: PlaceEnum;
	hidePlace?: boolean;
	displayedAction: string;
	displayedText?: string;
	displayedHUD?: string; //Used to overwrite
	requirement: missionRequirement;
	progress?: number;
	service?: ServiceEnum[];
	fight?: FightResult;
}
