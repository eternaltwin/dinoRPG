import { ElementType, Energy, SkillType, SkillTree, SkillEffectType } from '../index.js';

export interface DinozSkillFiche {
	skillId: number;
	type: SkillType;
	energy: Energy;
	element: Array<ElementType>;
	activatable: boolean;
	state?: boolean;
	tree: SkillTree;
	unlockedFrom?: Array<number>;
	raceId?: Array<number>; // For specific race skill (ex : fly for Pteroz)
	isBaseSkill: boolean; // If true : dinoz knows this skill when he's bought
	isSphereSkill: boolean; // true : the skill can only be learned with a sphere object
	effects?: Array<SkillEffectType>;
}
