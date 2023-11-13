export * from './ingredient.js';
export * from './gather.js';
// Note: item.js and place.js are before shop.js because shop.js needs them
export * from './shop.js';
export * from './skill.js';
export * from './action.js';
export * from './temporaryStatus.js';

export const apiRoutes = {
	adminRoute: '/api/v1/admin',
	dinozRoute: '/api/v1/dinoz',
	fightRoute: '/api/v1/fight',
	ingredientRoute: '/api/v1/ingredients',
	inventoryRoute: '/api/v1/inventory',
	levelRoute: '/api/v1/level',
	missionsRoutes: '/api/v1/missions',
	newsRoute: '/api/v1/news',
	npcRoute: '/api/v1/npc',
	oauthRoute: '/api/v1/oauth',
	playerRoute: '/api/v1/player',
	rankingRoutes: '/api/v1/ranking',
	shopRoutes: '/api/v1/shop'
};

export const regex = {
	DINOZ_NAME: /^[a-zA-Z0-9éèêëÉÈÊËîïÎÏôÔûÛ\-']{3,16}$/
};
