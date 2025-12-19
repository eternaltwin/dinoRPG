import { SpecialStatUsedInFights } from '../../utils/getSpecialStat.mjs';
import { SkillDetails } from '../dinoz/SkillDetails.mjs';
import { Skill } from '../dinoz/SkillList.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { ItemFiche } from '../item/ItemFiche.mjs';
import { Item } from '../item/ItemList.mjs';
import { MonsterFiche } from './MonsterFiche.mjs';
import { DinozStatusId } from '../dinoz/StatusList.mjs';
import { FIGHT_INFINITE } from '../../utils/fightConstants.mjs';

export enum FightStatus {
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
	AIR_SLOWED = 'airSlowed',
	// Other
	// Only used for when fights are too long
	OVERTIME_POISON = 'overtime_poison'
}

export const GoodFightStatus = [
	FightStatus.TORCHED,
	FightStatus.INTANGIBLE,
	FightStatus.FLYING,
	FightStatus.QUICKENED,
	FightStatus.SHIELDED,
	FightStatus.BLESSED,
	FightStatus.HEALING
];

export const BadFightStatus = [
	FightStatus.ASLEEP,
	FightStatus.SLOWED,
	FightStatus.PETRIFIED,
	FightStatus.POISONED,
	FightStatus.BURNED,
	FightStatus.LOCKED,
	FightStatus.DAZZLED,
	FightStatus.STUNNED
];

export const IncapacitatingStatus = [FightStatus.ASLEEP, FightStatus.PETRIFIED, FightStatus.STUNNED];

export enum FightStatusLength {
	SUPER_SHORT = 6,
	SHORT = 15,
	MEDIUM = 30,
	LONG = 80,
	INFINITE = FIGHT_INFINITE
}

export type FighterStatusData = {
	type: FightStatus;
	time: number;
	timeSinceLastCycle: number;
	cycle: boolean;
};

export enum FighterType {
	DINOZ = 'dinoz',
	MONSTER = 'monster',
	BOSS = 'boss',
	CLONE = 'clone',
	REINFORCEMENT = 'reinforcement'
}

export const AllFighterTypeExceptBoss = [
	FighterType.DINOZ,
	FighterType.MONSTER,
	FighterType.CLONE,
	FighterType.REINFORCEMENT
];

export interface DetailedFighter {
	// Metadata
	playerId: string | null;
	id: number;
	name: string;
	level: number;
	display?: string;
	type: FighterType;
	// In case the fighter is a summon, this is the ID of the fighter that summoned them.
	master?: number;
	// Team side
	attacker: boolean;
	// Resilience determines how much damage a fighter takes in.
	// Damage formula is: damage^(1-resilience*0.01)
	// So each point in resilience lowers the damage receive.
	// PVP default is 40 points so 1 - 40*0.01 = 0.6 (the original number used by MT)
	// PVE is case by case
	resilience: number;
	escaped?: boolean;

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
		special: Record<SpecialStatUsedInFights, number>;
		speed: Record<ElementType | 'global', number>;
	};
	// Items
	items: ItemFiche[];
	itemsUsed: number[];
	// Time of the fighter, determines whose turn it is. Fighter with the lowest time plays.
	time: number;
	// Available skills
	skills: SkillDetails[];
	// Current fight status
	status: FighterStatusData[];
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
	playerId: string | null;
	dinozId: number;
	hpLost: number;
	itemsUsed: Item[];
	goldLost: number;
	statusGained: DinozStatusId[];
}
