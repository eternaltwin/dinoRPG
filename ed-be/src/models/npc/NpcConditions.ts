import { ConditionEnum, ConditionOperatorEnum } from '../enums/index.js';

// Choisis le type de value en fonction de l'enum utilisée pour conditionType
export type Condition =
	| {
			conditionType: ConditionEnum.MINLEVEL | ConditionEnum.MAXLEVEL | ConditionEnum.SKILL;
			value: number;
			reverse?: boolean;
			nextCondition?: Condition;
			operator?: ConditionOperatorEnum;
	  }
	| {
			conditionType: Exclude<ConditionEnum, ConditionEnum.MINLEVEL | ConditionEnum.MAXLEVEL | ConditionEnum.SKILL>;
			value: string;
			reverse?: boolean;
			nextCondition?: Condition;
			operator?: ConditionOperatorEnum;
	  };
