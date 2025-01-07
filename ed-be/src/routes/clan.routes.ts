import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import {
	createClan,
	deleteClan,
	getAllClans,
	getClan,
	getClanBanner,
	getClanMembers,
	joinClan,
	acceptJoinRequest,
	denyJoinRequest,
	updateClanBanner,
	getJoinRequestslist,
	getClanMember,
	updateClanMember,
	getClanPages,
	getClanPage,
	createClanPage,
	getClanMessages,
	getClanHistory,
	excludeClanMember,
	getJoinRequest,
	deleteClanPage,
	updateClanPage,
	getPlayerHasRight,
	leaveClanSelf,
	searchClanByName,
	getClanMessagesCount,
	getClanHistoryCount,
	giveClanIngredients,
	getClanTreasureDetails,
	getRankingClans,
	searchClans
} from '../business/clanService.js';
import multer from 'multer';
import sendError from '../utils/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.clanRoutes;

/**
 * @openapi
 * /api/v1/clan/all/{page}:
 *   get:
 *     summary: Get list of all clans
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: page
 *         type: string
 *         required: true
 *         description: Number of the page to display
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/ranking/{page}:
 *   get:
 *     summary: Get ranking page of clan
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: page
 *         type: string
 *         required: true
 *         description: Number of the page to display
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.get(
	`${commonPath}/ranking/:page`,
	[param('page').exists().toInt().isNumeric()],
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

/**
 * @openapi
 * /api/v1/clan/search/{name}/{page}:
 *   get:
 *     summary: Search clan by name
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}:
 *   get:
 *     summary: Get clan by id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}/members:
 *   get:
 *     summary: Get clan members list by clan id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan:
 *   post:
 *     summary: Create new clan
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 * 	   parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *               description: Name for the clan to create
 *     responses:
 *       201:
 *         description: Successfully created
 *       500:
 *         description: Error
 */
routes.post(
	`${commonPath}`,
	[body('name').exists().isString(), body('description').exists().isString()],
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

/**
 * @openapi
 * /api/v1/clan/{id}/join:
 *   post:
 *     summary: Request to join clan
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Successfully created
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}/requests:
 *   post:
 *     summary: get clan requests list
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}:
 *   delete:
 *     summary: Delete clan by id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully deleted
 *       500:
 *         description: Error
 */
routes.delete(`${commonPath}/:id`, [param('id').exists().toInt().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	try {
		const response = await deleteClan(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

/**
 * @openapi
 * /api/v1/clan:
 *   put:
 *     summary: Update clan banner by clan id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 * 	   parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             image:
 *               type: string
 *               description: Image (buffer) for the clan banner
 *     responses:
 *       200:
 *         description: Successfully modified
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}/banner:
 *   get:
 *     summary: Get clan banner by clan id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.get(
	`${commonPath}/:id/banner`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await getClanBanner(req);
			return res.status(200).contentType('image/webp').send(response?.banner);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/clan/request/{id}:
 *   delete:
 *     summary: Deny join request
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully denied
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/request/self:
 *   get:
 *     summary: Get player current clan join request if there is one
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully denied
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/request/{id}:
 *   post:
 *     summary: Accept join request
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully denied
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{clanId}/member/{memberId}:
 *   get:
 *     summary: Get clan member
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.get(
	`${commonPath}/:clanId/member/:memberId`,
	[param('clanId').exists().toInt().isNumeric(), param('memberId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
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

/**
 * @openapi
 * /api/v1/clan/{clanId}/member/{memberId}:
 *   put:
 *     summary: Update clan member
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.put(
	`${commonPath}/:clanId/member`,
	[param('clanId').exists().toInt().isNumeric(), body('clanMember').exists()],
	async (req: Request, res: Response) => {
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

/**
 * @openapi
 * /api/v1/clan/{clanId}/member/{memberId}:
 *   delete:
 *     summary: exclude a clan member
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/member/self:
 *   delete:
 *     summary: leave the player's self clan
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{clanId}/pages:
 *   get:
 *     summary: Get clan pages list
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/page/:id:
 *   get:
 *     summary: Get clan page by id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/page:
 *   post:
 *     summary: Create new clan page
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 * 	   parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *               description: Name for the new page
 *     responses:
 *       201:
 *         description: Successfully created
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/page/:id:
 *   delete:
 *     summary: Delete clan page by id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/page/:id:
 *   put:
 *     summary: Update clan page
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{clanId}/messages:
 *   get:
 *     summary: Get clan messages list
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{clanId}/history:
 *   get:
 *     summary: Get clan history
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{clanId}/hasRight/{right}:
 *   get:
 *     summary: Get if player has right
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}/messagesCount:
 *   get:
 *     summary: Get clan messages total count
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}/historyCount:
 *   get:
 *     summary: Get clan history total count
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}/give:
 *   get:
 *     summary: Give to clan a set of ingredients
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/clan/{id}/treasure:
 *   get:
 *     summary: Get clan treasure details
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clans
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
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
