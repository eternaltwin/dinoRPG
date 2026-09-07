import {
	GetClanMemberResponse,
	UpdateClanMemberRequestBody,
	UpdateClanMemberRequestParams
} from '@drpg/core/returnTypes/Clan';
import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import {
	acceptJoinRequest,
	createClan,
	createClanPage,
	deleteClan,
	deleteClanPage,
	denyJoinRequest,
	excludeClanMember,
	getAllClans,
	getClan,
	getClanBanner,
	getClanHistory,
	getClanHistoryCount,
	getClanMember,
	getClanMembers,
	getClanMessages,
	getClanMessagesCount,
	getClanPage,
	getClanPages,
	getClanTreasureDetails,
	getJoinRequest,
	getJoinRequestslist,
	getPlayerHasRight,
	getRankingClans,
	giveClanIngredients,
	joinClan,
	leaveClanSelf,
	searchClanByName,
	searchClans,
	updateClanBanner,
	updateClanLanguages,
	updateClanMember,
	updateClanPage
} from '../business/clanService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { ErrorResponse } from './index.js';

const routes: Router = Router();

const commonPath = apiRoutes.clanRoutes;

routes.get(
	`${commonPath}/all/:page`,
	[param('page').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getAllClans(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/ranking/:type/:page`,
	[param('page').exists().toInt().isNumeric(), param('type').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getRankingClans(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/search/:name/:page`,
	[param('name').exists().isString(), param('page').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await searchClanByName(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/search/:name`,
	[param('name').exists().isString().isLength({ min: 3 })],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await searchClans(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/:id`, [param('id').exists().toInt().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	try {
		const response = await getClan(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/:id/members`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanMembers(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}`,
	[body('name').exists().isString(), body('description').exists().isString(), body('languages').exists().isArray()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await createClan(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:id/join`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await joinClan(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:id/requests`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getJoinRequestslist(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.delete(`${commonPath}/:id`, [param('id').exists().toInt().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	try {
		const response = await deleteClan(req);
		return res.status(200).send(response.toString());
	} catch (err) {
		sendError(res, err);
	}
});

routes.put(
	`${commonPath}/:id/edit/banner`,
	[multer().single('file'), param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await updateClanBanner(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:id/edit/langs`,
	[body('languages').exists().isArray()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await updateClanLanguages(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:id/banner`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanBanner(req);
			if (response) {
				return res.status(200).contentType('image/webp').send(Buffer.from(response));
			}
			return res.status(200).contentType('image/webp').send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.delete(
	`${commonPath}/request/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await denyJoinRequest(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/request/self`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	try {
		const response = await getJoinRequest(req);
		if (!response) {
			return res.status(404).send(response);
		}
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(
	`${commonPath}/request/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await acceptJoinRequest(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:clanId/member/:memberId`,
	[param('clanId').exists().toInt().isNumeric(), param('memberId').exists().toInt().isNumeric()],
	async (req: Request, res: Response<GetClanMemberResponse | ErrorResponse>) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanMember(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:clanId/member`,
	[param('clanId').exists().toInt().isNumeric(), body('clanMember').exists()],
	async (req: Request<UpdateClanMemberRequestParams, unknown, UpdateClanMemberRequestBody>, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await updateClanMember(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.delete(
	`${commonPath}/:clanId/member/:id`,
	[param('clanId').exists().toInt().isNumeric(), param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await excludeClanMember(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.delete(`${commonPath}/member/self`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	try {
		const response = await leaveClanSelf(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/:clanId/pages`,
	[param('clanId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanPages(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/page/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanPage(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/page`,
	[
		body('name').exists().isString(),
		body('content').exists().isString(),
		body('isPublic').exists().isBoolean(),
		body('clanId').exists().isNumeric()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await createClanPage(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.delete(
	`${commonPath}/:clanId/page/:pageId`,
	[param('clanId').exists().toInt().isNumeric(), param('pageId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await deleteClanPage(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:clanId/page/:id`,
	[
		param('clanId').exists().toInt().isNumeric(),
		param('id').exists().toInt().isNumeric(),
		body('content').exists().isString(),
		body('isPublic').exists().isBoolean(),
		body('name').exists().isString()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await updateClanPage(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:id/messages/:page`,
	[param('id').exists().toInt().isNumeric(), param('page').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanMessages(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:id/history/:page`,
	[param('id').exists().toInt().isNumeric(), param('page').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanHistory(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:clanId/hasRight/:right`,
	[param('clanId').exists().toInt().isNumeric(), param('right').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getPlayerHasRight(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:id/messagesCount`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanMessagesCount(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:id/historyCount`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanHistoryCount(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:id/give`,
	[param('id').exists().toInt().isNumeric(), body('ingredients').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await giveClanIngredients(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:id/treasure`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanTreasureDetails(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
