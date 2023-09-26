import { Dinoz } from '../entity/index.js';
import { TriggerEnum } from '@drpg/core/models/enums/Parser';
import { NpcAction } from '@drpg/core/models/npc/NpcAction';
import { FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { calculateFight, rewardFight } from '../business/fightService.js';
import { getDinozFightDataRequest } from '../dao/dinozDao.js';

export async function triggerAction(action: NpcAction, dinoz: Dinoz): Promise<boolean> {
	let result: boolean;
	switch (action.actionType) {
		case TriggerEnum.FIGHT:
			result = false;
			const fightingDinoz: Dinoz = await getDinozFightDataRequest(dinoz.id);
			const fightResult: FightProcessResult = calculateFight(fightingDinoz, action.enemies[0]);
			await rewardFight(dinoz, action.enemies[0], fightResult);
			if (fightResult.winner) {
				result = true;
			}
			break;
		default:
			result = false;
			break;
	}
	return result;

	// if (reward != undefined && result) {
	// 	await rewarder(reward, dinoz);
	// }
}
