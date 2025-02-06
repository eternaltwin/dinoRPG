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
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { Status } from '@drpg/core/models/fight/DetailedFighter';
import { TFunction } from './translateFightStep.js';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { itemList } from '@drpg/core/models/item/ItemList';
import { FightText } from '@drpg/core/models/missions/specialActions';
import { SkillVisualEffect } from '@drpg/core/models/enums/SkillVisualEffect';
import {
	BASE_ASSAULT_ENERGY_COST,
	BASE_ENERGY_COST,
	ENERGY_RECOVERY_BASE_FACTOR
} from '@drpg/core/utils/fightConstants';

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

export function resolveItemName(itemId: number, t: TFunction) {
	const item = Object.values(itemList).find(item => item.itemId === itemId);
	if (!item) return 'inconnu';
	return t(`item.name.${item.name}`);
}

export function resolveItemImagePath(itemId: number) {
	const item = Object.values(itemList).find(item => item.itemId === itemId);
	if (!item) return 'inconnu';
	return item.display;
}

export function getSkillEnergy(skillId: number) {
	const skill = Object.values(skillList).find(skill => skill.id === skillId);
	if (!skill) return 0;
	return skill.energy;
}

export function setFighterEnergy(fighter: FighterRecap, newEnergy: number) {
	if (newEnergy > fighter.maxEnergy) {
		fighter.energy = fighter.maxEnergy;
	} else if (newEnergy < 0) {
		fighter.energy = 0;
	} else {
		fighter.energy = newEnergy;
	}
}

export function resolveMonsterName(monster: string, t: TFunction) {
	return t(`fight.monster.${monster}`);
}

