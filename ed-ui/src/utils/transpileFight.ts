import { FightStep, InitStepFighter } from '@drpg/core/models/fight/FightStep';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { GroundEnum } from '@drpg/core/models/enums/GroundEnum';
import { DinoAction, transpiled } from '@drpg/core/models/fight/transpiler';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { Status } from '@drpg/core/models/fight/DetailedFighter';

export function resolveFightingPlace(placeId: number) {
	const place = Object.values(placeList).find(p => p.placeId === placeId);
	if (!place) return;
	return {
		bg: place.background,
		top: place.top ?? 120,
		bottom: place.bottom ?? 0,
		right: 0,
		ground: place.ground ?? GroundEnum.NONE
	};
}

export function resolveLifeEffect(elements: number[]) {
	const element = elements[0];
	switch (element) {
		case 0:
			return 0;
		case 1:
			return 8;
		case 2:
			return 9;
		case 3:
			return 10;
		case 4:
			return 11;
		case 5:
			return 12;
		default:
			return 0;
	}
}

export function resolveSkillName(skillId: number) {
	//TODO translate skill with i18n
	return Object.values(skillList).find(skill => skill.id === skillId)?.name ?? 'inconnu';
}

export function resolveStatus(status: Status) {
	switch (status) {
		case Status.ASLEEP:
			return 0;
		case Status.SLOWED:
			return 5;
		case Status.PETRIFIED:
			return 7;
		case Status.POISONED:
			return 9;
		case Status.BURNED:
			return 2;
		case Status.LOCKED:
			return 12;
		case Status.DAZZLED:
			return 13;
		case Status.STUNNED:
			return 14;
		case Status.TORCHED:
			return 1;
		case Status.INTANGIBLE:
			return 3;
		case Status.FLYING:
			return 4;
		case Status.QUICKENED:
			return 6;
		case Status.SHIELDED:
			return 10;
		case Status.BLESSED:
			return 8;
		case Status.HEALING:
			return 11;
	}
}

export function transpileFight(fight: Array<FightStep>) {
	const history: transpiled[] = [];
	const fighters: InitStepFighter[] = [];
	let myFighter: InitStepFighter | undefined;
	fight.forEach(step => {
		switch (step.action) {
			case 'arrive':
				history.push({
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: step.fighter.id > 0,
						life: step.fighter.startingHp,
						maxLife: step.fighter.maxLife,
						//TODO translate monstername with i18n
						name: step.fighter.name,
						side: step.fighter.attacker,
						scale: step.fighter.id > 0 ? step.fighter.maxLife / 100 : 1,
						fid: step.fighter.id,
						gfx: step.fighter.display
					}
				});
				history.push({
					action: DinoAction.MAXENERGY,
					fighters: [
						{
							fid: step.fighter.id,
							energy: step.fighter.maxEnergy - 100
						}
					]
				});
				history.push({
					action: DinoAction.ENERGY,
					fighters: [
						{
							fid: step.fighter.id,
							energy: step.fighter.energy - 100
						}
					]
				});
				fighters.push(step.fighter);
				break;
			case 'activateEnvironment':
				break;
			case 'addStatus':
				history.push({
					action: DinoAction.STATUS,
					fid: step.fighter.id,
					status: resolveStatus(step.status)
				});
				break;
			case 'attemptHit':
				break;
			case 'counter':
				break;
			case 'cursed':
				break;
			case 'death':
				history.push({
					action: DinoAction.DEAD,
					fid: step.fighter.id
				});
				break;
			case 'disabledItems':
				break;
			case 'endHypnosis':
				break;
			case 'evade':
				break;
			case 'expireEnvironment':
				break;
			case 'gainEnergy':
				break;
			case 'hypnotize':
				break;
			case 'heal':
				history.push({
					action: DinoAction.REGEN,
					fid: step.fighter.id,
					amount: step.hp
				});
				break;
			case 'hit':
				history.push({
					action: DinoAction.DAMAGES,
					fid: step.fighter.id,
					tid: step.target.id,
					damages: step.damage,
					lifeFx: {
						fx: resolveLifeEffect(step.elements)
					}
				});
				break;
			case 'itemUse':
				break;
			case 'leave':
				break;
			case 'looseHp':
				break;
			case 'loseSphere':
				break;
			case 'miss':
				break;
			case 'moveBack':
				return {
					action: DinoAction.RETURN,
					fid: step.fighter.id
				};
			case 'moveTo':
				history.push({
					action: DinoAction.GOTO,
					fid: step.fighter.id,
					tid: step.target.id
				});
				break;
			case 'reduceEnergy':
				break;
			case 'removeCostume':
				break;
			case 'removeStatus':
				history.push({
					action: DinoAction.NOSTATUS,
					fid: step.fighter.id,
					status: resolveStatus(step.status)
				});
				break;
			case 'resist':
				break;
			case 'revive':
				break;
			case 'setCostume':
				break;
			case 'skillActivate':
				myFighter = fighters.find(f => f.id === step.fighter.id);
				if (!myFighter) break;
				myFighter.energy -= step.energy;
				history.push({
					action: DinoAction.ANNOUNCE,
					fid: step.fighter.id,
					message: resolveSkillName(step.skill)
				});
				history.push({
					action: DinoAction.SKILL,
					skill: step.skill,
					details: {
						fid: step.fighter.id
					}
				});
				history.push({
					action: DinoAction.ENERGY,
					fighters: [
						{
							fid: step.fighter.id,
							energy: myFighter.energy
						}
					]
				});
				break;
			case 'skillExpire':
				break;
			case 'stealGold':
				break;
			case 'survive':
				break;
		}
		return;
	});
	return history;
}
