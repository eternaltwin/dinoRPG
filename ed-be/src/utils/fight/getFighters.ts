import { Skill, skillList } from "@drpg/core/models/dinoz/SkillList";
import { Status } from "@drpg/core/models/dinoz/StatusList";
import { DetailedFighter } from "@drpg/core/models/fight/DetailedFighter";
import { MonsterFiche } from "@drpg/core/models/fight/MonsterFiche";
import { itemList } from "@drpg/core/models/item/ItemList";
import { AssaultElement, getAssaultStat } from "@drpg/core/utils/getAssaultStat";
import { DefenseElement, getDefenseStat } from "@drpg/core/utils/getDefenseStat";
import { SpecialStat, getSpecialStat } from "@drpg/core/utils/getSpecialStat";
import { DinozToCalculateFight } from "../../business/fightService.js";

interface Team {
  dinozList: DinozToCalculateFight[];
  monsterList: MonsterFiche[];
}

const handleSkills = (fighter: DetailedFighter) => {
  if (fighter.skills.some((skill) => skill.id === Skill.TENACITE)) {
		fighter.minDamage += 1;
	}

	// TODO: handle other skills
};

const getFighters = (team1: Team, team2: Team): DetailedFighter[] => {
  const fighters: DetailedFighter[] = [];

  [team1, team2].forEach((team, index) => {
    const { dinozList, monsterList } = team;

		// Dinoz
		fighters.push(...dinozList.map((dinoz) => {
			// Find items
			const items = dinoz.items.map((item) => {
				const itemFiche = Object.values(itemList).find((i) => i.itemId === item.itemId);

				if (!itemFiche) {
					throw new Error(`Item ${item.itemId} not found`);
				}

				return itemFiche;
			});

			// Find skills
			const skills = dinoz.skills.map((skill) => {
				const skillFiche = skillList[skill.skillId as Skill]

				if (!skillFiche) {
					throw new Error(`Skill ${skill.skillId} not found`);
				}

				return skillFiche;
			});

			const dinozWithItems = {
				...dinoz,
				items: dinoz.items.map((item) => item.itemId),
			};

			const fighter: DetailedFighter = {
				id: dinoz.id,
				name: dinoz.name,
				level: dinoz.level,
				type: 'dinoz' as const,
				attacker: index === 0,
				maxHp: dinoz.life,
				hp: dinoz.life,
				stats: {
					assault: {
						[AssaultElement.AIR]: getAssaultStat(dinoz, skills, AssaultElement.AIR).value,
						[AssaultElement.FIRE]: getAssaultStat(dinoz, skills, AssaultElement.FIRE).value,
						[AssaultElement.LIGHTNING]: getAssaultStat(dinoz, skills, AssaultElement.LIGHTNING).value,
						[AssaultElement.WATER]: getAssaultStat(dinoz, skills, AssaultElement.WATER).value,
						[AssaultElement.WOOD]: getAssaultStat(dinoz, skills, AssaultElement.WOOD).value,
					},
					defense: {
						[DefenseElement.AIR]: getDefenseStat(dinoz, skills, DefenseElement.AIR).value,
						[DefenseElement.FIRE]: getDefenseStat(dinoz, skills, DefenseElement.FIRE).value,
						[DefenseElement.LIGHTNING]: getDefenseStat(dinoz, skills, DefenseElement.LIGHTNING).value,
						[DefenseElement.WATER]: getDefenseStat(dinoz, skills, DefenseElement.WATER).value,
						[DefenseElement.WOOD]: getDefenseStat(dinoz, skills, DefenseElement.WOOD).value,
						[DefenseElement.NEUTRAL]: getDefenseStat(dinoz, skills, DefenseElement.NEUTRAL).value,
					},
					special: {
						[SpecialStat.INITIATIVE]: getSpecialStat(dinozWithItems, skills, SpecialStat.INITIATIVE)?.value,
						[SpecialStat.ENERGY]: getSpecialStat(dinozWithItems, skills, SpecialStat.ENERGY)?.value,
						[SpecialStat.ENERGY_RECOVERY]: getSpecialStat(dinozWithItems, skills, SpecialStat.ENERGY_RECOVERY)?.value,
						[SpecialStat.ARMOR]: getSpecialStat(dinozWithItems, skills, SpecialStat.ARMOR)?.value,
						[SpecialStat.MULTIHIT]: getSpecialStat(dinozWithItems, skills, SpecialStat.MULTIHIT)?.value,
						[SpecialStat.EVASION]: getSpecialStat(dinozWithItems, skills, SpecialStat.EVASION)?.value,
						[SpecialStat.COUNTER]: getSpecialStat(dinozWithItems, skills, SpecialStat.COUNTER)?.value,
						[SpecialStat.BUBBLE_RATE]: getSpecialStat(dinozWithItems, skills, SpecialStat.BUBBLE_RATE)?.value,
						[SpecialStat.TORCH_DAMAGE]: getSpecialStat(dinozWithItems, skills, SpecialStat.TORCH_DAMAGE)?.value,
						[SpecialStat.ACID_BLOOD_DAMAGE]: getSpecialStat(dinozWithItems, skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value,
					},
				},
				items,
				itemsUsed: [],
				initiative: 0,
				skills,
				status: dinoz.status.map((status) => status.statusId as Status),
				activeSkills: [],
				element: AssaultElement.AIR,
				minDamage: 1,
			};

      handleSkills(fighter);

			return fighter;
		}));

		// Monsters
		fighters.push(...monsterList.map((monster) => ({
			id: 0,
			name: monster.name,
			level: monster.level,
			type: 'monster' as const,
			attacker: index === 0,
			maxHp: monster.hp,
			hp: monster.hp,
			stats: {
				assault: {
					[AssaultElement.AIR]: monster.elements.air + (monster.bonus_attack ?? 0),
					[AssaultElement.FIRE]: monster.elements.fire + (monster.bonus_attack ?? 0),
					[AssaultElement.LIGHTNING]: monster.elements.lightning + (monster.bonus_attack ?? 0),
					[AssaultElement.WATER]: monster.elements.water + (monster.bonus_attack ?? 0),
					[AssaultElement.WOOD]: monster.elements.wood + (monster.bonus_attack ?? 0),
				},
				defense: {
					[DefenseElement.AIR]: monster.elements.air + (monster.bonus_defense ?? 0),
					[DefenseElement.FIRE]: monster.elements.fire + (monster.bonus_defense ?? 0),
					[DefenseElement.LIGHTNING]: monster.elements.lightning + (monster.bonus_defense ?? 0),
					[DefenseElement.WATER]: monster.elements.water + (monster.bonus_defense ?? 0),
					[DefenseElement.WOOD]: monster.elements.wood + (monster.bonus_defense ?? 0),
					[DefenseElement.NEUTRAL]: monster.bonus_defense ?? 0,
				},
				special: {
					[SpecialStat.INITIATIVE]: 0,
					[SpecialStat.ENERGY]: 0,
					[SpecialStat.ENERGY_RECOVERY]: 0,
					[SpecialStat.ARMOR]: 0,
					[SpecialStat.MULTIHIT]: 0,
					[SpecialStat.EVASION]: 0,
					[SpecialStat.COUNTER]: 0,
					[SpecialStat.BUBBLE_RATE]: 0,
					[SpecialStat.TORCH_DAMAGE]: 0,
					[SpecialStat.ACID_BLOOD_DAMAGE]: 0,
				},
			},
			items: [],
			itemsUsed: [],
			initiative: 0,
			skills: [],
			status: [],
			activeSkills: [],
			element: AssaultElement.AIR,
			minDamage: 1,
		})));
  });

  return fighters;
};

export default getFighters;
