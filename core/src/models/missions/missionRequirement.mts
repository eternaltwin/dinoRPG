import { ConditionEnum } from '../enums/Parser.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';

export type missionRequirement =
	| {
			actionType: ConditionEnum.KILL;
			target: string;
			value: number;
	  }
	| {
			actionType: ConditionEnum.KILL_BOSS;
			target: MonsterFiche[];
	  }
	| {
			actionType: Exclude<ConditionEnum, ConditionEnum.KILL | ConditionEnum.KILL_BOSS>;
			target: string;
	  };
