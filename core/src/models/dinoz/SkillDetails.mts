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
import { MathOperator } from '../enums/Parser.mjs';

type OtherAssaults<T> = Exclude<
	Stat.FIRE_ASSAULT | Stat.WATER_ASSAULT | Stat.AIR_ASSAULT | Stat.LIGHTNING_ASSAULT | Stat.WOOD_ASSAULT,
	T
>;

export type PassiveEffects = {
	[Stat.MAX_HP]?: [MathOperator, number];
	[Stat.HP_REGEN]?: [MathOperator, number];
	[Stat.MAX_FOLLOWERS]?: [MathOperator, number];
	[Stat.INITIATIVE]?: [MathOperator, number];
	[Stat.ENERGY]?: [MathOperator, number];
	[Stat.ENERGY_RECOVERY]?: [MathOperator, number];
	// Elements
	[Stat.FIRE_ELEMENT]?: [MathOperator, number];
	[Stat.WOOD_ELEMENT]?: [MathOperator, number];
	[Stat.WATER_ELEMENT]?: [MathOperator, number];
	[Stat.LIGHTNING_ELEMENT]?: [MathOperator, number];
	[Stat.AIR_ELEMENT]?: [MathOperator, number];
	// Speeds
	[Stat.SPEED]?: [MathOperator, number];
	[Stat.FIRE_SPEED]?: [MathOperator, number];
	[Stat.WOOD_SPEED]?: [MathOperator, number];
	[Stat.WATER_SPEED]?: [MathOperator, number];
	[Stat.LIGHTNING_SPEED]?: [MathOperator, number];
	[Stat.AIR_SPEED]?: [MathOperator, number];
	// [Stat.VOID_SPEED]?: [MathOperator.MULTIPLY, number];
	// Defenses
	[Stat.FIRE_DEFENSE]?: [MathOperator, number];
	[Stat.WOOD_DEFENSE]?: [MathOperator, number];
	[Stat.WATER_DEFENSE]?: [MathOperator, number];
	[Stat.LIGHTNING_DEFENSE]?: [MathOperator, number];
	[Stat.AIR_DEFENSE]?: [MathOperator, number];
	// Assaults
	[Stat.FIRE_ASSAULT]?: [MathOperator, number] | OtherAssaults<Stat.FIRE_ASSAULT>;
	[Stat.WOOD_ASSAULT]?: [MathOperator, number] | OtherAssaults<Stat.WOOD_ASSAULT>;
	[Stat.WATER_ASSAULT]?: [MathOperator, number] | OtherAssaults<Stat.WATER_ASSAULT>;
	[Stat.LIGHTNING_ASSAULT]?: [MathOperator, number] | OtherAssaults<Stat.LIGHTNING_ASSAULT>;
	[Stat.AIR_ASSAULT]?: [MathOperator, number] | OtherAssaults<Stat.AIR_ASSAULT>;
	// Armors
	[Stat.ARMOR]?: [MathOperator, number];
	// [Stat.FIRE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_ARMOR]?: [MathOperator.MULTIPLY, number];
	// Counters
	[Stat.COUNTER]?: [MathOperator, number];
	// [Stat.FIRE_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_COUNTER]?: [MathOperator.MULTIPLY, number];
	// Armor ignores
	[Stat.ARMOR_BREAK]?: [MathOperator, number];
	// [Stat.ASSAULT_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.FIRE_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// Evasions
	[Stat.EVASION]?: [MathOperator, number];
	// [Stat.FIRE_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_EVASION]?: [MathOperator.MULTIPLY, number];
	// Super evasions
	[Stat.SUPER_EVASION]?: [MathOperator, number];
	// [Stat.FIRE_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// Multihits
	[Stat.MULTIHIT]?: [MathOperator, number];
	// [Stat.FIRE_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// Critical Hit Chance
	[Stat.CRITICAL_HIT_CHANCE]?: [MathOperator, number];
	// Critical Hit Damage
	[Stat.CRITICAL_HIT_DAMAGE]?: [MathOperator, number];
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
