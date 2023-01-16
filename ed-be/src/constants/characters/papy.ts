import { NpcData } from '../../models/index.js';

export const PAPY: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['missions'],
		initialStep: true
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
