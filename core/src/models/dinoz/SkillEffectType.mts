import { Stat } from '../enums/SkillStat.mjs';
import { ElementType } from '../enums/ElementType.mjs';

export interface SkillEffectType {
	type: Stat;
	value: number;
	element?: ElementType;
}
