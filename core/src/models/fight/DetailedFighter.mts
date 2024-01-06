import { AssaultElement } from "../../utils/getAssaultStat.mjs";
import { DefenseElement } from "../../utils/getDefenseStat.mjs";
import { SpecialStatUsedInFights } from "../../utils/getSpecialStat.mjs";
import { DinozSkillFiche } from "../dinoz/DinozSkillFiche.mjs";
import { Skill } from "../dinoz/SkillList.mjs";
import { ItemFiche } from "../item/ItemFiche.mjs";

export enum FighterStatus {
	ASLEEP,
	SLOWED,
	PETRIFIED,
	POISONED,
	BURNED,
	LOCKED,
	DAZZLED,
	STUNNED,
	TORCHED,
	INTANGIBLE,
	FLYING,
	QUICKENED,
	SHIELDED,
	BLESSED,
	HEALING,
};

export const BadFighterStatus = [
	FighterStatus.ASLEEP,
	FighterStatus.SLOWED,
	FighterStatus.PETRIFIED,
	FighterStatus.POISONED,
	FighterStatus.BURNED,
	FighterStatus.LOCKED,
	FighterStatus.DAZZLED,
	FighterStatus.STUNNED,
];

export type FighterType = 'dinoz' | 'monster' | 'boss' | 'clone';

export interface DetailedFighter {
  // Metadata
  id: number;
  name: string;
  level: number;
  type: FighterType;
	attacker: boolean;
  // Raw stats
  maxHp: number;
  hp: number,
	energy: number,
	stats: {
		base: Record<AssaultElement, number>,
		assault: Record<AssaultElement, number>,
		defense: Record<DefenseElement, number>,
		special: Record<SpecialStatUsedInFights, number | undefined>,
		speed: Record<AssaultElement | 'global', number>,
	}
	// Items
	items: ItemFiche[];
	itemsUsed: number[];
  // Time of the fighter, determines when its turn is
  time: number, // Lower attacks next
  // Available skills
  skills: DinozSkillFiche[],
  // Current status
  status: FighterStatus[],
  // Active skills
  activeSkills: Skill[],
	// Poisoned
	poisonedBy?: {
		id: number,
		type: FighterType,
		skill: Skill,
	},
	// Burned
	burnedBy?: {
		id: number,
		type: FighterType,
	},
	// Elements
	elements: AssaultElement[],
	element: AssaultElement,
	// Min damage
	minDamage: number,
	// Flying
	canHitFlying?: boolean,
	// Intangible
	canHitIntangible?: boolean,
	// Next hit bonus
	nextHitBonus: number,
	nextHitMultiplier: number,
	// Cancel armor
	cancelArmor?: boolean,
	// Survival
	canSurvive?: boolean,
}

// This structure needs to be exactly the same as FighterResult in native/src/fight/fighter.rs
export interface FighterResultFiche {
	// ID of the dinoz in the DB
	dinoz_id: number;
	// The health lost by the dinoz in the fight in comparison to its starting life
	hp_lost: number;
	// The items used by the dinoz during the fight
	items_used: number[];
}
