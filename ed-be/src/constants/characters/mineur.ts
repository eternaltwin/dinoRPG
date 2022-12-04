import { NpcData } from '../../models/index.js';

export const MINEUR: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['yes', 'nothing', 'repair', 'nothing2', 'repair2', 'no'],
		initialStep: true
	},
	thanks: {
		stepName: 'thanks',
		nextStep: []
	},
	yes: {
		stepName: 'yes',
		condition: '!status(SHOVEL)+!status(ENHANCED_SHOVEL)+!status(BROKEN_SHOVEL)+!status(BROKEN_ENHANCED_SHOVEL)',
		reward: ['status(SHOVEL)'],
		nextStep: ['thanks']
	},
	nothing: {
		stepName: 'nothing',
		condition: 'status(SHOVEL)',
		nextStep: ['thanks']
	},
	repair: {
		stepName: 'repair',
		condition: 'status(BROKEN_SHOVEL)',
		reward: ['status(SHOVEL)', '!status(BROKEN_SHOVEL)'],
		nextStep: ['thanks']
	},
	nothing2: {
		stepName: 'nothing2',
		condition: 'status(ENHANCED_SHOVEL)',
		nextStep: ['thanks']
	},
	repair2: {
		stepName: 'repair2',
		condition: 'status(BROKEN_ENHANCED_SHOVEL)',
		reward: ['status(ENHANCED_SHOVEL)', '!status(BROKEN_ENHANCED_SHOVEL)'],
		nextStep: ['thanks']
	},
	no: {
		stepName: 'no',
		nextStep: ['next']
	},
	next: {
		stepName: 'next',
		nextStep: ['next2']
	},
	next2: {
		stepName: 'next2',
		nextStep: ['next3']
	},
	next3: {
		stepName: 'next3',
		nextStep: ['qui']
	},
	qui: {
		stepName: 'qui',
		nextStep: ['ok']
	},
	ok: {
		stepName: 'ok',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
