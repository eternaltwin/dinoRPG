import { ConditionEnum, ConditionOperatorEnum } from '../enums/Parser.mjs';

// Choisis le type de value en fonction de l'enum utilisée pour conditionType
export type Condition =
	| {
			conditionType:
				| ConditionEnum.MINLEVEL
				| ConditionEnum.MAXLEVEL
				| ConditionEnum.FINISHED_MISSION
				| ConditionEnum.SKILL
				| ConditionEnum.POSSESS_OBJECT
				| ConditionEnum.STATUS;
			value: number;
			reverse?: boolean;
			nextCondition?: Condition;
			operator?: ConditionOperatorEnum;
	  }
	| {
			conditionType: ConditionEnum.RANDOM;
			value: number;
			nextCondition?: Condition;
			operator?: ConditionOperatorEnum;
	  }
	| {
			conditionType: ConditionEnum.SCENARIO;
			value: string;
			step: number;
			reverse?: boolean;
			nextCondition?: Condition;
			operator?: ConditionOperatorEnum;
	  }
	| {
			conditionType: Exclude<
				ConditionEnum,
				| ConditionEnum.MINLEVEL
				| ConditionEnum.MAXLEVEL
				| ConditionEnum.FINISHED_MISSION
				| ConditionEnum.POSSESS_OBJECT
				| ConditionEnum.RANDOM
				| ConditionEnum.SKILL
				| ConditionEnum.SCENARIO
				| ConditionEnum.STATUS
			>;
			value: string;
			reverse?: boolean;
			nextCondition?: Condition;
			operator?: ConditionOperatorEnum;
	  };
