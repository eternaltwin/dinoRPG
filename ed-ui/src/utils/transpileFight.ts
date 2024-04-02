import { FightStep, InitStepFighter } from '@drpg/core/models/fight/FightStep';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { GroundEnum } from '@drpg/core/models/enums/GroundEnum';
import { DamagesEffect, DinoAction, EntranceEffect, FinishState, transpiled } from '@drpg/core/models/fight/transpiler';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { Status } from '@drpg/core/models/fight/DetailedFighter';
import { TFunction } from './translateFightStep.js';

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

export function resolveLifeEffect(step: FightStep) {
	if (step.action === 'hit') {
		if (step.elements.length > 0) {
			const element = step.elements[0];
			switch (element) {
				case 6:
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
		if (step.skill && step.skill === 51403) {
			// POISON
			return 4;
		}
		if (step.skill && step.skill === 31406) {
			// SANG ACIDE
			return 3;
		}
	}
	return 0;
}

export function resolveSkillName(skillId: number, t: TFunction) {
	const skill = Object.values(skillList).find(skill => skill.id === skillId);
	if (!skill) return 'inconnu';
	return t(`skill.name.${skill.name}`);
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
			return 0;
		case Status.TORCHED:
			return 1;
		case Status.INTANGIBLE:
			return 2;
		case Status.FLYING:
			return 3;
		case Status.SLOWED:
			return 4;
		case Status.QUICKENED:
			return 5;
		case Status.PETRIFIED:
			return 6;
		case Status.SHIELDED:
			return 7;
		case Status.BLESSED:
			return 8;
		case Status.POISONED:
			return 9;
		case Status.HEALING:
			return 10;
		case Status.BURNED:
			return 11;
		case Status.LOCKED:
			return 12;
		case Status.DAZZLED:
			return 13;
		case Status.STUNNED:
			return 14;
		default:
			return;
	}
}

export function transpileFight(fight: Array<FightStep>, t: TFunction) {
	const history: transpiled[] = [];
	const fighters: InitStepFighter[] = [];
	let myFighter: InitStepFighter | undefined;
	let startOfFight = true;
	for (let i = 0; i < fight.length; i++) {
		const step = fight[i];
		if (i > 0 && fight[i - 1].action === 'arrive' && step.action !== 'arrive' && startOfFight) {
			startOfFight = false;
			history.push({
				action: DinoAction.MAXENERGY,
				fighters: fighters.map(f => {
					return { fid: f.id, maxEnergy: f.maxEnergy };
				})
			});
			history.push({
				action: DinoAction.ENERGY,
				fighters: fighters.map(f => {
					return { fid: f.id, energy: f.energy };
				})
			});
		}
		switch (step.action) {
			case 'arrive':
				history.push({
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: step.fighter.type === 'dinoz',
						life: step.fighter.startingHp,
						maxLife: step.fighter.maxLife,
						name: step.fighter.type !== 'dinoz' ? resolveMonsterName(step.fighter.name, t) : step.fighter.name,
						side: step.fighter.attacker,
						scale: step.fighter.type === 'dinoz' ? step.fighter.maxLife / 100 : 1,
						fid: step.fighter.id,
						gfx: step.fighter.display,
						entrance: EntranceEffect.JUMP
					}
				});
				if (!startOfFight) {
					history.push({
						action: DinoAction.MAXENERGY,
						fighters: [
							{
								fid: step.fighter.id,
								maxEnergy: step.fighter.maxEnergy
							}
						]
					});
					history.push({
						action: DinoAction.ENERGY,
						fighters: [
							{
								fid: step.fighter.id,
								energy: step.fighter.energy
							}
						]
					});
				}
				fighters.push(step.fighter);
				break;
			case 'activateEnvironment':
				break;
			case 'addStatus':
				// eslint-disable-next-line no-case-declarations
				const status = resolveStatus(step.status);
				if (status) {
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
						fx: resolveLifeEffect(step)
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
				history.push({
					action: DinoAction.RETURN,
					fid: step.fighter.id
				});
				break;
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
				// eslint-disable-next-line no-case-declarations
				const statusRemoved = resolveStatus(step.status);
				if (statusRemoved) {
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
				myFighter = fighters.find(f => f.id === step.fighter.id);
				if (!myFighter) break;
				myFighter.energy -= step.energy;
				history.push({
					action: DinoAction.ANNOUNCE,
					fid: step.fighter.id,
					message: resolveSkillName(step.skill, t)
				});
				if (step.targets.length > 0) {
					let searchTarget = true;
					let j = 1;
					const targets: {
						id: number;
						life?: number;
					}[] = [];
					while (searchTarget) {
						const nextAction = fight[i + j];
						if (nextAction.action === 'hit') {
							targets.push({ id: nextAction.target.id, life: nextAction.damage });
							j++;
						} else {
							step.targets.forEach(t => {
								targets.push({ id: t.id, life: 0 });
							});
							searchTarget = false;
						}
					}
					const arrUniq = [
						...new Map(
							targets
								.slice()
								.reverse()
								.map(v => [v.id, v])
						).values()
					].reverse();
					history.push({
						action: DinoAction.SKILL,
						skill: resolveSkillEffect(step.skill),
						details: {
							fid: step.fighter.id,
							targets: arrUniq
						}
					});
					i += j - 1;
				} else {
					const skillEffect = resolveSkillEffect(step.skill);
					history.push({
						action: DinoAction.SKILL,
						skill: skillEffect,
						details: {
							fid: step.fighter.id,
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
	}
	history.push({
		action: DinoAction.FINISH,
		right: FinishState.GUARD,
		left: FinishState.RUN
	});
	return history;
}
