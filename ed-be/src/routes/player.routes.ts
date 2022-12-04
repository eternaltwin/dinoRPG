import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import {
	getAccountData,
	getCommonData,
	importAccount,
	setCustomText,
	searchPlayers
} from '../business/playerService.js';
import { body, param, validationResult } from 'express-validator';
import { PlayerCommonData, PlayerInfo } from '../models/index.js';
import { Player } from '../entity/player.js';
import { ErrorFormator } from '../utils/errorFormator.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.playerRoute;

/**
 * @openapi
 * /api/v1/player/commondata:
 *   get:
 *     summary: Retrieve the basic data when logged in
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Player
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a dinoz fiche.
 */
routes.get(`${commonPath}/commondata`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: PlayerCommonData = await getCommonData(req);
		return res.status(200).send(response);
	} catch (err) {
		console.error(err.message);
		const e: ErrorFormator = err;
		res.status(e.errorCode).send(e.message);
	}
});

/**
 * @openapi
 * /api/v1/player/{playerId}:
 *   get:
 *     summary: Get the public data from a specific account
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Player
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: playerId
 *         type: string
 *         required: true
 *         description: Numeric ID of the player to watch.
 *     responses:
 *       200:
 *         description: Returns a public player fiche.
 */
routes.get(`${commonPath}/:id`, [param('id').exists().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: PlayerInfo = await getAccountData(req);
		return res.status(200).send(response);
	} catch (err) {
		console.error(err.message);
		const e: ErrorFormator = err;
		res.status(e.errorCode).send(e.message);
	}
});

/**
 * @openapi
 * /api/v1/player/import:
 *   put:
 *     summary: Import the data from DinoRPG
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Player
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - server
 *           properties:
 *             server:
 *               type: string
 *               description: Server from where the data come
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.put(`${commonPath}/import`, [body('server').exists().isString()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		await importAccount(req);
		return res.status(200).send();
	} catch (err) {
		console.error(err.message);
		const e: ErrorFormator = err;
		res.status(e.errorCode).send(e.message);
	}
});

/**
 * @openapi
 * /api/v1/player/customText:
 *   put:
 *     summary: Edit the custom text of the player doing the request
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Player
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - message
 *           properties:
 *             message:
 *               type: string
 *               description: Custom text
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.put(`${commonPath}/customText`, [body('message').exists()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		await setCustomText(req);
		return res.status(200).send();
	} catch (err) {
		console.error(err.message);
		const e: ErrorFormator = err;
		res.status(e.errorCode).send(e.message);
	}
});

/**
 * @openapi
 * /api/v1/player/search/{name}:
 *   get:
 *     summary: Search a player by its PlayerName
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Player
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: name
 *         type: string
 *         required: true
 *         description: String to research
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.get(
	`${commonPath}/search/:name`,
	[param('name').exists().isString().isLength({ min: 3 })],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: Array<Player> = await searchPlayers(req);
			return res.status(200).send(response);
		} catch (err) {
			console.error(err.message);
			const e: ErrorFormator = err;
			res.status(e.errorCode).send(e.message);
		}
	}
);

export default routes;
