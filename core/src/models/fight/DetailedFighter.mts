import { SpecialStatUsedInFights } from "../../utils/getSpecialStat.mjs";
import { SkillDetails } from "../dinoz/SkillDetails.mjs";
import { Skill } from "../dinoz/SkillList.mjs";
import { ElementType } from "../enums/ElementType.mjs";
import { ItemFiche } from "../item/ItemFiche.mjs";
import { Item } from "../item/ItemList.mjs";
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
	COPY_HEAL,
	NO_INVOCATION,
	USED_FUJIN,
	M_ABSORB,
	NO_ASSAULT,
	NO_POISON,
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
    base: Record<ElementType, number>,
    assault: Record<ElementType, number>,
    defense: Record<ElementType, number>,
    special: Record<SpecialStatUsedInFights, number>,
    speed: Record<ElementType | 'global', number>,
  }
  // Items
  items: ItemFiche[];
  itemsUsed: number[];
  // Time of the fighter, determines when its turn is
  time: number, // Lower attacks next
  // Available skills
  skills: SkillDetails[],
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
		skill: Skill,
		damage: number,
  },
  // Elements
  elements: ElementType[],
  element: ElementType,
	locked?: number,
  // Min damage
  minDamage: number,
  minAssaultDamage: number,
  // Flying
  canHitFlying?: boolean,
  // Intangible
  canHitIntangible?: boolean,
  // Skill bonuses
  skillElementalBonus: Record<ElementType, number>,
	nextSkill?: SkillDetails,
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
	// Protecting
	protecting?: number,
	// Absorb damage
	absorbed?: number,
	// Spikes
	spikes?: number,
	// Gold stolen
	goldStolen?: Record<number, number>,
	// Cursed
	initiallyCursed: boolean,
	cursed?: boolean,
}

export interface FighterResultFiche {
  dinozId: number;
  hpLost: number;
  itemsUsed: Item[];
	goldLost: number;
	cursed: boolean;
}
