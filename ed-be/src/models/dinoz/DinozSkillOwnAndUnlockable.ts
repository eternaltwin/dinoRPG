import { DinozSkill } from './DinozSkill.js';

export interface DinozSkillOwnAndUnlockable {
	learnableSkills: Array<Partial<DinozSkill>>;
	unlockableSkills: Array<Partial<DinozSkill>>;
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
