export enum Scenario {
	STAR = 1,
	MERGUEZ = 2,
	MAGNET = 3,
	SMOG = 4
}

export type ScenarioType = {
	id: number;
	name: string;
	totalStep: number;
};

export const ScenarioDetails: Readonly<Record<Scenario, ScenarioType>> = {
	[Scenario.STAR]: {
		id: Scenario.STAR,
		name: 'star',
		totalStep: 8
	},
	[Scenario.MERGUEZ]: {
		id: Scenario.MERGUEZ,
		name: 'merguez',
		totalStep: 5
	},
	[Scenario.MAGNET]: {
		id: Scenario.MAGNET,
		name: 'magnet',
		totalStep: 8
	},
	[Scenario.SMOG]: {
		id: Scenario.SMOG,
		name: 'smog',
		totalStep: 8
	}
};
