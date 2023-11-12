import { ElementType } from "../../enums/ElementType.mjs";
import { ConditionEnum, RewardEnum } from "../../enums/Parser.mjs";
import { NpcData } from "../NpcData.mjs";

export const ALPHA: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['talk'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		alias: 'back',
		nextStep: ['element', 'experience']
	},
	element: {
		stepName: 'element',
		condition: {
			conditionType: ConditionEnum.MAXLEVEL,
			value: 80
		},
		nextStep: ['fire', 'water', 'lightning', 'wood', 'air']
	},
	fire: {
		stepName: 'fire',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.FIRE
			}
		]
	},
	water: {
		stepName: 'water',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.WATER
			}
		]
	},
	lightning: {
		stepName: 'lightning',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.LIGHTNING
			}
		]
	},
	wood: {
		stepName: 'wood',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.WOOD
			}
		]
	},
	air: {
		stepName: 'air',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.AIR
			}
		]
	},
	nothing: {
		stepName: 'nothing',
		nextStep: ['back']
	},
	experience: {
		stepName: 'experience',
		condition: {
			conditionType: ConditionEnum.MAXLEVEL,
			value: 80
		},
		nextStep: ['maxExperience']
	},
	maxExperience: {
		stepName: 'maxExperience',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.MAXEXPERIENCE,
				value: 1
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
