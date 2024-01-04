import { FightStep, StepFighter } from '@drpg/core/models/fight/FightStep';

type TFunction = (key: string, data?: Record<string, string | number>) => string;

const getFighterName = (fighter: StepFighter, t: TFunction) =>
	fighter.type === 'dinoz' ? fighter.name : t(`fight.monster.${fighter.name}`);

const translateFightStep = (fightStep: FightStep, t: TFunction) => {
	switch (fightStep.action) {
		case 'arrive':
			return t(`fight.step.${fightStep.action}`, {
				name: getFighterName(fightStep.fighter, t)
			});
		case 'resist':
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.dinoz, t)
			});
		case 'hit': {
			return t('fight.step.hit', {
				fighter: getFighterName(fightStep.fighter, t),
				damage: fightStep.damage,
				target: getFighterName(fightStep.target, t)
			});
		}
		case 'poison':
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.fighter, t),
				damage: fightStep.damage,
				target: getFighterName(fightStep.target, t)
			});
		case 'moveTo':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				target: getFighterName(fightStep.target, t)
			});
		case 'moveBack':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		case 'attemptHit': {
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				target: getFighterName(fightStep.target, t)
			});
		}
		case 'evade':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		case 'death':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		case 'counter':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				opponent: getFighterName(fightStep.opponent, t)
			});
		default:
			return JSON.stringify(fightStep);
	}
};

export default translateFightStep;
