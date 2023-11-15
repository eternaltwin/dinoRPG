import { ElementType } from '../enums/ElementType.mjs';
import { SkillType } from '../enums/SkillType.mjs';
import { DinozSkillFiche } from './DinozSkillFiche.mjs';

export interface DinozSkillOwnAndUnlockable {
	learnableSkills: Array<{ skillId: number, type: SkillType, element: ElementType[] }>;
	unlockableSkills: Array<{ skillId: number, element: ElementType[] }>;
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
