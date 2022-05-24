import { ElementType, Energy, SkillType, SkillTree } from '../../models/index.js';

export interface DinozSkill {
	skillId: number;
	type: SkillType;
	energy: Energy;
	element: Array<ElementType>;
	activatable: boolean;
	state?: boolean;
	tree: SkillTree;
}
