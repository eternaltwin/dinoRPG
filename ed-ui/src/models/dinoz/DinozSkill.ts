import { ElementType, SkillType } from '../../enums';

export interface DinozSkill {
	skillId: number;
	type: SkillType;
	element: Array<ElementType>;
}
