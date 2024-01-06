import { Skill } from "../dinoz/SkillList.mjs";
import { FighterStatus } from "./DetailedFighter.mjs";

export interface StepFighter {
	id: number;
  name: string;
  type: 'dinoz' | 'monster';
  attacker: boolean;
}

export interface ArriveStep {
  action: 'arrive';
  fighter: StepFighter;
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

export type FightStep = ArriveStep | ResistStep | HitStep
| AttemptHitStep | EvadeStep | DeathStep | MoveStep
| CounterStep | MoveBackStep | SurviveStep
| SkillActivateStep | SkillExpireStep | LooseHpStep
| HealStep | AddStatusStep | RemoveStatusStep;
