import { AssaultElement } from "../../utils/getAssaultStat.mjs";
import { DefenseElement } from "../../utils/getDefenseStat.mjs";
import { SpecialStatUsedInFights } from "../../utils/getSpecialStat.mjs";
import { DinozSkillFiche } from "../dinoz/DinozSkillFiche.mjs";
import { Skill } from "../dinoz/SkillList.mjs";
import { ItemFiche } from "../item/ItemFiche.mjs";
import { MonsterFiche } from "./MonsterFiche.mjs";

export enum FighterStatus {
	// Bad
  ASLEEP,
  SLOWED,
  PETRIFIED,
  POISONED,
  BURNED,
  LOCKED,
  DAZZLED,
  STUNNED,
	// Good
  TORCHED,
  INTANGIBLE,
  FLYING,
  QUICKENED,
  SHIELDED,
  BLESSED,
  HEALING,
	// Skills
	NO_DODGE,
	// Items
	CURED,
	BEER,
	STOLE_LIFE,
	// Environments
	NO_EVENT,
	NO_SKILL,
	WEAKENED,
	LIGHTNING_STRUCK,
	AIR_SLOWED,
};

export const GoodFighterStatus = [
  FighterStatus.TORCHED,
  FighterStatus.INTANGIBLE,
  FighterStatus.FLYING,
  FighterStatus.QUICKENED,
  FighterStatus.SHIELDED,
  FighterStatus.BLESSED,
  FighterStatus.HEALING,
];

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
	master?: number;
  attacker: boolean;
	escaped?: boolean;
  // Raw stats
  maxHp: number;
	startingHp: number;
  hp: number,
  energy: number,
	maxEnergy: number,
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
	locked?: number,
  // Min damage
  minDamage: number,
  minAssaultDamage: number,
  // Flying
  canHitFlying?: boolean,
  // Intangible
  canHitIntangible?: boolean,
  // Skill bonuses
  skillElementalBonus: Record<AssaultElement, number>,
  // Assault bonuses
  nextAssaultBonus: number,
  nextAssaultMultiplier: number,
  // Cancel armor
  cancelArmor?: boolean,
  // Survival
  canSurvive?: boolean,
	// Costume
	costume?: MonsterFiche,
	// Hypnotized
	hypnotized?: number,
	// Mud wall
	mudWall?: number,
	// Invocations
	invocations: number,
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
