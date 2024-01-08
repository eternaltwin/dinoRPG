import { Skill } from "../dinoz/SkillList.mjs";
import { Item } from "../item/ItemList.mjs";
import { FighterStatus, FighterType } from "./DetailedFighter.mjs";

export interface StepFighter {
	id: number;
  name: string;
  type: FighterType;
  attacker: boolean;
}

export enum LeaveAnimation {
	RUN,
	BLACKHOLE,
}

export interface ArriveStep {
  action: 'arrive';
  fighter: StepFighter;
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
  fighter: StepFighter;
  target: StepFighter;
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
  fighter: StepFighter;
}
export interface SurviveStep {
  action: 'survive';
  dinoz: StepFighter;
}
export interface SkillActivateStep {
  action: 'skillActivate';
  dinoz: StepFighter;
  skill: Skill;
	energy: number;
}
export interface SkillExpireStep {
  action: 'skillExpire';
  dinoz: StepFighter;
  skill: Skill;
}
export interface LooseHpStep {
	action: 'looseHp';
	fighter: StepFighter;
	hp: number;
}
export interface HealStep {
	action: 'heal';
	fighter: StepFighter;
	hp: number;
}
export interface AddStatusStep {
	action: 'addStatus';
	fighter: StepFighter;
	status: FighterStatus;
}
export interface RemoveStatusStep {
	action: 'removeStatus';
	fighter: StepFighter;
	status: FighterStatus;
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

export type FightStep = ArriveStep | LeaveStep | ResistStep
| HitStep | AttemptHitStep | EvadeStep | DeathStep | MoveStep
| CounterStep | MoveBackStep | SurviveStep
| SkillActivateStep | SkillExpireStep | LooseHpStep
| HealStep | AddStatusStep | RemoveStatusStep | ItemUseStep
| ActivateEnvironmentStep | ExpireEnvironmentStep | SetCostumeStep
| RemoveCostumeStep;
