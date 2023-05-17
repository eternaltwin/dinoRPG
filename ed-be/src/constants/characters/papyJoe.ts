import { NpcData } from '@drpg/core/models/npc/NpcData';

export const PAPYJOE: Readonly<Record<string, NpcData>> = {
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
