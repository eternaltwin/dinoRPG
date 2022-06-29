import { DinozSkill } from '@/models';

export interface DinozSkillOwnAndUnlockable {
	learnableSkills: Array<DinozSkill>;
	unlockableSkills: Array<DinozSkill>;
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
