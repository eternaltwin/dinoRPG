import { TriggerEnum } from '@drpg/core/models/enums/Parser';
import { NpcAction } from '@drpg/core/models/npc/NpcAction';
import { DinozToRewardFight, calculateFight, rewardFight } from '../business/fightService.js';
import { getDinozFightDataRequest } from '../dao/dinozDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export async function triggerAction(action: NpcAction, dinoz: DinozToRewardFight) {
	let result;
	/*switch (action.actionType) {
		case TriggerEnum.FIGHT:
			result = false;
			const fightingDinoz = await getDinozFightDataRequest(dinoz.id);
			if (!fightingDinoz) {
				throw new ExpectedError(`Dinoz ${dinoz.id} doesn't exist.`);
			}
			const fightResult = calculateFight([fightingDinoz], dinoz.placeId, action.enemies);
			await rewardFight([dinoz], action.enemies, fightResult, dinoz.placeId);
			if (fightResult.winner) {
				result = true;
			}
			break;
		default:
			result = false;
			break;
	}*/
	return result;

	// if (reward != undefined && result) {
	// 	await rewarder(reward, dinoz);
	// }
}
