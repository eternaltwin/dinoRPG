import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
	canCreateClan,
	getAccountData,
	getCommonData,
	getDinozList,
	playerToolTip,
	resetAccount,
	searchPlayers,
	setCustomText,
	updatePlayerSettings
} from '../business/playerService.js';
import { apiRoutes } from '../constants/index.js';
import { auth, getPlayerMoney, updatePlayerLanguage } from '../dao/playerDao.js';
import { checkLB } from '../business/eternaltwinService.js';
import sendError from '../utils/sendErrors.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Lang } from '@drpg/prisma';

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
		const response = await getCommonData(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/dinozList`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getDinozList(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/getmoney`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const authed = await auth(req);
		const response = await getPlayerMoney(authed.id);

		if (!response) {
			throw new ExpectedError('No player found');
		}

		return res.status(200).send(response.money.toString());
	} catch (err) {
		sendError(res, err);
	}
});

/**
 * @openapi
 * /api/v1/player/canCreateClan:
 *   get:
 *     summary: Get if player can create clan
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Eternaltwin
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.get(`${commonPath}/canCreateClan`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await canCreateClan(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

// Import are not available
/*routes.put(
	`${commonPath}/importAPI`,
	[
		body('code').exists().notEmpty().isString(),
		body('server').exists().notEmpty().isString(),
		body('cookie').exists().notEmpty().isString()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await importAPI(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err)
		}
	}
);

routes.put(
	`${commonPath}/importTwinoid`,
	[body('code').exists().notEmpty().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await importTwinoidData(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err)
		}
	}
);*/

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
		sendError(res, err);
	}
});

/**
 * @openapi
 * /api/v1/player/search/{search}:
 *   get:
 *     summary: Search a player by its PlayerName (or id)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Player
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: search
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
	`${commonPath}/search/:search`,
	[param('search').exists().isString().isLength({ min: 3 })],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await searchPlayers(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/player/labrute/:
 *   get:
 *     summary: Check if the player is eligible to drpg rewards from LB
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Eternaltwin
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: drpg id of the player
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.get(`${commonPath}/labrute`, [], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await checkLB(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

/**
 * @openapi
 * /api/v1/player/smallMenu/:id:
 *   get:
 *     summary: Get informations for tooltip player menu
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Eternaltwin
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: drpg id of the player
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.get(`${commonPath}/smallMenu/:id`, [param('id').exists().isString()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await playerToolTip(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
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
routes.get(`${commonPath}/:id`, [param('id').exists().isUUID()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getAccountData(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.delete(commonPath, [], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await resetAccount(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

/**
 * @openapi
 * /api/v1/player/language:
 *   put:
 *     summary: Update the language of the player
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Player
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: language
 *         schema:
 *           type: string
 *           enum:
 *             - fr
 *             - en
 *             - es
 *             - de
 *           description: The new language for the player.
 *     responses:
 *       200:
 *         description: Successfully updated the player's language.
 *       400:
 *         description: Invalid language or missing data.
 *       401:
 *         description: Unauthorized. The player ID is required.
 *       500:
 *         description: Internal server error.
 */
routes.put(
	`${commonPath}/language`,
	[body('language').exists().isIn(Object.values(Lang))],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const authed = await auth(req);
			const { language } = req.body;
			const response = await updatePlayerLanguage(authed.id, language);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.patch(
	`${commonPath}/settings/:setting`,
	[param('setting').exists(), body('setting').exists().isBoolean()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await updatePlayerSettings(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
