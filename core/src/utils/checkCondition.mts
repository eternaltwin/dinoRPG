import { DinozForConditionCheck } from '../constants.mjs';
import { Operator } from '../models/enums/Parser.mjs';
import { Condition } from '../models/npc/NpcConditions.mjs';
import { conditionParser } from './parser.mjs';

export function checkCondition(
	condition: Condition | undefined,
	dinozList: DinozForConditionCheck[],
	secret?: { key: string; value: string }
): boolean {
	if (!condition) return true;
	let conditionResult = true;

	if (condition[Operator.AND]) {
		for (const subCondition of condition[Operator.AND]) {
			conditionResult = conditionResult && checkCondition(subCondition, dinozList, secret);
		}
	} else if (condition[Operator.OR]) {
		conditionResult = false;
		for (const subCondition of condition[Operator.OR]) {
			conditionResult = checkCondition(subCondition, dinozList, secret) || conditionResult;
		}
	} else if (condition[Operator.NOT]) {
		conditionResult = !checkCondition(condition[Operator.NOT], dinozList, secret);
	}

	if (condition[Operator.AND] || condition[Operator.OR] || condition[Operator.NOT]) {
		return conditionResult;
	}

	return conditionParser(condition, dinozList, secret);
}
