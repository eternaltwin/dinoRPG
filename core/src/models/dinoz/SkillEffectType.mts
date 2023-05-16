import { SkillEffect } from "../enums/SkillEffect.mjs";
import { ElementType } from "../enums/ElementType.mjs";

export class SkillEffectType {
	type: SkillEffect;
	value: number;
	element?: ElementType;
}
