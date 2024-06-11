import { FightStep } from '@drpg/core/models/fight/FightStep';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { GroundEnum } from '@drpg/core/models/enums/GroundEnum';
import {
	DamagesEffect,
	DinoAction,
	EntranceEffect,
	FinishState,
	LifeEffect,
	StatusEffect,
	transpiled
} from '@drpg/core/models/fight/transpiler';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { Status } from '@drpg/core/models/fight/DetailedFighter';
import { TFunction } from './translateFightStep.js';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import { ElementType } from '@drpg/core/models/enums/ElementType';

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

export function convertElementToLifeEffect(element: ElementType) {
	switch (element) {
		case ElementType.VOID:
			return LifeEffect.Normal;
		case ElementType.FIRE:
			return LifeEffect.Fire;
		case ElementType.WOOD:
			return LifeEffect.Wood;
		case ElementType.WATER:
			return LifeEffect.Water;
		case ElementType.LIGHTNING:
			return LifeEffect.Lightning;
		case ElementType.AIR:
			return LifeEffect.Air;
		default:
			return LifeEffect.Normal;
	}
}

export function resolveSkillName(skillId: number, t: TFunction) {
	const skill = Object.values(skillList).find(skill => skill.id === skillId);
	if (!skill) return 'inconnu';
	return t(`skill.name.${skill.name}`);
}

export function getSkillEnergy(skillId: number) {
	const skill = Object.values(skillList).find(skill => skill.id === skillId);
	if (!skill) return 0;
	return skill.energy;
}

export function resolveMonsterName(monster: string, t: TFunction) {
	return t(`fight.monster.${monster}`);
}

export function resolveSkillEffect(skillId: number) {
	return Object.values(skillList).find(skill => skill.id === skillId)?.visualEffect ?? 0;
}

export function resolveStatus(status: Status) {
	switch (status) {
		case Status.ASLEEP:
			return StatusEffect.Sleep;
		case Status.TORCHED:
			return StatusEffect.Flames;
		case Status.BURNED:
			return StatusEffect.Burn;
		case Status.INTANGIBLE:
			return StatusEffect.Intang;
		case Status.FLYING:
			return StatusEffect.Fly;
		case Status.SLOWED:
			return StatusEffect.Slow;
		case Status.QUICKENED:
			return StatusEffect.Quick;
		case Status.PETRIFIED:
			return StatusEffect.Stoned;
		case Status.SHIELDED:
			return StatusEffect.Shield;
		case Status.BLESSED:
			return StatusEffect.Bless;
		case Status.POISONED:
			return StatusEffect.Poison;
		case Status.HEALING:
			return StatusEffect.Heal;
		case Status.LOCKED:
			return StatusEffect.MonoElt;
		case Status.DAZZLED:
			return StatusEffect.Dazzled;
		case Status.STUNNED:
			return StatusEffect.Stun;
		default:
			return -1;
	}
}

export function transpileFight(fighters: Array<FighterRecap>, fight: Array<FightStep>, t: TFunction) {
	const history: transpiled[] = [];
	let myFighter: FighterRecap | undefined;
	for (let i = 0; i < fight.length; i++) {
		const step = fight[i];

		switch (step.action) {
			case 'arrive':
				myFighter = fighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}
				history.push({
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: myFighter.type === 'dinoz' || myFighter.type === 'clone',
						life: myFighter.startingHp,
						maxLife: myFighter.maxHp,
						name:
							myFighter.type === 'dinoz' || myFighter.type === 'clone'
								? myFighter.name
								: resolveMonsterName(myFighter.name, t),
						side: myFighter.attacker,
						scale: myFighter.type === 'dinoz' || myFighter.type === 'clone' ? myFighter.maxHp / 100 : 1,
						fid: myFighter.id,
						gfx: myFighter.display,
						entrance: EntranceEffect.JUMP
					}
				});
				myFighter = undefined;
				break;
			case 'activateEnvironment':
				break;
			case 'addStatus':
				// eslint-disable-next-line no-case-declarations
				const status = resolveStatus(step.status);
				if (status >= 0) {
					history.push({
						action: DinoAction.STATUS,
						fid: step.fighter.id,
						status: status
					});
				}
				break;
			case 'attemptHit':
				if (fight[i + 1].action !== 'hit') {
					history.push({
						action: DinoAction.DAMAGES,
						fid: step.fighter.id,
						tid: step.target.id,
						damages: 0,
						effect: DamagesEffect.Missed
					});
				}
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
				myFighter = fighters.find(f => f.id === step.fighter.id);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fighter.id}`);
					return;
				}
				myFighter.energy += step.energy;
				history.push({
					action: DinoAction.ENERGY,
					fighters: [{ fid: step.fighter.id, energy: step.energy }]
				});
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
						fx: convertElementToLifeEffect(step.elements[0])
					}
				});
				break;
			case 'itemUse':
				break;
			case 'leave':
				break;
			case 'looseHp':
				history.push({
					action: DinoAction.LOST,
					fid: step.fid,
					amount: step.hp,
					lifeFx: {
						fx: step.fx
					}
				});
				break;
			case 'loseSphere':
				break;
			case 'miss':
				break;
			case 'moveBack':
				history.push({
					action: DinoAction.RETURN,
					fid: step.fid
				});
				break;
			case 'moveTo':
				history.push({
					action: DinoAction.GOTO,
					fid: step.fid,
					tid: step.tid
				});
				break;
			case 'reduceEnergy':
				break;
			case 'removeCostume':
				break;
			case 'removeStatus':
				// eslint-disable-next-line no-case-declarations
				const statusRemoved = resolveStatus(step.status);
				if (statusRemoved >= 0) {
					history.push({
						action: DinoAction.NOSTATUS,
						fid: step.fighter.id,
						status: statusRemoved
					});
				}
				break;
			case 'resist':
				break;
			case 'revive':
				break;
			case 'setCostume':
				break;
			case 'skillActivate':
				myFighter = fighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}
				myFighter.energy -= getSkillEnergy(step.skill);
				history.push({
					action: DinoAction.ANNOUNCE,
					fid: step.fid,
					message: resolveSkillName(step.skill, t)
				});
				if (step.targets.length > 0) {
					history.push({
						action: DinoAction.SKILL,
						skill: resolveSkillEffect(step.skill),
						details: {
							fid: step.fid,
							targets: step.targets.map(t => {
								return { id: t.tid, life: t.damages ?? 0 };
							}),
							color: Object.values(skillList).find(skill => skill.id === step.skill)?.color,
							type: Object.values(skillList).find(skill => skill.id === step.skill)?.auraType,
							fx: Object.values(skillList).find(skill => skill.id === step.skill)?.fx
						}
					});
				} else {
					history.push({
						action: DinoAction.SKILL,
						skill: resolveSkillEffect(step.skill),
						details: {
							fid: step.fid,
							targets: [{ id: step.fid }],
							color: Object.values(skillList).find(skill => skill.id === step.skill)?.color,
							type: Object.values(skillList).find(skill => skill.id === step.skill)?.auraType,
							fx: Object.values(skillList).find(skill => skill.id === step.skill)?.fx
						}
					});
				}
				history.push({
					action: DinoAction.ENERGY,
					fighters: [
						{
							fid: step.fid,
							energy: myFighter.energy
						}
					]
				});
				myFighter = undefined;
				break;
			case 'skillExpire':
				break;
			case 'stealGold':
				break;
			case 'survive':
				break;
		}
	}
	history.push({
		action: DinoAction.FINISH,
		right: FinishState.GUARD,
		left: FinishState.RUN
	});
	return history;
}
