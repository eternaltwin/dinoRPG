import { Request, Response } from 'express';

// Player constants
export const player = {
	id_1: 12345,
	id_2: 54321
};

export const importPlayerData = {
	id: undefined,
	player: {
		cooker: false,
		createdDate: '08/01/2021',
		customText: 'test',
		dinoz: [
			{
				display: '63cvi4d1fs',
				experience: 0,
				following: 0,
				id: 123456789,
				level: 1,
				life: 100,
				name: '?',
				placeId: 1,
				status: [{ statusId: 1 }]
			}
		],
		engineer: false,
		eternalTwinId: '8e429bed-d99c-40d6-b018-b8f82aff1e60',
		hasImported: false,
		id: 12345,
		ingredients: [{ ingredientId: 5, quantity: 10 }],
		items: [
			{ itemId: 6, quantity: 1 },
			{ itemId: 3, quantity: 1 }
		],
		leader: false,
		merchant: false,
		money: 85910,
		name: 'biocat',
		priest: false,
		quetzuBought: 1,
		rank: { averagePoints: 4, averagePointsDisplayed: 4, dinozCount: 2, sumPoints: 5, sumPointsDisplayed: 5 },
		rewards: [
			{ name: undefined, rewardId: 13214 },
			{ name: undefined, rewardId: 9845 },
			{ name: undefined, rewardId: 79456 },
			{ name: undefined, rewardId: 7974 }
		],
		shopKeeper: false,
		teacher: false
	},
	rewardId: 999
};

// Dinoz constants
export const dinozId = 123456789;
export const dinozName = 'Potato';
export const skillId = 11101;
export const skillId2 = 11102;
export const place1 = 10;
export const notClosePlace = 90;
export const place1Alias = 31;
export const inexistantPlace = 999;

// Shop constants
export const shop = {
	id_flying_1: 1,
	id_negative_1: -1,
	id_letter_1: 'abc',
	id_nonexistant_1: 999
};

// Item constants
export const item = {
	id_1: 1,
	id_negative_1: -1,
	id_letter_1: 'abc',
	id_nonexistant_1: 999
};
export const itemId = 1;
export const itemQuantity = 1;

export const defaultFight = {
	goldEarned: 999,
	xpEarned: 1,
	hpLost: 0,
	result: true
};

export const mockRequest = {
	user: {
		playerId: player.id_1
	}
} as Request;

export const mockResponse = ({
	status: jest.fn().mockReturnThis(),
	send: jest.fn().mockReturnThis(),
	json: jest.fn().mockReturnThis()
} as unknown) as Response;
