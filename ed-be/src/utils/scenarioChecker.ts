import { prisma } from '../prisma.js';
import { Scenario } from '@drpg/core/models/enums/Scenario';
import { FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { Item } from '@drpg/core/models/item/ItemList';
import { increaseQuestProgression, upsertQuest } from '../dao/questsDao.js';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { Monster } from '@drpg/core/models/fight/MonsterList';

export async function scenarioChecker(playerId: string, fightResult: FightProcessResult, monsters: MonsterFiche[]) {
	const quests = await prisma.playerQuest.findMany({
		where: {
			playerId: playerId
		},
		select: {
			progression: true,
			tracking: true,
			questId: true
		}
	});

	if (!quests) return;

	for (const quest of quests) {
		switch (quest.questId) {
			case Scenario.MERGUEZ:
				if (quest.progression === 1 || quest.progression === 3) {
					const merguezUsedCount = [...fightResult.attackers, ...fightResult.defenders]
						.flatMap(fighter => fighter.itemsUsed)
						.filter(item => item === Item.GOBLIN_MERGUEZ).length;

					if (quest.tracking + merguezUsedCount >= 500 && quest.progression === 1) {
						await upsertQuest(playerId, Scenario.MERGUEZ, 2);
					} else if (quest.tracking + merguezUsedCount >= 2000 && quest.progression === 3) {
						await upsertQuest(playerId, Scenario.MERGUEZ, 4);
					} else if (merguezUsedCount > 0) {
						await increaseQuestProgression(playerId, Scenario.MERGUEZ, 0, merguezUsedCount);
					}
				}
				break;
			case Scenario.PAC:
				if (quest.progression === 5) {
					const kazka = monsters.filter(m => m.id === Monster.KAZKA).length;
					if (quest.tracking + kazka >= 50) {
						await upsertQuest(playerId, Scenario.PAC, 6);
					} else {
						await increaseQuestProgression(playerId, Scenario.PAC, 0, kazka);
					}
				} else if (quest.progression === 7) {
					const flam = monsters.filter(m => m.id === Monster.FLAM).length;
					if (quest.tracking + flam >= 42) {
						await upsertQuest(playerId, Scenario.PAC, 8);
					} else {
						await increaseQuestProgression(playerId, Scenario.PAC, 0, flam);
					}
				} else if (quest.progression === 9) {
					const coqdur = monsters.filter(m => m.id === Monster.COQDUR).length;
					if (quest.tracking + coqdur >= 1) {
						await upsertQuest(playerId, Scenario.PAC, 10);
					} else {
						await increaseQuestProgression(playerId, Scenario.PAC, 0, coqdur);
					}
				}
				break;
			default:
				break;
		}
	}
}
