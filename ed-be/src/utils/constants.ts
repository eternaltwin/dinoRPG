const apiRoutes = {
	dinozRoute: '/api/dinoz',
	oauthRoute: '/api/oauth',
	playerRoute: '/api/player',
	shopRoutes: '/api/shop',
	dataRoutes: '/api/data',
};

const race = {
	hippoclamp: 'hippoclamp',
	rocky: 'rocky',
	pteroz: 'pteroz',
	winks: 'winks',
	sirain: 'sirain',
	castivore: 'castivore',
	nuagoz: 'nuagoz',
	gorilloz: 'gorilloz',
	wanwan: 'wanwan',
	pigmou: 'pigmou',
	planaille: 'planaille',
	moueffe: 'moueffe',
	quetzu: 'quetzu',
};

const reward = {
	tropheeRocky: 'tropheeRocky',
	tropheePteroz: 'tropheePteroz',
	tropheeHippoclamp: 'tropheeHippoclamp',
	tropheeQuetzu: 'tropheeQuetzu',
};

const actions = [
	{
		name: 'fight',
		imgName: 'act_fight',
	},
	{
		name: 'follow',
		imgName: 'act_follow',
	},
];

export { apiRoutes, race, reward, actions };
