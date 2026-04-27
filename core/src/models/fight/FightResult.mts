import { FightStep } from './FightStep.mjs';
import { FighterResultFiche, FighterType } from './DetailedFighter.mjs';
import { Monster } from './MonsterList.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { FightText } from '../missions/specialActions.mjs';
import { DinozStatusId } from '../dinoz/StatusList.mjs';
import { EntranceEffect } from './transpiler.mjs';
import { MonsterFiche } from './MonsterFiche.mjs';
import { PlayerInfo } from '../player/PlayerInfo.mjs';

export interface FightResult {
	fighters: FighterRecap[];
	goldEarned: number;
	xpEarned: number;
	levelUp: boolean;
	totalHpLost: number;
	result: boolean;
	history: FightStep[];
	hpLost: {
		id: number;
		hpLost: number;
	}[];
	itemsUsed: {
		id: number;
		itemsUsed: number[];
	}[];
	place: PlaceEnum;
	startText?: FightText;
	endText?: FightText;
	itemWon?: number;
	statusReward?: DinozStatusId;
}

export interface FighterRecap {
	id: number;
	type: FighterType;
	name: string;
	level: number;
	display: string | undefined;
	survived: boolean;
	attacker: boolean;
	maxHp: number;
	startingHp: number;
	energy: number;
	maxEnergy: number;
	energyRecovery: number;
	costume?: MonsterFiche;
	dark?: boolean;
	size?: number;
	entrance?: EntranceEffect;
}

export interface FightReplay {
	id: string;
	fighters: FighterRecap[];
	history: FightStep[];
	result: boolean;
	seed: string;
	leftPlayer: Pick<PlayerInfo, 'id' | 'name'> | null;
	rightPlayer: Pick<PlayerInfo, 'id' | 'name'> | null;
	metadata: { placeId: number };
}

export interface CatchResult {
	dinozId: number;
	monsterId: Monster;
	hp: number;
	id?: number;
}

export type FightStats = {
	// Total starting HP (initial fighters only)
	startingHp: number;

	// Total ending HP (not counting reinforcements)
	endingHp: number;

	// Total HP lost
	hpLost: number;

	// Total HP healed
	hpHealed: number;

	// Total attacks by me
	attacks: number;

	// Total attacks on me
	times_attacked: number;

	// Total multi-hits
	multiHits: number;

	// Total assaults by me
	assaults: number;

	// Total critical hits
	criticalHits: number;

	// Total assaults on me
	times_assaulted: number;

	// Total evasions
	evasions: number;

	// Total counters
	counters: number;

	// Total times poison was applied to an opponent
	poisoned: number;

	// Total damage dealt with poison to an opponent
	poison_damage: number;

	// Total times the Dinoz on the team were poisoned (not counting reinforcements)
	times_poisoned: number;

	// Total damage dealt with burn to opponents
	burn_damage: number;

	// Number of reinforcements called (e.g. clone, korgon, etc.)
	reinforcements: number;

	// Total times (not total duration) an opponent was petrified
	petrified: number;

	elements: Record<
		ElementType,
		{
			// Total damage dealt in one element
			damage_dealt: number;
			// Total number of attacks carried in one element
			attacks: number;
			// Total damage received in one element
			damage_received: number;
			// Total number of times an attack was received
			defenses: number;
		}
	>;
};

export enum FightOutcome {
	// Left side, always a player
	AttackerWin,
	// Right side, can be player or monsters
	DefenderWin,
	// No one, all fighters on both side are dead
	Tie,
	// Fight timed out, rewards and other results depend on the context
	Timeout
}

export interface FightProcessResult {
	// Seed used for the fight
	seed: string;
	// Outcome of the fight
	outcome: FightOutcome;
	// List of attackers
	attackers: FighterResultFiche[];
	// List of defenders
	defenders: FighterResultFiche[];
	// List of catches to update
	catches: CatchResult[];
	// History of the fight
	steps: FightStep[];
	// Stats
	stats: FullFightStats;
	place: PlaceEnum;
	fighters: FighterRecap[];
}

export interface FullFightStats {
	attack: FightStats;
	defense: FightStats;
}
