import { ElementType } from '../enums/ElementType.mjs';
import { SkillType } from '../enums/SkillType.mjs';

export interface DinozSkillOwnAndUnlockable {
	learnableSkills: { skillId: number, type: SkillType, element: ElementType[] }[];
	unlockableSkills: { skillId: number, element: ElementType[] }[];
	element: number;
	canRelaunch: boolean;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	upChance: {
		fire: number;
		wood: number;
		water: number;
		lightning: number;
		air: number;
	};
}
