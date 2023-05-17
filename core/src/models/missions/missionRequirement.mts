import { ConditionEnum } from '../enums/Parser.mjs';

export type missionRequirement =
	| {
			actionType: Exclude<ConditionEnum, ConditionEnum.KILL>;
			target: string;
	  }
	| {
			actionType: ConditionEnum.KILL;
			target: string;
			value: number;
	  };
