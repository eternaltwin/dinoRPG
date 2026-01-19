import { EffectDescriptor } from '../models/dinoz/SkillDetails.mjs';
import { MathOperator } from '../models/enums/Parser.mjs';

export const isNotNullish = <T,>(value: T | null | undefined): value is T => value !== undefined && value !== null;

export function operatorProcess(processedValue: number, effect: EffectDescriptor) {
	switch (effect.operator) {
		case MathOperator.ADD:
			processedValue += effect.value;
			break;
		case MathOperator.EQUAL:
			processedValue = effect.value;
			break;
		case MathOperator.MULTIPLY:
			processedValue *= effect.value;
			break;
		default:
			break;
	}
	return processedValue;
}
