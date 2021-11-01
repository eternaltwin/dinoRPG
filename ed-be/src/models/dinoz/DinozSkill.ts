import {
	ElementType,
	Energy,
	SkillType,
	Skill,
	SkillTree
} from '../../models/index.js';

export interface DinozSkill extends Skill {
	type: SkillType;
	energy: Energy;
	element: Array<ElementType>;
	activable: boolean;
	state: boolean;
	tree: SkillTree;
}
