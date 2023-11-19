import { Condition } from '@drpg/core/models/npc/NpcConditions';
import { Dinoz } from '../entity/index.js';
import { Operator } from '@drpg/core/models/enums/Parser';
import { conditionParser } from './parser.js';

export function checkCondition(condition: Condition | undefined, dinoz: Dinoz): boolean {
	if (!condition) return true;
	let conditionResult: boolean = true;

	if (condition[Operator.AND]) {
		for (const subCondition of condition[Operator.AND]) {
			conditionResult = conditionResult && checkCondition(subCondition, dinoz);
		}
	} else if (condition[Operator.OR]) {
		conditionResult = false;
		for (const subCondition of condition[Operator.OR]) {
			conditionResult = checkCondition(subCondition, dinoz) || conditionResult;
		}
	} else if (condition[Operator.NOT]) {
		conditionResult = !checkCondition(condition[Operator.NOT], dinoz);
	}

	if (condition[Operator.AND] || condition[Operator.OR] || condition[Operator.NOT]) {
		return conditionResult;
	}

	return conditionParser(condition, dinoz);
}
