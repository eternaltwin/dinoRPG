import { SkillType } from '../enums/SkillType.mjs';
import { Energy } from '../enums/Energy.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { SkillTree } from '../enums/SkillTree.mjs';
import { SkillEffectType } from './SkillEffectType.mjs';
import { Stat } from '../enums/SkillStat.mjs';

export type SkillEffects = {
	[Stat.MAX_HP]?: number;
	[Stat.FIRE_ASSAULT]?: number;
	[Stat.WATER_ASSAULT]?: number;
	[Stat.AIR_ASSAULT]?: number;
	[Stat.LIGHTNING_ASSAULT]?: number;
	[Stat.WOOD_ASSAULT]?: number;
};

export interface DinozSkillFiche {
	id: number;
	name: string;
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
	effects?: SkillEffects;
}
