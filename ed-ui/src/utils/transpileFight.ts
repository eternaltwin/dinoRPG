import { FightStep } from '@drpg/core/models/fight/FightStep';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { GroundEnum } from '@drpg/core/models/enums/GroundEnum';

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
export enum DinoAction {
	ADD,
	ANNOUNCE,
	OBJECT,
	LOST,
	STATUS,
	NOSTATUS,
	REGEN,
	DAMAGES,
	SKILL,
	DEAD,
	GOTO,
	RETURN,
	PAUSE,
	FINISH,
	ADDCASTLE,
	TIMELIMIT,
	ATTACKCASTLE,
	DISPLAY,
	TEXT,
	TALK,
	ESCAPE,
	MOVETO,
	FLIP,
	SPAWNTOY,
	DESTROYTOY,
	WAIT,
	LOG,
	NOTIFY,
	ENERGY,
	MAXENERGY
}
export function transpileFight(fight: Array<FightStep>) {
	return fight.map(step => {
		switch (step.action) {
			case 'arrive':
				return {
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: step.fighter.id > 0,
						life: 100,
						name: step.fighter.name,
						side: step.fighter.attacker,
						scale: step.fighter.id > 0 ? (step.fighter.maxLife ?? 100) / 100 : 1,
						fid: step.fighter.id,
						gfx: step.fighter.display
					}
				};
			case 'activateEnvironment':
				break;
			case 'addStatus':
				break;
			case 'attemptHit':
				break;
			case 'counter':
				break;
			case 'cursed':
				break;
			case 'death':
				return {
					action: DinoAction.DEAD,
					fid: step.fighter.id
				};
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
				break;
			case 'hit':
				return {
					action: DinoAction.DAMAGES,
					fid: step.fighter.id,
					tid: step.target.id,
					damages: step.damage,
					lifeFx: {
						fx: resolveLifeEffect(step.elements)
					}
				};
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
				return {
					action: DinoAction.GOTO,
					fid: step.fighter.id,
					tid: step.target.id
				};
			case 'reduceEnergy':
				break;
			case 'removeCostume':
				break;
			case 'removeStatus':
				break;
			case 'resist':
				break;
			case 'revive':
				break;
			case 'setCostume':
				break;
			case 'skillActivate':
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
}
