import { AssaultElement } from "../../utils/getAssaultStat.mjs";
import { DefenseElement } from "../../utils/getDefenseStat.mjs";
import { SpecialStatUsedInFights } from "../../utils/getSpecialStat.mjs";
import { DinozSkillFiche } from "../dinoz/DinozSkillFiche.mjs";
import { Skill } from "../dinoz/SkillList.mjs";
import { Status } from "../dinoz/StatusList.mjs";
import { ItemFiche } from "../item/ItemFiche.mjs";

export interface DetailedFighter {
  // Metadata
  id: number;
  name: string;
  level: number;
  type: 'dinoz' | 'monster';
	attacker: boolean;
  // Raw stats
  maxHp: number;
  hp: number,
	stats: {
		assault: Record<AssaultElement, number>,
		defense: Record<DefenseElement, number>,
		special: Record<SpecialStatUsedInFights, number | undefined>,
		speed: Record<AssaultElement | 'global', number>,
	}
	// Items
	items: ItemFiche[];
	itemsUsed: number[];
  // Initiative
  initiative: number, // Lower attacks next
  // Available skills
  skills: DinozSkillFiche[],
  // Current status
  status: Status[],
  // Active skills
  activeSkills: DinozSkillFiche[],
	// Poisoned
	poisonedBy?: {
		id: number,
		type: 'dinoz' | 'monster',
		skill: Skill,
	},
	// Burned
	burnedBy?: {
		id: number,
		type: 'dinoz' | 'monster',
	},
	// Elements
	elements: AssaultElement[],
	element: AssaultElement,
	// Min damage
	minDamage: number,
	// Can hit flying
	canHitFlying?: boolean,
	// Can hit intangible
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
