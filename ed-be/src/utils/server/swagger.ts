const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'API REST de EternalDinoRPG',
		description: "Yep, it's the API",
		version: '1.0.0'
	},
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT'
			}
		}
	},
	servers: [
		{
			url: process.env.NODE_ENV === 'development' ? 'http://localhost:8081' : 'https://dinorpg.eternaltwin.org'
		}
	],
	tags: [
		{
			name: 'Oauth',
			description: 'Request made for authenticate the player'
		},
		{
			name: 'Dinoz',
			description: 'Requests made about the dinoz'
		},
		{
			name: 'Player',
			description: 'Requests made about the player'
		},
		{
			name: 'Shop',
			description: 'Requests made about the shops'
		},
		{
			name: 'Ingredients',
			description: 'Requests made about the ingredient'
		},
		{
			name: 'Inventory',
			description: "Requests made about the player's inventory"
		},
		{
			name: 'Level',
			description: 'Requests made about the dinoz leveling'
		},
		{
			name: 'News',
			description: 'Requests made about the news of the website'
		},
		{
			name: 'Ranking',
			description: 'Requests made about the ranking'
		},
		{
			name: 'Admin',
			description: 'Requests requiring to be administrator'
		}
	]
};
export const swaggerOptions = {
	swaggerDefinition,
	apis: ['dist/routes/*.js']
};
