import { Skill } from '../dinoz/SkillList.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { Item } from '../item/ItemList.mjs';
import { Status, FighterType } from './DetailedFighter.mjs';
import { LifeEffect } from './transpiler.mjs';

export interface StepFighter {
	id: number;
	name: string;
	type: FighterType;
	attacker: boolean;
}

export interface InitStepFighter {
	id: number;
	display: string;
	name: string;
	type: FighterType;
	attacker: boolean;
	maxLife: number;
	maxEnergy: number;
	energy: number;
	startingHp: number;
}

export enum LeaveAnimation {
	RUN,
	BLACKHOLE,
	FLYING
}

export interface ArriveStep {
	action: 'arrive';
	fid: number;
}
export interface LeaveStep {
	action: 'leave';
	fighter: StepFighter;
	animation?: LeaveAnimation;
}
export interface ResistStep {
	action: 'resist';
	dinoz: StepFighter;
}
export interface HitStep {
	action: 'hit';
	fighter: StepFighter;
	target: StepFighter;
	damage: number;
	elements: ElementType[];
	skill?: Skill;
}
export interface AttemptHitStep {
	action: 'attemptHit';
	fighter: StepFighter;
	target: StepFighter;
}
export interface EvadeStep {
	action: 'evade';
	fighter: StepFighter;
}
export interface DeathStep {
	action: 'death';
	fighter: StepFighter;
}
export interface MoveStep {
	action: 'moveTo';
	fid: number;
	tid: number;
	sameSpace?: boolean;
	countered?: boolean;
}
export interface CounterStep {
	action: 'counter';
	fighter: StepFighter;
	opponent: StepFighter;
}
export interface MoveBackStep {
	action: 'moveBack';
	fid: number;
}
export interface SurviveStep {
	action: 'survive';
	dinoz: StepFighter;
}
export interface SkillActivateStep {
	action: 'skillActivate';
	fid: number;
	skill: Skill;
	targets: {
		tid: number;
		damages?: number;
	}[];
}
export interface SkillExpireStep {
	action: 'skillExpire';
	dinoz: StepFighter;
	skill: Skill;
}
export interface LooseHpStep {
	action: 'looseHp';
	fid: number;
	hp: number;
	fx: LifeEffect;
}
export interface HealStep {
	action: 'heal';
	fighter: StepFighter;
	hp: number;
}
export interface AddStatusStep {
	action: 'addStatus';
	fighter: StepFighter;
	status: Status;
}
export interface RemoveStatusStep {
	action: 'removeStatus';
	fighter: StepFighter;
	status: Status;
}
export interface ItemUseStep {
	action: 'itemUse';
	fighter: StepFighter;
	itemId: Item;
}
export interface ActivateEnvironmentStep {
	action: 'activateEnvironment';
	environment: Skill;
}
export interface ExpireEnvironmentStep {
	action: 'expireEnvironment';
	environment: Skill;
}
export interface SetCostumeStep {
	action: 'setCostume';
	fighter: StepFighter;
	costume: string;
}
export interface RemoveCostumeStep {
	action: 'removeCostume';
	fighter: StepFighter;
}
export interface HypnotizeStep {
	action: 'hypnotize';
	fighter: StepFighter;
}
export interface EndHypnosisStep {
	action: 'endHypnosis';
	fighter: StepFighter;
}
export interface GainEnergyStep {
	action: 'gainEnergy';
	fighter: StepFighter;
	energy: number;
}
export interface ReduceEnergyStep {
	action: 'reduceEnergy';
	fighter: StepFighter;
}
export interface LoseSphereStep {
	action: 'loseSphere';
	fighter: StepFighter;
	element: ElementType;
}
export interface MissStep {
	action: 'miss';
	fighter: StepFighter;
}
export interface DisabledItemsStep {
	action: 'disabledItems';
	fighter: StepFighter;
	items: Item[];
}
export interface StealGoldStep {
	action: 'stealGold';
	fighter: StepFighter;
	target: StepFighter;
	gold: number;
}
export interface CursedStep {
	action: 'cursed';
	fighter: StepFighter;
}
export interface ReviveStep {
	action: 'revive';
	fighter: StepFighter;
}

export type FightStep =
	| ArriveStep
	| LeaveStep
	| ResistStep
	| HitStep
	| AttemptHitStep
	| EvadeStep
	| DeathStep
	| MoveStep
	| CounterStep
	| MoveBackStep
	| SurviveStep
	| SkillActivateStep
	| SkillExpireStep
	| LooseHpStep
	| HealStep
	| AddStatusStep
	| RemoveStatusStep
	| ItemUseStep
	| ActivateEnvironmentStep
	| ExpireEnvironmentStep
	| SetCostumeStep
	| RemoveCostumeStep
	| HypnotizeStep
	| EndHypnosisStep
	| GainEnergyStep
	| ReduceEnergyStep
	| LoseSphereStep
	| MissStep
	| DisabledItemsStep
	| StealGoldStep
	| CursedStep
	| ReviveStep;
