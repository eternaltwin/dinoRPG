import { ConditionEnum } from '../enums/Parser.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';
import { MapZone } from '../enums/MapZone.mjs';

export type missionRequirement =
	| {
			actionType: ConditionEnum.KILL;
			target: string[];
			value: number;
			zone: MapZone;
	  }
	| {
			actionType: ConditionEnum.KILL_BOSS;
			target: MonsterFiche[];
	  }
	| {
			actionType: ConditionEnum.LAUNCH_FIGHT;
			target: MonsterFiche[];
			action?: string;
  	  }
	| {
			actionType: ConditionEnum.HOUR;
			value: number;
			target: string;
			action?: string;
  	  }
	| {
			actionType: ConditionEnum.TALKTO;
			target: string;
			action?: string;
	  }
	| {
			actionType: Exclude<ConditionEnum, ConditionEnum.KILL | ConditionEnum.KILL_BOSS | ConditionEnum.TALKTO | ConditionEnum.LAUNCH_FIGHT | ConditionEnum.HOUR>;
			target: string;
	  };
