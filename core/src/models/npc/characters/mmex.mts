import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';
import { Skill } from '../../dinoz/SkillList.mjs';

export const MMEX: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['talk'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		nextStep: ['talk2']
	},
	talk2: {
		stepName: 'talk2',
		nextStep: ['question', 'missions']
	},
	question: {
		stepName: 'question',
		nextStep: ['question2']
	},
	question2: {
		stepName: 'question2',
		nextStep: ['double']
	},
	double: {
		stepName: 'double',
		nextStep: ['double2']
	},
	double2: {
		stepName: 'double2',
		nextStep: ['double3']
	},
	double3: {
		stepName: 'double3',
		nextStep: ['learn', 'already']
	},
	learn: {
		stepName: 'learn',
		nextStep: ['learn1', 'learn2', 'learn3', 'learn4', 'learn5', 'no'],
		condition: {
			[Operator.NOT]: { [ConditionEnum.SKILL]: Skill.COMPETENCE_DOUBLE }
		},
		redirect: 'dolearn'
	},
	learn1: {
		stepName: 'learn1',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.KAMIKAZE }, { [ConditionEnum.SKILL]: Skill.VOIE_DE_KAOS }]
		},
		redirect: 'dolearn'
	},
	learn1bis: {
		stepName: 'learn1bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.VENGEANCE }, { [ConditionEnum.SKILL]: Skill.TALON_DACHILLE }]
		},
		redirect: 'dolearn'
	},
	learn2: {
		stepName: 'learn2',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.WAIKIKIDO }, { [ConditionEnum.SKILL]: Skill.COCON }]
		},
		redirect: 'dolearn'
	},
	learn2bis: {
		stepName: 'learn2bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.COMBUSTION }, { [ConditionEnum.SKILL]: Skill.ZERO_ABSOLU }]
		},
		redirect: 'dolearn'
	},
	learn3: {
		stepName: 'learn3',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.ETAT_PRIMAL }, { [ConditionEnum.SKILL]: Skill.VOIE_DE_GAIA }]
		},
		redirect: 'dolearn'
	},
	learn3bis: {
		stepName: 'learn3bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.SAPEUR }, { [ConditionEnum.SKILL]: Skill.FORME_VAPOREUSE }]
		},
		redirect: 'dolearn'
	},
	learn4: {
		stepName: 'learn4',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.SKILL]: Skill.CLONE_AQUEUX },
				{ [ConditionEnum.SKILL]: Skill.RESISTANCE_A_LA_MAGIE }
			]
		},
		redirect: 'dolearn'
	},
	learn4bis: {
		stepName: 'learn4bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.ELASTICITE }, { [ConditionEnum.SKILL]: Skill.ADRENALINE }]
		},
		redirect: 'dolearn'
	},
	learn5: {
		stepName: 'learn5',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.FOUDRE }, { [ConditionEnum.SKILL]: Skill.MARECAGE }]
		},
		redirect: 'dolearn'
	},
	learn5bis: {
		stepName: 'learn5bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.SKILL]: Skill.PAUME_EJECTABLE },
				{ [ConditionEnum.SKILL]: Skill.INSTINCT_SAUVAGE }
			]
		},
		redirect: 'dolearn'
	},
	dolearn: {
		stepName: 'dolearn',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.SKILL,
				value: Skill.COMPETENCE_DOUBLE
			}
		]
	},
	no: {
		stepName: 'no',
		nextStep: []
	},
	already: {
		stepName: 'already',
		nextStep: [],
		condition: {
			[ConditionEnum.SKILL]: 61119
		}
	},
	missions: {
		stepName: 'missions',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		]
	}
};
