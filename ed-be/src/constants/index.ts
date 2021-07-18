export * from './level.js';
export * from './race.js';
export * from './skill.js';
export * from './item.js';

export const apiRoutes = {
	dinozRoute: '/api/dinoz',
	oauthRoute: '/api/oauth',
	playerRoute: '/api/player',
	shopRoutes: '/api/shop',
	dataRoutes: '/api/data',
};

export const reward = {
	tropheeRocky: 'tropheeRocky',
	tropheePteroz: 'tropheePteroz',
	tropheeHippoclamp: 'tropheeHippoclamp',
	tropheeQuetzu: 'tropheeQuetzu',
};

export const actions = [
	{
		name: 'fight',
		imgName: 'act_fight',
	},
	{
		name: 'follow',
		imgName: 'act_follow',
	},
];
