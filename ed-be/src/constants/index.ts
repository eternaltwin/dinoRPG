export * from './item.js';
export * from './level.js';
export * from './race.js';
export * from './skill.js';
export * from './status.js';

export const apiRoutes = {
	dataRoutes: '/api/data',
	dinozRoute: '/api/dinoz',
	inventoryRoute: '/api/inventory',
	oauthRoute: '/api/oauth',
	playerRoute: '/api/player',
	shopRoutes: '/api/shop'
};

export const reward = {
	tropheeRocky: 'tropheeRocky',
	tropheePteroz: 'tropheePteroz',
	tropheeHippoclamp: 'tropheeHippoclamp',
	tropheeQuetzu: 'tropheeQuetzu'
};

export const actions = [
	{
		name: 'fight',
		imgName: 'act_fight'
	},
	{
		name: 'follow',
		imgName: 'act_follow'
	}
];
