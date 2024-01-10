import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { ElementType } from "@drpg/core/models/enums/ElementType";
import { DetailedFighter, FighterResultFiche, FighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { DinozToGetFighter, FightConfiguration } from "@drpg/core/models/fight/FightConfiguration";
import { FightProcessResult } from "@drpg/core/models/fight/FightResult";
import { FightStep } from "@drpg/core/models/fight/FightStep";
import { Item } from "@drpg/core/models/item/ItemList";
import { addStatus, checkDeaths, getRandomOpponent, playFighterTurn, stepFighter } from "./fightMethods.js";
import { PlaceEnum } from "@drpg/core/models/enums/PlaceEnum";

export type DetailedFight = {
	place: PlaceEnum,
	loser: 'attackers' | 'defenders' | null,
	steps: FightStep[],
	initialDinozList: DinozToGetFighter[],
	fighters: DetailedFighter[],
	time: number,
	environment?: {
		type: Skill,
		caster: DetailedFighter,
		turnsLeft: number,
	},
	timeManipulatorUsed?: boolean,
	temporalStabilityUsed?: boolean,
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

const generateFight = (config: FightConfiguration): FightProcessResult => {
	const fightData: DetailedFight = {
		loser: null,
		steps: [] as FightStep[],
		initialDinozList: config.initialDinozList,
		fighters: config.fighters,
		time: 0,
		place: config.place,
	};

	// Add arrive step for all fighters
	fightData.fighters.forEach((fighter) => {
		// Handle costumes
		if (fighter.costume) {
			fightData.steps.push({
				action: 'setCostume',
				fighter: stepFighter(fighter),
				costume: fighter.costume.name,
			});
		}

		fightData.steps.push({
			action: 'arrive',
			fighter: stepFighter(fighter),
		});

		// Temportal reduction
		if (fighter.items.some(item => item.itemId === Item.TEMPORAL_REDUCTION)) {
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(fighter),
				itemId: Item.TEMPORAL_REDUCTION,
			});
		}

		// Curse locker
		if (fighter.items.some(item => item.itemId === Item.TEMPORAL_REDUCTION)) {
			const opponent = getRandomOpponent(fightData, fighter, ['dinoz']);

			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(fighter),
				itemId: Item.CURSE_LOCKER,
			});

			// Find weakest assault element
			const weakestElement = +Object.entries(fighter.stats.assault).sort(([, a], [, b]) => a - b)[0][0] as ElementType;

			// Lock opponent for 3 turns
			opponent.element = weakestElement;
			opponent.locked = 4;
			addStatus(fightData, opponent, FighterStatus.LOCKED);
		}
	});

	let turn = 0;

	// Zero the time origin to start from clean origin
	const first_fighter_time = fightData.fighters[0].time;
	fightData.fighters.map(fighter => fighter.time -= first_fighter_time);

	// Fight loop
	while (!fightData.loser) {
		if (!fightData.fighters.length) {
			// No fighters left
			break;
		}

		// Order fighters by initiative (random if equal)
		orderFighters(fightData);

		// Poison fighters if turn > 1000
		if (turn > 1000) {
			fightData.fighters.forEach((fighter) => {
				// eslint-disable-next-line no-param-reassign
				fighter.poisonedBy = {
					id: -666,
					type: 'monster',
					skill: 0 as Skill,
				};
			});
		}

		// Play fighter turn
		playFighterTurn(fightData);

		// Check deaths
		checkDeaths(fightData);

		turn += 1;
	}

	const winner = fightData.loser === 'defenders';

	// Get dinoz results
	const attackersResults: FighterResultFiche[] = fightData.fighters.filter((fighter) => fighter.attacker && fighter.type === 'dinoz').map((dinoz) => ({
		dinoz_id: dinoz.id,
		hp_lost: dinoz.maxHp - dinoz.hp,
		items_used: dinoz.itemsUsed,
	}));

	const defendersResults: FighterResultFiche[] = fightData.fighters.filter((fighter) => !fighter.attacker && fighter.type === 'dinoz').map((dinoz) => ({
		dinoz_id: dinoz.id,
		hp_lost: dinoz.maxHp - dinoz.hp,
		items_used: dinoz.itemsUsed,
	}));

	return {
		winner,
		attackers: attackersResults,
		defenders: defendersResults,
		steps: fightData.steps,
	};
};

export default generateFight;
