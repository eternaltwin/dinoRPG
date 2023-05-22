import { Dinoz } from '../entity/index.js';
import { TriggerEnum } from '@drpg/core/models/enums/Parser';

export async function triggerAction(action: string, dinoz: Dinoz): Promise<boolean> {
	let result: boolean;
	if (action.includes(TriggerEnum.FIGHT)) {
		//Launch the fight against param
		result = true;
	} else {
		result = false;
	}
	return result;

	// if (reward != undefined && result) {
	// 	await rewarder(reward, dinoz);
	// }
}
