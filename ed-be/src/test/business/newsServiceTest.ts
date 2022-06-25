import { Request, Response } from 'express';
import { ErrorFormatter, Result, ValidationError, validationResult } from 'express-validator';
import { mocked } from 'ts-jest/utils';
import { mockRequest, mockResponse } from '../utils/constants.js';
import { getNews, postNews, updateNews } from '../../business/newsService.js';
import { batchOfNews, editedNews, postedNews } from '../data/newsData.js';
import { News } from '../../models/index.js';
import { updateAnyNews } from '../../dao/newsDao.js';

jest.mock('express-validator');

const NewsDao = require('../../dao/newsDao.js');

describe('Function postNews', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			title: 'title'
		};
		req.body = {
			frenchTitle: 'req.body.frenchTitle',
			englishTitle: 'req.body.englishTitle',
			spanishTitle: 'req.body.spanishTitle',
			germanTitle: 'req.body.germanTitle',
			frenchText: 'req.body.frenchText',
			englishText: 'req.body.englishText',
			spanishText: 'req.body.spanishText',
			germanText: 'req.body.germanText'
		};

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);
		NewsDao.createNews = jasmine.createSpy();

		News.build = jasmine.createSpy().and.returnValue({ get: jest.fn().mockResolvedValue(postedNews) });
		News.create = jasmine.createSpy().and.returnValue({ get: jest.fn().mockResolvedValue(postedNews) });
	});

	it('Nominal Case', async function () {
		await postNews(req, res);

		expect(NewsDao.createNews).toHaveBeenCalledTimes(1);
		expect(NewsDao.createNews).toHaveBeenCalledWith(Promise.resolve(postedNews));

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Bad request', async function () {
		const result = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await postNews(req, res);

		expect(NewsDao.createNews).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function getNews', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params.page = '1';

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);
		NewsDao.getBatchOfNews = jasmine.createSpy().and.returnValue(batchOfNews);
	});

	it('Nominal Case', async function () {
		await getNews(req, res);

		expect(NewsDao.getBatchOfNews).toHaveBeenCalledTimes(1);
		expect(NewsDao.getBatchOfNews).toHaveBeenCalledWith(parseInt(req.params.page));

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Bad request', async function () {
		const result = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getNews(req, res);

		expect(NewsDao.getBatchOfNews).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function updateNews', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			title: 'title'
		};
		req.body = {
			frenchTitle: 'req.body.frenchTitle',
			englishTitle: 'req.body.englishTitle',
			spanishTitle: 'req.body.spanishTitle',
			germanTitle: 'req.body.germanTitle',
			frenchText: 'req.body.frenchText',
			englishText: 'req.body.englishText',
			spanishText: 'req.body.spanishText',
			germanText: 'req.body.germanText'
		};

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);
		NewsDao.updateAnyNews = jasmine.createSpy();
	});

	it('Nominal Case', async function () {
		await updateNews(req, res);

		expect(NewsDao.updateAnyNews).toHaveBeenCalledTimes(1);
		expect(NewsDao.updateAnyNews).toHaveBeenCalledWith(req.params.title, editedNews);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Bad request', async function () {
		const result = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await updateNews(req, res);

		expect(NewsDao.updateAnyNews).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
	});
});
