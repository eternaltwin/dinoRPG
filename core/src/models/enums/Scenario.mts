export enum Scenario {
	STAR = 1,
	MAGNET = 2,
	SMOG = 3
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
