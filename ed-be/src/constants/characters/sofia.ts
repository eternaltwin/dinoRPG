import { NpcData } from '../../models/index.js';

export const SOFIA: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['slurp'],
		initialStep: true
	},
	slurp: {
		stepName: 'slurp',
		nextStep: ['troph', 'nouvelle', 'niveau', 'ether']
	},
	nouvelle: {
		stepName: 'nouvelle',
		nextStep: ['bien']
	},
	bien: {
		stepName: 'bien',
		nextStep: []
	},
	troph: {
		stepName: 'troph',
		nextStep: ['palais']
	},
	palais: {
		stepName: 'palais',
		nextStep: ['retour']
	},
	retour: {
		stepName: 'retour',
		nextStep: []
	},
	niveau: {
		stepName: 'niveau',
		nextStep: ['yes', 'no'],
		condition: 'level(50)+!status(broken_limit_1)'
	},
	yes: {
		stepName: 'yes',
		nextStep: ['ether'],
		reward: ['status(broken_limit_1)']
	},
	no: {
		stepName: 'no',
		nextStep: []
	},
	ether: {
		stepName: 'ether',
		nextStep: ['newskill', 'no2'],
		condition: 'level(50)+status(broken_limit_1)+!status(ether_drop)'
	},
	newskill: {
		stepName: 'newskill',
		nextStep: [],
		reward: ['status(ether_drop)']
	},
	no2: {
		stepName: 'no2',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
