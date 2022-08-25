import { DinozSkillFiche } from './DinozSkillFiche.js';

export interface DinozSkillOwnAndUnlockable {
	learnableSkills: Array<Partial<DinozSkillFiche>>;
	unlockableSkills: Array<Partial<DinozSkillFiche>>;
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
