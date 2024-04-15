import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { FightStep, StepFighter } from '@drpg/core/models/fight/FightStep';
import { formatText } from './formatText.js';
import { BadStatus, GoodStatus } from '@drpg/core/models/fight/DetailedFighter';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { ElementNames } from '@drpg/core/models/enums/ElementType';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import { sessionStore } from '../store/index.js';
import { getSkillEnergy } from '../utils/transpileFight.js';

export type TFunction = (key: string, data?: Record<string, string | number>) => string;

const IGNORE_STEPS = ['moveTo', 'moveBack', 'resist'];
const DISPLAYED_STATUSES = [...GoodStatus, ...BadStatus];

const getFighterName = (fighter: StepFighter | number, t: TFunction) => {
	const store = sessionStore().getFightResult;
	let name = '';
	if (!store) return name;
	const fighters = store.fighters as FighterRecap[];
	let attacker: boolean;
	if (typeof fighter === 'number') {
		const tempo = fighters.find(f => f.id === fighter);
		if (!tempo) return name;
		name = tempo.name;
		attacker = tempo.attacker;
	} else {
		switch (fighter.type) {
			case 'dinoz':
				name = fighter.name;
				break;
			case 'clone':
				name = `${fighter.name} (${t('fight.clone')})`;
				break;
			default:
				name = t(`fight.monster.${fighter.name}`);
				break;
		}
		attacker = fighter.attacker;
	}

	return `${attacker ? ':attack:' : ':defense:'} ${name}`;
};

const getStatusName = (status: string, t: TFunction) => t(`fight.status.${status}`);

const getTranslatedString = (fightStep: FightStep, t: TFunction) => {
	if (IGNORE_STEPS.includes(fightStep.action)) {
		return '';
	}

	switch (fightStep.action) {
		case 'arrive':
			return t(`fight.step.${fightStep.action}`, {
				name: getFighterName(fightStep.fid, t)
			});
		case 'resist':
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.dinoz, t)
			});
		case 'hit': {
			if (fightStep.skill) {
				return t(`fight.step.hit-skill`, {
					fighter: getFighterName(fightStep.fighter, t),
					damage: fightStep.damage,
					target: getFighterName(fightStep.target, t),
					skill: t(`skill.name.${skillList[fightStep.skill].name}`),
					elements: fightStep.elements.map(element => `:${ElementNames[element]}:`).join(', ')
				});
			}
			return t('fight.step.hit', {
				fighter: getFighterName(fightStep.fighter, t),
				damage: fightStep.damage,
				target: getFighterName(fightStep.target, t),
				elements: fightStep.elements.map(element => `:${ElementNames[element]}:`).join(', ')
			});
		}
		case 'moveTo':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fid, t),
				target: getFighterName(fightStep.tid, t)
			});
		case 'moveBack':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fid, t)
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
		case 'survive':
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.dinoz, t)
			});
		case 'skillActivate':
			if (fightStep.targets.length) {
				return t(`fight.step.skillActivate-targets`, {
					dinoz: getFighterName(fightStep.fid, t),
					skill: t(`skill.name.${skillList[fightStep.skill].name}`),
					energy: getSkillEnergy(fightStep.skill),
					targets: fightStep.targets.map(target => getFighterName(target.tid, t)).join(', ')
				});
			}
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.fid, t),
				skill: t(`skill.name.${skillList[fightStep.skill].name}`),
				energy: getSkillEnergy(fightStep.skill)
			});
		case 'skillExpire':
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.dinoz, t),
				skill: t(`skill.name.${skillList[fightStep.skill].name}`)
			});
		case 'looseHp':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fid, t),
				hp: fightStep.hp
			});
		case 'addStatus':
			if (!DISPLAYED_STATUSES.includes(fightStep.status)) {
				return '';
			}
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				status: getStatusName(fightStep.status, t)
			});
		case 'removeStatus':
			if (!DISPLAYED_STATUSES.includes(fightStep.status)) {
				return '';
			}
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				status: getStatusName(fightStep.status, t)
			});
		case 'heal':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				hp: fightStep.hp
			});
		case 'itemUse':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				item: t(`item.name.${itemNameList[fightStep.itemId]}`)
			});
		case 'hypnotize':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		case 'gainEnergy':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				energy: fightStep.energy
			});
		default:
			return JSON.stringify(fightStep);
	}
};

const translateFightStep = (fightStep: FightStep, t: TFunction) => {
	return formatText(getTranslatedString(fightStep, t));
};

export default translateFightStep;
