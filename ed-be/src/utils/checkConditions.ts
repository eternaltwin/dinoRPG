import { Condition } from '@drpg/core/models/npc/NpcConditions';
import { Dinoz } from '../entity/index.js';
import { ConditionOperatorEnum } from '@drpg/core/models/enums/Parser';
import { conditionParser } from './parser.js';

export function checkCondition(condition: Condition, dinoz: Dinoz): boolean {
	let conditionResult: boolean = true;

	if (condition.nextCondition && condition.operator === ConditionOperatorEnum.AND) {
		conditionResult = conditionResult && checkCondition(condition.nextCondition, dinoz);
	} else if (condition.nextCondition && condition.operator === ConditionOperatorEnum.OR) {
		conditionResult = conditionResult || checkCondition(condition.nextCondition, dinoz);
	}
	return conditionResult && conditionParser(condition, dinoz);
}
