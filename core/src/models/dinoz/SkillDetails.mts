import { ElementType } from '../enums/ElementType.mjs';
import { Energy } from '../enums/Energy.mjs';
import { Stat } from '../enums/SkillStat.mjs';
import { SkillTree } from '../enums/SkillTree.mjs';
import { SkillType } from '../enums/SkillType.mjs';
import { Skill } from './SkillList.mjs';
import { SkillVisualEffect } from '../enums/SkillVisualEffect.mjs';

type OtherAssaults<T> = Exclude<
	Stat.FIRE_ASSAULT | Stat.WATER_ASSAULT | Stat.AIR_ASSAULT | Stat.LIGHTNING_ASSAULT | Stat.WOOD_ASSAULT,
	T
>;

export type SkillEffects = {
	[Stat.MAX_HP]?: number;
	[Stat.HP_REGEN]?: number | ['x', number];
	[Stat.COUNTER]?: ['x', number];
	[Stat.INITIATIVE]?: number;
	[Stat.ARMOR]?: number;
	[Stat.EVASION]?: ['x', number];
	[Stat.MULTIHIT]?: ['x', number];
	[Stat.MAX_FOLLOWERS]?: number;
	[Stat.ENERGY]?: ['x', number];
	[Stat.ENERGY_RECOVERY]?: number;
	[Stat.FIRE_ASSAULT]?: number | OtherAssaults<Stat.FIRE_ASSAULT>;
	[Stat.WATER_ASSAULT]?: number | OtherAssaults<Stat.WATER_ASSAULT>;
	[Stat.AIR_ASSAULT]?: number | OtherAssaults<Stat.AIR_ASSAULT>;
	[Stat.LIGHTNING_ASSAULT]?: number | OtherAssaults<Stat.LIGHTNING_ASSAULT>;
	[Stat.WOOD_ASSAULT]?: number | OtherAssaults<Stat.WOOD_ASSAULT>;
	[Stat.SPEED]?: number;
	[Stat.FIRE_SPEED]?: number;
	[Stat.WATER_SPEED]?: number;
	[Stat.AIR_SPEED]?: number;
	[Stat.LIGHTNING_SPEED]?: number;
	[Stat.WOOD_SPEED]?: number;
	[Stat.FIRE_DEFENSE]?: number;
	[Stat.WATER_DEFENSE]?: number;
	[Stat.AIR_DEFENSE]?: number;
	[Stat.LIGHTNING_DEFENSE]?: number;
	[Stat.WOOD_DEFENSE]?: number;
	[Stat.FIRE_ELEMENT]?: number;
	[Stat.WATER_ELEMENT]?: number;
	[Stat.AIR_ELEMENT]?: number;
	[Stat.LIGHTNING_ELEMENT]?: number;
	[Stat.WOOD_ELEMENT]?: number;
};

export interface SkillDetails {
	id: Skill;
	name: string;
	type: SkillType;
	energy: Energy;
	element: ElementType[];
	activatable: boolean;
	state?: boolean;
	tree?: SkillTree;
	unlockedFrom?: Skill[];
	raceId?: number[]; // For specific race skill (ex : fly for Pteroz)
	isBaseSkill: boolean; // If true : dinoz knows this skill when he's bought
	isSphereSkill: boolean; // true : the skill can only be learned with a sphere object
	effects?: SkillEffects;
	globalEffects?: SkillEffects;
	priority?: number;
	probability?: number;
	visualEffect?: number;
	color?: string;
	auraType?: number;
	fx?: string;
}
