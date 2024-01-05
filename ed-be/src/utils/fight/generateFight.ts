import { DetailedFighter, FighterResultFiche } from "@drpg/core/models/fight/DetailedFighter";
import { FightConfiguration } from "@drpg/core/models/fight/FightConfiguration";
import { FightProcessResult } from "@drpg/core/models/fight/FightResult";
import { FightStep } from "@drpg/core/models/fight/FightStep";
import { checkDeaths, playFighterTurn, stepFighter } from "./fightMethods.js";
import { Skill } from "@drpg/core/models/dinoz/SkillList";

export type DetailedFight = {
	loser: 'attackers' | 'defenders' | null,
	steps: FightStep[],
	fighters: DetailedFighter[],
	initiative: number,
};

const orderFighters = (fightData: DetailedFight) => {
  fightData.fighters = fightData.fighters.sort((a, b) => {
    // Last if hp <= 0
    if (a.hp <= 0) return 1;
    if (b.hp <= 0) return -1;
    // Random is initiatives are equal
    if (a.initiative === b.initiative) {
      return Math.random() > 0.5 ? 1 : -1;
    }
    // Lower initiative first
    return a.initiative - b.initiative;
  });
};

const generateFight = (config: FightConfiguration): FightProcessResult => {
  const fightData: DetailedFight = {
		loser: null,
		steps: [] as FightStep[],
		fighters: config.fighters,
		initiative: 0,
	};

	// Add arrive step for all fighters
  fightData.fighters.forEach((fighter) => {
    fightData.steps.push({
      action: 'arrive',
      fighter: stepFighter(fighter),
    });
  });

  let turn = 0;

  // Fight loop
  while (!fightData.loser) {
    if (!fightData.fighters.length) {
      // No fighters left
      break;
    }

    // Order fighters by initiative (random if equal)
    orderFighters(fightData);

    // Set current initiative to first fighter
    fightData.initiative = fightData.fighters[0].initiative;

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
