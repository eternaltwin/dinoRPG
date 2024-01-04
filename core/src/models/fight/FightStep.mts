
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
export interface PoisonStep {
  action: 'poison';
  fighter: StepFighter;
  target: StepFighter;
  damage: number;
}

export type FightStep = ArriveStep | ResistStep | HitStep
| AttemptHitStep | EvadeStep | DeathStep | MoveStep
| CounterStep | MoveBackStep | PoisonStep;
