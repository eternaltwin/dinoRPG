import { ElementType, SkillEffect } from '../enums/index.js';

export interface SkillEffectType {
	type: SkillEffect;
	value: number;
	element?: ElementType;
}
