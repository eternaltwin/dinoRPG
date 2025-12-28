import { ElementType } from '../enums/ElementType.mjs';
import { Energy } from '../enums/Energy.mjs';
import { Stat } from '../enums/SkillStat.mjs';
import { SkillTreeType } from '../enums/SkillTreeType.mjs';
import { SkillType } from '../enums/SkillType.mjs';
import { Skill } from './SkillList.mjs';
import { SkillVisualEffect } from '../enums/SkillVisualEffect.mjs';
import { AuraFxType, SkillFxType, GotoEffect, LifeEffect, DamagesEffect } from '../fight/transpiler.mjs';
import { RaceEnum } from '../enums/RaceEnum.mjs';
import { SkillFightCondition } from './SkillFightCondition.mjs';

type OtherAssaults<T> = Exclude<
	Stat.FIRE_ASSAULT | Stat.WATER_ASSAULT | Stat.AIR_ASSAULT | Stat.LIGHTNING_ASSAULT | Stat.WOOD_ASSAULT,
	T
>;

export type PassiveEffects = {
	[Stat.MAX_HP]?: number;
	[Stat.HP_REGEN]?: number | ['x', number];
	[Stat.MAX_FOLLOWERS]?: number;
	[Stat.INITIATIVE]?: number;
	[Stat.ENERGY]?: ['x', number];
	[Stat.ENERGY_RECOVERY]?: ['x', number];
	// Elements
	[Stat.FIRE_ELEMENT]?: number;
	[Stat.WOOD_ELEMENT]?: number;
	[Stat.WATER_ELEMENT]?: number;
	[Stat.LIGHTNING_ELEMENT]?: number;
	[Stat.AIR_ELEMENT]?: number;
	// Speeds
	[Stat.SPEED]?: ['x', number];
	[Stat.FIRE_SPEED]?: ['x', number];
	[Stat.WOOD_SPEED]?: ['x', number];
	[Stat.WATER_SPEED]?: ['x', number];
	[Stat.LIGHTNING_SPEED]?: ['x', number];
	[Stat.AIR_SPEED]?: ['x', number];
	// [Stat.VOID_SPEED]?: ['x', number];
	// Defenses
	[Stat.FIRE_DEFENSE]?: number;
	[Stat.WOOD_DEFENSE]?: number;
	[Stat.WATER_DEFENSE]?: number;
	[Stat.LIGHTNING_DEFENSE]?: number;
	[Stat.AIR_DEFENSE]?: number;
	// Assaults
	[Stat.FIRE_ASSAULT]?: number | OtherAssaults<Stat.FIRE_ASSAULT>;
	[Stat.WOOD_ASSAULT]?: number | OtherAssaults<Stat.WOOD_ASSAULT>;
	[Stat.WATER_ASSAULT]?: number | OtherAssaults<Stat.WATER_ASSAULT>;
	[Stat.LIGHTNING_ASSAULT]?: number | OtherAssaults<Stat.LIGHTNING_ASSAULT>;
	[Stat.AIR_ASSAULT]?: number | OtherAssaults<Stat.AIR_ASSAULT>;
	// Armors
	[Stat.ARMOR]?: ['x', number];
	// [Stat.FIRE_ARMOR]?: ['x', number];
	// [Stat.WOOD_ARMOR]?: ['x', number];
	// [Stat.WATER_ARMOR]?: ['x', number];
	// [Stat.LIGHTNING_ARMOR]?: ['x', number];
	// [Stat.AIR_ARMOR]?: ['x', number];
	// [Stat.VOID_ARMOR]?: ['x', number];
	// Counters
	[Stat.COUNTER]?: ['x', number];
	// [Stat.FIRE_COUNTER]?: ['x', number];
	// [Stat.WOOD_COUNTER]?: ['x', number];
	// [Stat.WATER_COUNTER]?: ['x', number];
	// [Stat.LIGHTNING_COUNTER]?: ['x', number];
	// [Stat.AIR_COUNTER]?: ['x', number];
	// [Stat.VOID_COUNTER]?: ['x', number];
	// Armor ignores
	[Stat.ARMOR_BREAK]?: ['x', number];
	// [Stat.ASSAULT_IGNORE_ARMOR]?: ['x', number];
	// [Stat.FIRE_IGNORE_ARMOR]?: ['x', number];
	// [Stat.WATER_IGNORE_ARMOR]?: ['x', number];
	// [Stat.WOOD_IGNORE_ARMOR]?: ['x', number];
	// [Stat.LIGHTNING_IGNORE_ARMOR]?: ['x', number];
	// [Stat.AIR_IGNORE_ARMOR]?: ['x', number];
	// [Stat.VOID_IGNORE_ARMOR]?: ['x', number];
	// Evasions
	[Stat.EVASION]?: ['x', number];
	// [Stat.FIRE_EVASION]?: ['x', number];
	// [Stat.WOOD_EVASION]?: ['x', number];
	// [Stat.WATER_EVASION]?: ['x', number];
	// [Stat.LIGHTNING_EVASION]?: ['x', number];
	// [Stat.AIR_EVASION]?: ['x', number];
	// [Stat.VOID_EVASION]?: ['x', number];
	// Super evasions
	[Stat.SUPER_EVASION]?: ['x', number];
	// [Stat.FIRE_SUPER_EVASION]?: ['x', number];
	// [Stat.WOOD_SUPER_EVASION]?: ['x', number];
	// [Stat.WATER_SUPER_EVASION]?: ['x', number];
	// [Stat.LIGHTNING_SUPER_EVASION]?: ['x', number];
	// [Stat.AIR_SUPER_EVASION]?: ['x', number];
	// [Stat.VOID_SUPER_EVASION]?: ['x', number];
	// Multihits
	[Stat.MULTIHIT]?: ['x', number];
	// [Stat.FIRE_MULTIHIT]?: ['x', number];
	// [Stat.WOOD_MULTIHIT]?: ['x', number];
	// [Stat.WATER_MULTIHIT]?: ['x', number];
	// [Stat.LIGHTNING_MULTIHIT]?: ['x', number];
	// [Stat.AIR_MULTIHIT]?: ['x', number];
	// [Stat.VOID_MULTIHIT]?: ['x', number];
	// Critical Hit Chance
	[Stat.CRITICAL_HIT_CHANCE]?: ['x', number];
	// Critical Hit Damage
	[Stat.CRITICAL_HIT_DAMAGE]?: number;
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
	raceId?: RaceEnum[]; // For specific race skill (ex : fly for Pteroz)
	isBaseSkill: boolean; // If true : dinoz knows this skill when bought
	isSphereSkill: boolean; // true : the skill can only be learned with a sphere object
	effects?: PassiveEffects;
	globalEffects?: PassiveEffects;
	priority?: number;
	probability?: number;
	fightCondition?: SkillFightCondition;
	visualEffect?: SkillVisualEffect; // Effect for Skill "activate" steps
	color?: string; // Color for skill "activate" step
	speed?: number; // Speed of skill, notably used for "Projectile" and "Rafale" effects
	radius?: number; // Radius, notably used for "Generate" effect
	power?: number; // Power, notably used for "Rafale" or "Generate" effect
	anim?: string; // Animation to use for supported visual effects (ex: invocation)
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
