import { ElementType } from '../enums/ElementType.mjs';
import { Energy } from '../enums/Energy.mjs';
import { Stat } from '../enums/SkillStat.mjs';
import { SkillTreeType } from '../enums/SkillTreeType.mjs';
import { SkillType } from '../enums/SkillType.mjs';
import { Skill } from './SkillList.mjs';
import { SkillVisualEffect } from '../enums/SkillVisualEffect.mjs';
import { AuraFxType, SkillFxType, GotoEffect, LifeEffect, DamagesEffect } from '../fight/transpiler.mjs';

type OtherAssaults<T> = Exclude<
	Stat.FIRE_ASSAULT | Stat.WATER_ASSAULT | Stat.AIR_ASSAULT | Stat.LIGHTNING_ASSAULT | Stat.WOOD_ASSAULT,
	T
>;

export type SkillEffects = {
	[Stat.MAX_HP]?: number;
	[Stat.HP_REGEN]?: number | ['x', number];
	[Stat.COUNTER]?: ['x', number];
	[Stat.INITIATIVE]?: number;
	[Stat.ARMOR]?: ['x', number];
	[Stat.IGNORE_ARMOR]?: number;
	[Stat.FIRE_IGNORE_ARMOR]?: number;
	[Stat.WOOD_IGNORE_ARMOR]?: number;
	[Stat.WATER_IGNORE_ARMOR]?: number;
	[Stat.LIGHTNING_IGNORE_ARMOR]?: number;
	[Stat.AIR_IGNORE_ARMOR]?: number;
	[Stat.EVASION]?: ['x', number];
	[Stat.SUPER_EVASION]?: ['x', number];
	[Stat.MULTIHIT]?: ['x', number];
	[Stat.MAX_FOLLOWERS]?: number;
	[Stat.ENERGY]?: ['x', number];
	[Stat.ENERGY_RECOVERY]?: ['x', number];
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
	tree?: SkillTreeType;
	unlockedFrom?: Skill[];
	raceId?: number[]; // For specific race skill (ex : fly for Pteroz)
	isBaseSkill: boolean; // If true : dinoz knows this skill when bought
	isSphereSkill: boolean; // true : the skill can only be learned with a sphere object
	effects?: SkillEffects;
	globalEffects?: SkillEffects;
	priority?: number;
	probability?: number;
	visualEffect?: SkillVisualEffect; // Effect for Skill "activate" steps
	color?: string; // Color for skill "activate" step
	visualEffectBis?: SkillVisualEffect; // Second effect for Skill "activate" steps
	colorBis?: string; // Color for 2nd skill "activate" step
	lifeEffect?: {
		// Effect for Skill with assault effect
		fx: LifeEffect;
		amount?: number;
		size?: number;
	};
	gotoEffect?: GotoEffect; // Effect for Skill "go to" steps
	shadeColor?: {
		col1?: number;
		col2?: number;
	};
	damageEffect?: DamagesEffect;
	fxType?: AuraFxType | SkillFxType | number; // Used for Aura, Skill, Healing or Snow effects
	fx?: string;
}
