import {
	ElementType,
	Energy,
	SkillType,
	SkillTree
} from '../../models/index.js';

export interface DinozSkill {
	skillId: number;
	name: string;
	type: SkillType;
	energy: Energy;
	element: Array<ElementType>;
	activable: boolean;
	state: boolean;
	tree: SkillTree;
}
