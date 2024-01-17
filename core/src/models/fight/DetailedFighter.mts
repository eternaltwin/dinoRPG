import { SpecialStatUsedInFights } from "../../utils/getSpecialStat.mjs";
import { SkillDetails } from "../dinoz/SkillDetails.mjs";
import { Skill } from "../dinoz/SkillList.mjs";
import { ElementType } from "../enums/ElementType.mjs";
import { ItemFiche } from "../item/ItemFiche.mjs";
import { Item } from "../item/ItemList.mjs";
import { MonsterFiche } from "./MonsterFiche.mjs";
import { Status as DinozStatus } from "../dinoz/StatusList.mjs";

export enum Status {
	// Bad
  ASLEEP = 'asleep',
  SLOWED = 'slowed',
  PETRIFIED = 'petrified',
  POISONED = 'poisoned',
  BURNED = 'burned',
  LOCKED = 'locked',
  DAZZLED = 'dazzled',
  STUNNED = 'stunned',
	// Good
  TORCHED = 'torched',
  INTANGIBLE = 'intangible',
  FLYING = 'flying',
  QUICKENED = 'quickened',
  SHIELDED = 'shielded',
  BLESSED = 'blessed',
  HEALING = 'healing',
	// Skills
	NO_DODGE = 'noDodge',
	COPY_HEAL = 'copyHeal',
	NO_INVOCATION = 'noInvocation',
	USED_FUJIN = 'usedFujin',
	M_ABSORB = 'mAbsorb',
	NO_ASSAULT = 'noAssault',
	NO_POISON = 'noPoison',
	NO_CURSE = 'noCurse',
	KEEP_FLYING = 'keepFlying',
	NO_DEATH = 'noDeath',
	// Items
	CURED = 'cured',
	BEER = 'beer',
	STOLE_LIFE = 'stoleLife',
	// Environments
	NO_EVENT = 'noEvent',
	NO_SKILL = 'noSkill',
	WEAKENED = 'weakened',
	LIGHTNING_STRUCK = 'lightningStruck',
	AIR_SLOWED = 'airSlowed',
};

export const GoodStatus = [
  Status.TORCHED,
  Status.INTANGIBLE,
  Status.FLYING,
  Status.QUICKENED,
  Status.SHIELDED,
  Status.BLESSED,
  Status.HEALING,
];

export const BadStatus = [
  Status.ASLEEP,
  Status.SLOWED,
  Status.PETRIFIED,
  Status.POISONED,
  Status.BURNED,
  Status.LOCKED,
  Status.DAZZLED,
  Status.STUNNED,
];

export enum StatusLength {
	SHORT = 15,
	MEDIUM = 30,
	LONG = 80,
	INFINITE = 1000000,
}

export type FighterStatus = {
	type: Status,
	time: number,
	timeSinceLastCycle: number,
	cycle: boolean,
}

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
    assaultBonus: Record<ElementType, number>,
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
    skill: Skill,
		damage: number,
  },
  // Burned
  burnedBy?: {
    id: number,
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
	permanentStatusGained: DinozStatus[],
	// Previous target
	previousTarget?: number,
}

export interface FighterResultFiche {
  dinozId: number;
  hpLost: number;
  itemsUsed: Item[];
	goldLost: number;
	statusGained: DinozStatus[];
}
