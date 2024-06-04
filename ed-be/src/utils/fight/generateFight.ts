import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { DetailedFighter, FighterResultFiche, Status } from '@drpg/core/models/fight/DetailedFighter';
import { DinozToGetFighter, FightConfiguration } from '@drpg/core/models/fight/FightConfiguration';
import { FightProcessResult, FightStats } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { Item } from '@drpg/core/models/item/ItemList';
import {
	addStatus,
	applyStrategy,
	checkDeaths,
	getLimitedRandomOpponent,
	hasStatus,
	heal,
	initStepFighter,
	playFighterTurn,
	stepFighter,
	updateStat
} from './fightMethods.js';
import { getBasicElementDamage } from './getDamage.js';
import randomBetween from './randomBetween.js';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { Monster, monsterList } from '@drpg/core/models/fight/MonsterList';

export type DetailedFight = {
	place: PlaceEnum;
	loser: 'attackers' | 'defenders' | null;
	steps: FightStep[];
	initialDinozList: DinozToGetFighter[];
	fighters: DetailedFighter[];
	time: number;
	lastFighterId: number | undefined;
	environment?: {
		type: Skill;
		caster: DetailedFighter;
		turnsLeft: number;
	};
	timeManipulatorUsed?: boolean;
	temporalStabilityUsed?: boolean;
	stats: {
		attack: FightStats;
		defense: FightStats;
	};
};

const orderFighters = (fightData: DetailedFight) => {
	fightData.fighters = fightData.fighters.sort((a, b) => {
		// Last if hp <= 0 or escaped
		if (a.hp <= 0 || a.escaped) return 1;
		if (b.hp <= 0 || b.escaped) return -1;

		// Random if times are equal
		if (a.time === b.time) {
			return Math.random() > 0.5 ? 1 : -1;
		}
		// Lowest time first
		return a.time - b.time;
	});
};

