import { mockRequest, mockResponse } from '../utils/constants.js';
import { Request, Response } from 'express';
import { ErrorFormatter, Result, ValidationError, validationResult } from 'express-validator';
import { mocked } from 'ts-jest/utils';
import { getAllIngredientsData } from '../../business/ingredientService.js';
import { allIngredientData, ingredientResponse } from '../data/ingredientsData.js';

jest.mock('express-validator');

const IngredientDao = require('../../dao/ingredientDao.js');

describe('Function getAllIngredientsData()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		IngredientDao.getAllIngredientsDataRequest = jasmine.createSpy().and.returnValue(allIngredientData);
	});

	it('Nominal case', async function () {
		await getAllIngredientsData(req, res);

		expect(IngredientDao.getAllIngredientsDataRequest).toHaveBeenCalledTimes(1);

		expect(IngredientDao.getAllIngredientsDataRequest).toHaveBeenCalledWith(req.user!.playerId);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(ingredientResponse);
	});

	it("Player doesn't exists", async function () {
		IngredientDao.getAllIngredientsDataRequest = jasmine.createSpy().and.returnValue(null);
		await getAllIngredientsData(req, res);

		expect(IngredientDao.getAllIngredientsDataRequest).toHaveBeenCalledTimes(1);

		expect(IngredientDao.getAllIngredientsDataRequest).toHaveBeenCalledWith(req.user!.playerId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Player ${req.user!.playerId} doesn't exist`);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);
		await getAllIngredientsData(req, res);

		expect(IngredientDao.getAllIngredientsDataRequest).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});