export function resolveSkillVisualEffect(skillId: number) {
	return Object.values(skillList).find(skill => skill.id === skillId)?.visualEffect ?? SkillVisualEffect.TODO; // Default to TODO
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

export function transpileFight(
	fighters: Array<FighterRecap>,
	fight: Array<FightStep>,
	t: TFunction,
	startText: FightText | undefined,
	endText: FightText | undefined,
	victory: boolean,
	dojo?: boolean
) {
	const history: transpiled[] = [];
	// Basic tracking of active fighters, this may not cover all cases.
	const activeFighters: FighterRecap[] = [];
	// ID of the fighter whose turn it is
	let currentFighterId = 0;
	// Assault combo counter of the current fighter
	let currentFighterCombo = 0;
	// ID of the fighter countering an assault
	let counteringFighterId = 0;
	// Assault combo of the fighter countering
	let counteringFighterCombo = 0;
	let myFighter: FighterRecap | undefined;
	let timeLimit: number | undefined;
	if (startText) {
		history.push({
			action: DinoAction.TEXT,
			message: t(`quest.${startText.text}`)
		});
	}
	for (let i = 0; i < fight.length; i++) {
		const step = fight[i];

		switch (step.action) {
			case 'timeLimit':
				timeLimit = step.time;
				history.push({
					action: DinoAction.TIMELIMIT,
					time: step.time
				});
				break;
			case 'arrive':
				myFighter = fighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}
				activeFighters.push(myFighter);
				history.push({
					action: DinoAction.ADD,
					fighter: {
						props: [myFighter.type === 'boss' ? 'Boss' : null, myFighter.dark ? 'Dark' : null],
						dino: myFighter.type === 'dinoz' || myFighter.type === 'clone',
						life: myFighter.startingHp,
						maxLife: myFighter.maxHp,
						name:
							myFighter.type === 'dinoz' || myFighter.type === 'clone'
								? myFighter.name
								: resolveMonsterName(myFighter.name, t),
						side: myFighter.attacker,
						scale:
							myFighter.type === 'dinoz' || myFighter.type === 'clone'
								? myFighter.maxHp / 100
								: myFighter.size
									? myFighter.size / 100
									: 1,
						fid: myFighter.id,
						gfx: myFighter.display,
						entrance: EntranceEffect.JUMP // Actual default is stand, but it's way less classy
					}
				});
				// Initialize energy of fighter
				history.push({
					action: DinoAction.ENERGY,
					fighters: [{ fid: myFighter.id, energy: myFighter.energy }]
				});
				history.push({
					action: DinoAction.MAXENERGY,
					fighters: [{ fid: myFighter.id, energy: myFighter.maxEnergy }]
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
			case 'cursed':
				break;
			case 'death':
				history.push({
					action: DinoAction.DEAD,
					fid: step.fighter.id
				});
				activeFighters.filter(f => f.id != step.fighter.id);
				break;
			case 'disabledItems':
				break;
			case 'endHypnosis':
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
				myFighter = undefined;
				break;
			case 'hypnotize':
				break;
			case 'heal':
				history.push({
					action: DinoAction.REGEN,
					fid: step.fighter.id,
					amount: step.hp,
					lifeFx: { fx: step.fx }
				});
				break;
			case 'hit':
				// Determine the effect of the hit: by default it is based on the element
				// But it can be overridden by a special effect associated to the skill
				// eslint-disable-next-line no-case-declarations
				let hitFx = { fx: convertElementToLifeEffect(step.elements[0]) };
				// eslint-disable-next-line no-case-declarations
				let damageFx;
				if (step.skill) {
					const hit_skill = Object.values(skillList).find(skill => skill.id === step.skill);
					if (hit_skill && hit_skill.lifeEffect) {
						hitFx = hit_skill.lifeEffect;
					}
					if (hit_skill && hit_skill.damageEffect) {
						damageFx = hit_skill.damageEffect;
					}
				}
				history.push({
					action: DinoAction.DAMAGES,
					fid: step.fighter.id,
					tid: step.target.id,
					damages: step.damage,
					lifeFx: hitFx,
					effect: damageFx
				});

				myFighter = fighters.find(f => f.id === step.fighter.id);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fighter.id}`);
					return;
				}
				if (currentFighterId === myFighter.id && currentFighterCombo === 0) {
					// First assault of fighter whose turn it is
					setFighterEnergy(myFighter, myFighter.energy - BASE_ASSAULT_ENERGY_COST - BASE_ENERGY_COST);
					currentFighterCombo++;
				} else if (currentFighterId === myFighter.id && currentFighterCombo > 0) {
					// Subsequent assault combo of fighter whose turn it is
					// Each combo increases the cost by 1, in other words the combo number
					setFighterEnergy(myFighter, myFighter.energy - BASE_ENERGY_COST - currentFighterCombo);
					currentFighterCombo++;
				} else {
					// It is a counter
					// Update the ID of the fighter countering and reset the counter combo
					if (counteringFighterId !== myFighter.id) {
						counteringFighterId = myFighter.id;
						counteringFighterCombo = 0;
					}
					// Each combo increases the cost by 1, in other words the combo number
					setFighterEnergy(myFighter, myFighter.energy - BASE_ENERGY_COST - counteringFighterCombo);
					counteringFighterCombo++;
				}
				history.push({
					action: DinoAction.ENERGY,
					fighters: [{ fid: myFighter.id, energy: myFighter.energy }]
				});
				myFighter = undefined;
				break;
			case 'itemUse':
				history.push({
					action: DinoAction.OBJECT,
					fid: step.fighter.id,
					name: resolveItemName(step.itemId, t),
					item: resolveItemImagePath(step.itemId)
				});
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
			case 'moveBack':
				history.push({
					action: DinoAction.RETURN,
					fid: step.fid
				});
				break;
			case 'moveTo':
				if (step.skill) {
					const skill = Object.values(skillList).find(skill => skill.id === step.skill);
					history.push({
						action: DinoAction.GOTO,
						fid: step.fid,
						tid: step.tid,
						effect: skill?.gotoEffect,
						shadeColor: skill?.shadeColor
					});
				} else {
					history.push({
						action: DinoAction.GOTO,
						fid: step.fid,
						tid: step.tid
					});
				}
				break;
			// TODO: more infrastructure needed to support this otherwise this errors because "fighters" is all fighters, even dead ones
			case `newTurn`:
				// Note the ID of the fighter playing a turn and reset the combo and counter stats
				currentFighterId = step.fighter.id;
				currentFighterCombo = 0;
				counteringFighterId = 0;
				counteringFighterCombo = 0;
				// Decrement the time bar if a time limit and time bar were set
				if (timeLimit) {
					timeLimit -= step.delta;
					history.push({
						action: DinoAction.PAUSE,
						time: step.delta
					});
				}
				// eslint-disable-next-line no-case-declarations
				const energyStep = {
					action: DinoAction.ENERGY,
					fighters: [] as {
						fid: number;
						energy: number;
					}[]
				};
				activeFighters.forEach(activeF => {
					if (activeF.id !== step.fighter.id) {
						const myFighter = fighters.find(f => activeF.id === f.id);
						if (!myFighter) {
							return;
						}
						setFighterEnergy(
							myFighter,
							Math.round(myFighter.energy + myFighter.energyRecovery * step.delta * ENERGY_RECOVERY_BASE_FACTOR)
						);
						energyStep.fighters.push({ fid: myFighter.id, energy: myFighter.energy });
					}
				});
				// Update energy of fighters except the one that is playing a new turn.
				history.push(energyStep as transpiled);
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
			case 'skillAnnounce':
				myFighter = fighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}
				// Announce the skill
				history.push({
					action: DinoAction.ANNOUNCE,
					fid: step.fid,
					message: resolveSkillName(step.skill, t)
				});
				// Update the energy
				setFighterEnergy(myFighter, myFighter.energy - getSkillEnergy(step.skill));
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
			case 'skillActivate':
				myFighter = fighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}
				// eslint-disable-next-line no-case-declarations
				const skill = Object.values(skillList).find(skill => skill.id === step.skill);
				if (step.targets.length > 0) {
					if (!skill) {
						console.warn(`Cannot find skill ${step.skill}`);
					}
					history.push({
						action: DinoAction.SKILL,
						skill: resolveSkillVisualEffect(step.skill),
						details: {
							fid: step.fid,
							targets: step.targets.map(t => {
								return { id: t.tid, life: t.damages };
							}),
							color: skill?.color,
							type: skill?.fxType,
							fx: skill?.fx
						}
					});
					// Play a second effect if specified
					if (skill?.VisualEffectBis) {
						history.push({
							action: DinoAction.SKILL,
							skill: skill.VisualEffectBis,
							details: {
								fid: step.fid,
								targets: step.targets.map(t => {
									return { id: t.tid };
								}),
								color: skill?.color,
								type: skill?.fxType,
								fx: skill?.fx
							}
						});
					}
					// Remove energy per target hit
					setFighterEnergy(myFighter, myFighter.energy - step.targets.length * BASE_ENERGY_COST);
					history.push({
						action: DinoAction.ENERGY,
						fighters: [{ fid: myFighter.id, energy: myFighter.energy }]
					});
					myFighter = undefined;
				} else {
					history.push({
						action: DinoAction.SKILL,
						skill: resolveSkillVisualEffect(step.skill),
						details: {
							fid: step.fid,
							targets: [{ id: step.fid }],
							color: skill?.color,
							type: skill?.fxType,
							fx: skill?.fx
						}
					});
				}
				// Black hole and sylphide extract the fighter from the fight so extract it from the list of actives too
				if (step.skill && (step.skill == Skill.TROU_NOIR || step.skill == Skill.SYLPHIDES)) {
					activeFighters.filter(f => f.id != step.fid);
				}
				myFighter = undefined;
				break;
			case 'skillExpire':
				break;
			case 'notify': {
				history.push({
					action: DinoAction.NOTIFY,
					fids: step.fids,
					notification: step.notification
				});
				break;
			}
			case 'stealGold':
				break;
			case 'survive':
				break;
		}
	}
	if (endText && victory) {
		history.push({
			action: DinoAction.TEXT,
			message: t(`quest.${endText.text}`)
		});
	}
	if (dojo) {
		history.push({
			action: DinoAction.FINISH,
			right: FinishState.STAND,
			left: FinishState.STAND
		});
	} else if (victory) {
		history.push({
			action: DinoAction.FINISH,
			right: FinishState.STAND,
			left: FinishState.RUN
		});
	} else {
		history.push({
			action: DinoAction.FINISH,
			right: FinishState.STAND,
			left: FinishState.STAND
		});
	}

	return history;
}
