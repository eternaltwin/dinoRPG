import { Request } from 'express';
import {jest} from '@jest/globals';
import { mockRequest } from '../utils/constants.js';
import { getNews, postNews, updateNews } from '../../business/newsService.js';
import { batchOfNews, editedNews } from '../data/newsData.js';
import { News } from '../../entity/index.js';
import { AllNews } from "@drpg/core/models/news/AllNews";

const NewsDao = require('../../dao/newsDao.js');

describe('Function postNews', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

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

		NewsDao.createNews = jasmine.createSpy();
	});

	it('Nominal Case', async function () {
		try {
			await postNews(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		const expectedPartialNews: Partial<News> = {
			title: req.params.title,
			image: undefined,
			frenchTitle: req.body.frenchTitle,
			englishTitle: req.body.englishTitle,
			spanishTitle: req.body.spanishTitle,
			germanTitle: req.body.germanTitle,
			frenchText: req.body.frenchText,
			englishText: req.body.englishText,
			spanishText: req.body.spanishText,
			germanText: req.body.germanText
		};

		expect(NewsDao.createNews).toHaveBeenCalledTimes(1);
		expect(NewsDao.createNews).toHaveBeenCalledWith(expectedPartialNews);
	});

	// Bad requests are handled in routes
});

describe('Function getNews', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params.page = '1';

		NewsDao.getBatchOfNews = jasmine.createSpy().and.returnValue(batchOfNews);
	});

	it('Nominal Case', async function () {
		let response: Array<AllNews> = [];
		try {
			response = await getNews(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(NewsDao.getBatchOfNews).toHaveBeenCalledTimes(1);
		expect(NewsDao.getBatchOfNews).toHaveBeenCalledWith(parseInt(req.params.page));
		expect(response).toStrictEqual(batchOfNews);
	});

	// Bad requests are handled in routes
});

describe('Function updateNews', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

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

		NewsDao.updateAnyNews = jasmine.createSpy();
	});

	it('Nominal Case', async function () {
		try {
			await updateNews(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(NewsDao.updateAnyNews).toHaveBeenCalledTimes(1);
		expect(NewsDao.updateAnyNews).toHaveBeenCalledWith(req.params.title, editedNews);
	});

	// Bad requests are handled in routes
});
