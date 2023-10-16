import { Dinoz } from '../entity/index.js';
import { TriggerEnum } from '@drpg/core/models/enums/Parser';
import { NpcAction } from '@drpg/core/models/npc/NpcAction';
import { FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { calculateFight, rewardFight } from '../business/fightService.js';
import { getDinozFightDataRequest } from '../dao/dinozDao.js';
import { ErrorFormator } from './errorFormator.js';

export async function triggerAction(action: NpcAction, dinoz: Dinoz): Promise<boolean> {
	let result: boolean;
	switch (action.actionType) {
		case TriggerEnum.FIGHT:
			result = false;
			const fightingDinoz: Dinoz | null = await getDinozFightDataRequest(dinoz.id);
			if (!fightingDinoz) {
				throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't exist.`);
			}
			const fightResult: FightProcessResult = calculateFight(fightingDinoz, action.enemies);
			await rewardFight(dinoz, action.enemies, fightResult);
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
