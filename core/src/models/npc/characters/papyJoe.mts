import { NpcData } from "../NpcData.mjs";

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
