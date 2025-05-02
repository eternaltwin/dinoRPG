import { UniqueSpecialStatUsedInFights } from '../../utils/getSpecialStat.mjs';
import { SkillDetails } from '../dinoz/SkillDetails.mjs';
import { Skill } from '../dinoz/SkillList.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { ItemFiche } from '../item/ItemFiche.mjs';
import { Item } from '../item/ItemList.mjs';
import { MonsterFiche } from './MonsterFiche.mjs';
import { DinozStatusId } from '../dinoz/StatusList.mjs';
import { FIGHT_INFINITE } from '../../utils/fightConstants.mjs';

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
	NO_HEAL = 'hoHeal',
	// Good
	TORCHED = 'torched',
	INTANGIBLE = 'intangible',
	FLYING = 'flying',
	QUICKENED = 'quickened',
	SHIELDED = 'shielded',
	BLESSED = 'blessed',
	HEALING = 'healing',
	// Skills
	COPY_HEAL = 'copyHeal',
	NO_INVOCATION = 'noInvocation',
	USED_FUJIN = 'usedFujin',
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
	AIR_SLOWED = 'airSlowed'
}

export const GoodStatus = [
	Status.TORCHED,
	Status.INTANGIBLE,
	Status.FLYING,
	Status.QUICKENED,
	Status.SHIELDED,
	Status.BLESSED,
	Status.HEALING
];

export const BadStatus = [
	Status.ASLEEP,
	Status.SLOWED,
	Status.PETRIFIED,
	Status.POISONED,
	Status.BURNED,
	Status.LOCKED,
	Status.DAZZLED,
	Status.STUNNED
];

export enum StatusLength {
	SHORT = 15,
	MEDIUM = 30,
	LONG = 80,
	INFINITE = FIGHT_INFINITE
}

export type FighterStatus = {
	type: Status;
	time: number;
	timeSinceLastCycle: number;
	cycle: boolean;
};

export type FighterType = 'dinoz' | 'monster' | 'boss' | 'clone' | 'reinforcement';

export interface DetailedFighter {
	// Metadata
	id: number;
	name: string;
	level: number;
	display?: string;
	type: FighterType;
	// In case the fighter is a summon, this is the ID of the fighter that summoned them.
	master?: number;
	// Team side
	attacker: boolean;
	// If the fighter needs to use smoothed calculations
	balanced: boolean;
	escaped?: boolean;
	// Current counter of attacks performed in a row (assault and skills)
	comboCounter: number;

	// Raw stats
	maxHp: number;
	startingHp: number;
	hp: number;
	energy: number;
	maxEnergy: number;
	stats: {
		base: Record<ElementType, number>;
		// Assault elemental bonuses. This includes the "allAssaultBonus" from MT too, as it is just handled as a bonus for all assault elements.
		assaultBonus: Record<ElementType, number>;
		defense: Record<ElementType, number>;
		special: Record<UniqueSpecialStatUsedInFights, number>;
		armor: Record<ElementType | 'global', number>;
		ignoreArmor: Record<ElementType | 'global' | 'assault', number>;
		speed: Record<ElementType | 'global', number>;
		multihit: Record<ElementType | 'global', number>;
		evasion: Record<ElementType | 'global', number>;
		superEvasion: Record<ElementType | 'global', number>;
		counter: Record<ElementType | 'global', number>;
	};
	// Items
	items: ItemFiche[];
	itemsUsed: number[];
	// Time of the fighter, determines whose turn it is. Fighter with the lowest time plays.
	time: number;
	// Available skills
	skills: SkillDetails[];
	// Current status
	status: FighterStatus[];
	// Poisoned
	poisonedBy?: {
		id: number;
		skill: Skill;
		damage: number;
	};
	// Burned
	burnedBy?: {
		id: number;
		skill: Skill;
		damage: number;
	};
	// Elements
	elements: ElementType[];
	element: ElementType;
	locked?: number;
	// Min damage
	minDamage: number;
	minAssaultDamage: number;
	// Perception
	perception: boolean;
	// Flying
	canHitFlying: boolean;
	// Intangible
	canHitIntangible: boolean;
	// Rock
	hasRock: boolean;
	// Skill bonuses
	skillElementalBonus: Record<ElementType, number>;
	nextSkill?: SkillDetails;
	// Assault bonuses
	allAssaultMultiplier: number;
	nextAssaultBonus: number;
	nextAssaultMultiplier: number;
	// Cancel armor
	cancelArmor: boolean;
	// Cancel dodge
	cancelAssaultDodge: boolean;
	// Survival
	canSurvive?: boolean;
	// Costume
	costume?: MonsterFiche;
	// Hypnotized: duration (in cycles) of the hypnosis
	hypnotized?: number;
	hasUsedHypnose: boolean;
	hasUsedHyperventilation: boolean;
	// Rage
	hasRaged: boolean;
	// Mud wall
	mudWall?: number;
	// Invocations
	invocations: number;
	// Protecting
	protecting?: number;
	// Absorb damage
	absorbed?: number;
	// Spikes
	spikes?: number;
	// Gold stolen
	goldStolen?: Record<number, number>;
	// Cursed
	initiallyCursed: boolean;
	permanentStatusGained: DinozStatusId[];
	// Previous target - only used for concentration
	previousTarget?: number;
	// Caught by
	catcher?: number;
	catchId?: number;
}

export interface FighterResultFiche {
	dinozId: number;
	hpLost: number;
	itemsUsed: Item[];
	goldLost: number;
	statusGained: DinozStatusId[];
}