const generateFight = (config: FightConfiguration, place: PlaceEnum): FightProcessResult => {
	const fightData: DetailedFight = {
		loser: null,
		steps: [] as FightStep[],
		initialDinozList: [...config.initialDinozList],
		fighters: config.fighters,
		time: 0,
		lastFighterId: undefined,
		place: config.place,
		stats: {
			attack: {
				startingHp: 0,
				hpLost: 0,
				hpHealed: 0,
				attacks: 0,
				groupAttacks: 0,
				multiHits: 0,
				assaults: 0,
				evasions: 0,
				counters: 0,
				poisoned: 0,
				petrified: 0,
				elements: {
					[ElementType.FIRE]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.WOOD]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.WATER]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.LIGHTNING]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.AIR]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.VOID]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					}
				}
			},
			defense: {
				startingHp: 0,
				hpLost: 0,
				hpHealed: 0,
				attacks: 0,
				groupAttacks: 0,
				multiHits: 0,
				assaults: 0,
				evasions: 0,
				counters: 0,
				poisoned: 0,
				petrified: 0,
				elements: {
					[ElementType.FIRE]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.WOOD]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.WATER]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.LIGHTNING]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.AIR]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					},
					[ElementType.VOID]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0,
					}
				}
			}
		}
	};

	fightData.fighters.forEach(fighter => {
		// HP stats
		updateStat(fightData, fighter, 'startingHp', fighter.startingHp);

		// Handle costumes
		if (fighter.costume) {
			fightData.steps.push({
				action: 'setCostume',
				fighter: initStepFighter(fighter),
				costume: fighter.costume.name
			});
		}

		// Add arrive step for all fighters
		fightData.steps.push({
			action: 'arrive',
			fid: fighter.id
		});

		// Process all skills and items that take effect at the beginning of the fight

		// Temporal reduction
		if (fighter.items.some(item => item.itemId === Item.TEMPORAL_REDUCTION)) {
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(fighter),
				itemId: Item.TEMPORAL_REDUCTION
			});
		}

		// Curse locker
		if (fighter.items.some(item => item.itemId === Item.TEMPORAL_REDUCTION)) {
			const opponent = getLimitedRandomOpponent(fightData, fighter, ['dinoz']);

			if (opponent) {
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(fighter),
					itemId: Item.CURSE_LOCKER
				});

				// Find weakest assault element
				const weakestElement = +[
					ElementType.FIRE,
					ElementType.WOOD,
					ElementType.WATER,
					ElementType.LIGHTNING,
					ElementType.AIR
				].sort((a, b) => getBasicElementDamage(opponent, a) - getBasicElementDamage(opponent, b))[0] as ElementType;

				// Lock opponent for 3 turns
				opponent.element = weakestElement;
				opponent.locked = 4;
				addStatus(fightData, opponent, Status.LOCKED);
			}
		}

		// Cleptomania
		if (fighter.skills.some(skill => skill.id === Skill.CLEPTOMANE)) {
			const opponent = getLimitedRandomOpponent(fightData, fighter, ['dinoz']);

			if (opponent) {
				const nonMagicItems = opponent.items.filter(item => !item.isRare);

				// Remove non magic items
				opponent.items = opponent.items.filter(item => item.isRare);

				// Add skill step
				fightData.steps.push({
					action: 'skillActivate',
					fid: fighter.id,
					skill: Skill.CLEPTOMANE,
					targets: [{ tid: opponent.id }]
				});

				// Add disabled items step
				fightData.steps.push({
					action: 'disabledItems',
					fighter: stepFighter(opponent),
					items: nonMagicItems.map(item => item.itemId)
				});
			}
		}

		// JOKER
		if (fighter.skills.some(skill => skill.id === Skill.JOKER)) {
			// 50% chance to get 25% / -25% speed
			fighter.stats.speed.global *= Math.random() > 0.5 ? 1.25 : 0.75;

			// Add skill step
			fightData.steps.push({
				action: 'skillActivate',
				fid: fighter.id,
				skill: Skill.JOKER,
				targets: []
			});
		}

		// FORME_ETHERALE
		if (fighter.skills.some(skill => skill.id === Skill.FORME_ETHERALE)) {
			addStatus(fightData, fighter, Status.INTANGIBLE);
		}

		// TORCHE
		if (fighter.skills.some(skill => skill.id === Skill.TORCHE)) {
			addStatus(fightData, fighter, Status.TORCHED);
		}

		// ACCUPUNCTURE
		if (fighter.skills.some(skill => skill.id === Skill.ACUPUNCTURE)) {
			addStatus(fightData, fighter, Status.HEALING);
		}

		// M_INITIATIVE_RESET
		const initiativeResetInTeam = fightData.fighters.some(
			f => f.attacker === fighter.attacker && f.skills.some(skill => skill.id === Skill.M_INITIATIVE_RESET)
		);
		if (initiativeResetInTeam) {
			fighter.time = 1;
		}
		const initiativeResetInOpponents = fightData.fighters.some(
			f => f.attacker !== fighter.attacker && f.skills.some(skill => skill.id === Skill.M_INITIATIVE_RESET)
		);
		if (initiativeResetInOpponents) {
			fighter.time = 0;
		}
	});

	let turn = 0;

	// Zero the time origin to start from clean origin
	const firstFighterTime = fightData.fighters[0].time;
	fightData.fighters.map(fighter => (fighter.time -= firstFighterTime));

	let deadlyPoisonApplied = false;

	// STRATEGIE
	fightData.fighters.forEach(fighter => {
		if (!fighter.skills.some(skill => skill.id === Skill.STRATEGIE)) return;

		applyStrategy(fightData, fighter);
	});

	// Fight loop
	while (!fightData.loser) {
		if (!fightData.fighters.length) {
			// No fighters left
			break;
		}

		// Order fighters by initiative (random if equal)
		orderFighters(fightData);

		// Poison fighters if turn > 1000
		if (turn > 1000 && !deadlyPoisonApplied) {
			fightData.fighters.forEach(fighter => {
				addStatus(fightData, fighter, Status.POISONED);

				// eslint-disable-next-line no-param-reassign
				fighter.poisonedBy = {
					id: -666,
					skill: 0 as Skill,
					damage: 100
				};
			});

			deadlyPoisonApplied = true;
		}

		if (turn > 1200) {
			// Too many turns
			console.warn('Too many turns, this should never happen');
			break;
		}

		// Play fighter turn
		playFighterTurn(fightData);

		// Check deaths
		checkDeaths(fightData);

		turn += 1;
	}

	const winner = fightData.loser === 'defenders';

	const baoExists = fightData.fighters.some(
		fighter => fighter.type === 'monster' && fighter.name === monsterList[Monster.BAOBOB].name
	);

	// After fight regeneration
	fightData.fighters.forEach(fighter => {
		// No heal if dead
		if (fighter.hp <= 0) return;

		if (fighter.skills.some(skill => skill.id === Skill.PREMIERS_SOINS)) {
			// Heal 1HP
			heal(fightData, fighter, 1);
		}

		if (fighter.skills.some(skill => skill.id === Skill.MEDECINE)) {
			// Heal 1-4HP
			heal(fightData, fighter, randomBetween(1, 4));
		}

		if (fighter.skills.some(skill => skill.id === Skill.BRANCARDIER)) {
			// Get allies that lost HP
			const allies = fightData.fighters.filter(
				f => f.id !== fighter.id && f.attacker === fighter.attacker && f.hp < f.startingHp
			);

			if (allies.length) {
				// Get random ally
				const ally = allies[Math.floor(Math.random() * allies.length)];

				// Heal 2-6HP
				heal(fightData, ally, randomBetween(2, 6));
			}
		}

		if (baoExists && fighter.attacker) {
			// Regen to starting HP
			heal(fightData, fighter, fighter.startingHp - fighter.hp);
		}
	});

	if (winner) {
		// Curse if any M_CURSED_WAND
		if (fightData.fighters.some(fighter => fighter.skills.some(skill => skill.id === Skill.M_CURSED_WAND))) {
			fightData.fighters.forEach(f => {
				if (!f.attacker || f.initiallyCursed) return;
				if (hasStatus(f, Status.NO_CURSE)) return;

				f.permanentStatusGained.push(DinozStatusId.CURSED);

				// Add cursed step
				fightData.steps.push({
					action: 'cursed',
					fighter: stepFighter(f)
				});
			});
		}
	}

	// Get dinoz results
	const attackersResults: FighterResultFiche[] = fightData.fighters
		.filter(fighter => fighter.attacker && fighter.type === 'dinoz')
		.map(dinoz => ({
			dinozId: dinoz.id,
			hpLost: dinoz.startingHp - Math.max(dinoz.hp, 0),
			itemsUsed: dinoz.itemsUsed,
			goldLost: fightData.fighters
				.filter(fighter => !fighter.attacker && fighter.goldStolen?.[dinoz.id])
				.reduce((acc, fighter) => acc + (fighter.goldStolen?.[dinoz.id] ?? 0), 0),
			statusGained: dinoz.permanentStatusGained
		}));

	const defendersResults: FighterResultFiche[] = fightData.fighters
		.filter(fighter => !fighter.attacker && fighter.type === 'dinoz')
		.map(dinoz => ({
			dinozId: dinoz.id,
			hpLost: dinoz.startingHp - Math.max(dinoz.hp, 0),
			itemsUsed: dinoz.itemsUsed,
			goldLost: 0,
			statusGained: dinoz.permanentStatusGained
		}));

	// Get catches data
	const catches = fightData.fighters
		.filter(fighter => fighter.catcher)
		.map(fighter => ({
			dinozId: fighter.catcher ?? 0,
			monsterId: (Object.values(monsterList).find(monster => monster.name === fighter.name)?.id ?? 0) as Monster,
			hp: fighter.hp,
			id: fighter.catchId
		}));

	return {
		winner,
		attackers: attackersResults,
		defenders: defendersResults,
		catches,
		steps: fightData.steps,
		stats: fightData.stats,
		place: place,
		fighters: config.fighters.map(f => {
			return {
				id: f.id,
				type: f.type,
				name: f.name,
				display: f.display,
				attacker: f.attacker,
				maxHp: f.maxHp,
				startingHp: f.startingHp,
				energy: f.energy,
				maxEnergy: f.maxEnergy
			};
		})
	};
};

export default generateFight;
