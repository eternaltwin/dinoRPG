import { betaFight } from '../business/dinozService.js';
import { levelList } from '../constants/level.js';
import { statusList } from '../constants/status.js';
import { addExperience, setDinozNextElement } from '../dao/dinozDao.js';
import { addStatusToDinoz, removeStatusToDinoz } from '../dao/dinozStatusDao.js';
import { Dinoz } from '../entity/dinoz.js';

function checkCondition(condition: string, dinoz: Dinoz): boolean {
	const conditionList: Array<string> = condition.split('+');
	let conditionResult: boolean = true;

	conditionList.forEach(condition => {
		let orConditionResult: boolean | undefined = undefined;
		if (condition.includes('|')) {
			condition
				.split('|')
				.forEach(orCondition => (orConditionResult = orConditionResult || conditionParser(orCondition, dinoz)));
		} else {
			conditionResult = conditionParser(condition, dinoz) && conditionResult;
		}
		conditionResult = conditionResult && (orConditionResult ?? true);
	});
	return conditionResult;
}

function conditionParser(condition: string, dinoz: Dinoz): boolean {
	const param: string = condition.substring(condition.indexOf('(') + 1, condition.indexOf(')'));
	let result: boolean | undefined = undefined;
	if (condition.includes('level')) {
		result = dinoz.level >= parseInt(param);
	} else if (condition.includes('fx')) {
		let status = Object.entries(statusList).find(status => status[0] === param.toUpperCase()) as [string, number];
		result = dinoz.status.some(dinozStatus => dinozStatus.statusId === status[1]);
	} else if (condition.includes('scenario')) {
	} else if (condition.includes('curmission')) {
		//Avoir la mission en cours
	} else if (condition.includes('mission')) {
		//Avoir fait la mission
	} else if (condition.includes('hasingr')) {
	} else if (condition.includes('hasobject')) {
	} else if (condition.includes('active')) {
	} else if (condition.includes('uvar')) {
		//Récompense epic du joueur
	} else if (condition.includes('drand')) {
		//Random
	} else if (condition.includes('hourrand')) {
		//Random sur l'heure
	} else if (condition.includes('tag')) {
		// ??
	} else if (condition.includes('collec')) {
	} else if (condition.includes('gvar')) {
	} else if (condition.includes('event')) {
	} else if (condition.includes('clanact')) {
	} else if (condition.includes('swait')) {
	} else if (condition.includes('race')) {
	} else if (condition.includes('skill')) {
	} else if (condition.includes('equip')) {
	} else if (condition.includes('utime')) {
	}
	if (condition.startsWith('!')) {
		result = !result;
	}
	return result!;
}

async function triggerAction(action: string, dinoz: Dinoz): Promise<boolean> {
	let result: boolean;
	if (action.includes('fight')) {
		//Launch the fight against param
		const fight = await betaFight(dinoz);
		result = fight.result;
	} else {
		result = false;
	}
	return result;

	// if (reward != undefined && result) {
	// 	await rewarder(reward, dinoz);
	// }
}

async function rewarder(rewards: Array<string>, dinoz: Dinoz): Promise<void> {
	for (const reward of rewards) {
		const param: string = reward.substring(reward.indexOf('(') + 1, reward.indexOf(')'));
		if (reward.includes('fx')) {
			const statusId: number = Object.entries(statusList).find(status => status[0] === param.toUpperCase())![1];
			if (reward.startsWith('!')) {
				await removeStatusToDinoz(dinoz.id, statusId);
			} else {
				await addStatusToDinoz(dinoz, statusId);
			}
		} else if (reward.includes('changeelem')) {
			let elementId: number;
			switch (param) {
				case 'fire':
					elementId = 1;
					break;
				case 'wood':
					elementId = 2;
					break;
				case 'water':
					elementId = 3;
					break;
				case 'lightning':
					elementId = 4;
					break;
				case 'air':
					elementId = 5;
					break;
				default:
					elementId = 1;
			}
			await setDinozNextElement(dinoz.id, elementId);
		} else if (reward.includes('exp')) {
			const maxExp: number = levelList.find(level => level.id === dinoz.level)!.experience;
			await addExperience(dinoz.id, maxExp - dinoz.experience);
		} else {
			console.log('Not implemented yet');
		}
	}
}

export { checkCondition, conditionParser, triggerAction, rewarder };
