import { Request, Response } from 'express';

// Player constants
export const player = {
	id_1: 12345,
	id_2: 54321
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
