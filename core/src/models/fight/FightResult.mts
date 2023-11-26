import { ElementType } from '../enums/ElementType.mjs';
import { FighterResultFiche, FighterType } from './FighterFiche.mjs';

export enum TeamSide {
	Attackers = 'attackers',
    Defenders = 'defenders',
}

export enum EventType {
	Assault = 'Assault',
    Death = 'Death',
    End = 'End',
    Item = 'Item',
	Join = 'Join',
    Skill = 'Skill',
    Status = 'Status',
    Summon = 'Summon',
}

export enum ElementName {
	Fire = 'Fire',
    Wood = 'Wood',
    Water = 'Water',
    Lightning = 'Lightning',
    Air = 'Air',
    Void = 'Void',
}

export interface AssaultEvent {
	event_type: EventType.Assault;
	attacker_id: number;
	attacker_name: string;
	target_id: number;
	target_name: string;
	element_type: ElementName;
	damage: number;
}

export interface DeathEvent {
	event_type: EventType.Death;
	fighter_id: number;
	fighter_name: string;
}

export interface EndEvent {
	event_type: EventType.End;
	team: TeamSide;
}

export interface ItemEvent {
	event_type: EventType.Item;
}

export interface JoinEvent {
	event_type: EventType.Join;
	fighter_id: number;
	fighter_name: string;
	team: TeamSide;
}


export interface SkillEvent {
	event_type: EventType.Skill;
}

export interface StatusEvent {
	event_type: EventType.Status;
}

export interface SummonEvent {
	event_type: EventType.Summon;
}

export interface FighterShort {
	id: number;
	name: string;
	ftype: FighterType;
	display: string;
	dinoz_id: number;
	side: TeamSide;
}

export type FightEvent = AssaultEvent | DeathEvent | EndEvent | JoinEvent | SkillEvent | StatusEvent | SummonEvent;

export interface FightHistory {
	fighters: Map<number, FighterShort>;
	events: Array<FightEvent>;
}

// This structure needs to be exactly the same as FightResult in native/src/fight/manager.rs
export interface FightProcessResult {
	// true: attackers won, false: defenders won
	winner: boolean;
	// Seed used to generate random in the fight
	seed: number;
	// List of attackers
	attackers: Array<FighterResultFiche>;
	// List of defenders
	defenders: Array<FighterResultFiche>;
	// History of the fight
	history: FightHistory;
}

export interface FightResult {
	opponent: Array<string>;
	goldEarned: number;
	xpEarned: number;
	hpLost: number;
	result: boolean;
	dinozId: number;
	history: FightHistory;
}
