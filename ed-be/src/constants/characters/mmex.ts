import { NpcData } from '../../models/index.js';

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
		condition: '!skill(61119)'
	},
	learn1: {
		stepName: 'learn1',
		nextStep: ['dolearn'],
		condition: 'skill(11305)+skill(41303)',
		target: 'dolearn'
	},
	learn1bis: {
		stepName: 'learn1bis',
		nextStep: ['dolearn'],
		condition: 'skill(11310)+skill(51306)',
		target: 'dolearn'
	},
	learn2: {
		stepName: 'learn2',
		nextStep: ['dolearn'],
		condition: 'skill(11308)+skill(21303)',
		target: 'dolearn'
	},
	learn2bis: {
		stepName: 'learn2bis',
		nextStep: ['dolearn'],
		condition: 'skill(11311)+skill(31301)',
		target: 'dolearn'
	},
	learn3: {
		stepName: 'learn3',
		nextStep: ['dolearn'],
		condition: 'skill(21301)+skill(41306)',
		target: 'dolearn'
	},
	learn3bis: {
		stepName: 'learn3bis',
		nextStep: ['dolearn'],
		condition: 'skill(31304)+skill(513012)',
		target: 'dolearn'
	},
	learn4: {
		stepName: 'learn4',
		nextStep: ['dolearn'],
		condition: 'skill(31311)+skill(21309)',
		target: 'dolearn'
	},
	learn4bis: {
		stepName: 'learn4bis',
		nextStep: ['dolearn'],
		condition: 'skill(51302)+skill(41305)',
		target: 'dolearn'
	},
	learn5: {
		stepName: 'learn5',
		nextStep: ['dolearn'],
		condition: 'skill(413031)+skill(31308)',
		target: 'dolearn'
	},
	learn5bis: {
		stepName: 'learn5bis',
		nextStep: ['dolearn'],
		condition: 'skill(51310)+skill(21304)',
		target: 'dolearn'
	},
	dolearn: {
		stepName: 'dolearn',
		nextStep: [],
		reward: ['skill(61119)']
	},
	no: {
		stepName: 'no',
		nextStep: []
	},
	already: {
		stepName: 'already',
		nextStep: [],
		condition: 'skill(61119)'
	},
	missions: {
		stepName: 'missions',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
