import { SkillEffect } from '../enums/SkillEffect.mjs';
import { ElementType } from '../enums/ElementType.mjs';

export interface SkillEffectType {
	type: SkillEffect;
	value: number;
	element?: ElementType;
}
