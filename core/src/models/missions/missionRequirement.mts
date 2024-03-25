import { ConditionEnum } from '../enums/Parser.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';

export type missionRequirement =
	| {
			actionType: ConditionEnum.KILL;
			target: string[];
			value: number;
	  }
	| {
			actionType: ConditionEnum.KILL_BOSS;
			target: MonsterFiche[];
	  }
	| {
			actionType: ConditionEnum.TALKTO;
			target: string;
			action?: string;
	  }
	| {
			actionType: Exclude<ConditionEnum, ConditionEnum.KILL | ConditionEnum.KILL_BOSS | ConditionEnum.TALKTO>;
			target: string;
	  };
