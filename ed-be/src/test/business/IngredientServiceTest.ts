import { mockRequest } from '../utils/constants.js';
import { Request } from 'express';
import { getAllIngredientsData } from '../../business/ingredientService.js';
import { allIngredientData } from '../data/ingredientsData.js';

const IngredientDao = require('../../dao/playerIngredientDao.js');

describe('Function getAllIngredientsData()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		IngredientDao.getAllIngredientsDataRequest = jasmine.createSpy().and.returnValue(allIngredientData);
	});

	it('Nominal case', async function () {
		try {
			await getAllIngredientsData(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(IngredientDao.getAllIngredientsDataRequest).toHaveBeenCalledTimes(1);

		expect(IngredientDao.getAllIngredientsDataRequest).toHaveBeenCalledWith(req.user!.playerId);

		//expect(res.send).toHaveBeenCalledWith(ingredientResponse);
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.

	// Bad requests are handled in routes
});
