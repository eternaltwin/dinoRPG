export * from './item.js';
export * from './level.js';
export * from './place.js';
// Note: skill.js is before race because race.js needs it
export * from './skill.js';
export * from './race.js';
export * from './reward.js';
// Note: item.js and place.js are before shop.js because shop.js needs them
export * from './shop.js';
export * from './status.js';

export const apiRoutes = {
	adminRoute: '/api/admin',
	dinozRoute: '/api/dinoz',
	inventoryRoute: '/api/inventory',
	oauthRoute: '/api/oauth',
	playerRoute: '/api/player',
	rankingRoutes: '/api/ranking',
	shopRoutes: '/api/shop'
};

export const regex = {
	DINOZ_NAME: /^[a-zA-Z0-9éèêëÉÈÊËîïÎÏôÔûÛ\-']{3,16}$/
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
