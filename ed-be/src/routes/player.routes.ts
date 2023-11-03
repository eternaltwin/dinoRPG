import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import {
	getAccountData,
	getCommonData,
	setCustomText,
	searchPlayers,
	getDinozList
} from '../business/playerService.js';
import { body, param, validationResult } from 'express-validator';
import { Player } from '../entity/player.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { postError } from '../utils/discord.js';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { getPlayerMoney } from '../dao/playerDao.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import {
	displayTwinoidSite,
	displayTwinoidSpecificSite,
	// importAPI,
	// importTwinoidData
} from '../business/importService.js';
import { TwinoStat } from '@drpg/core/models/import/twinoStat';
import { SiteStat } from '@drpg/core/models/import/siteStat';
import { SiteAchiev } from '@drpg/core/models/import/siteAchiev';

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
		const e = err as ErrorFormator;
		console.error(e.message);
		await postError(e, res);
		res.status(e.errorCode).send(e.message);
	}
});

routes.get(`${commonPath}/dinozList`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: Array<DinozFiche> = await getDinozList(req);
		return res.status(200).send(response);
	} catch (err) {
		const e = err as ErrorFormator;
		//await postError(e, res);
		res.status(e.errorCode).send(e.message);
	}
});

routes.get(`${commonPath}/twinoStats/:id`, [param('id').exists().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: Array<TwinoStat> = await displayTwinoidSite(req);
		return res.status(200).send(response);
	} catch (err) {
		const e = err as ErrorFormator;
		//await postError(e, res);
		res.status(e.errorCode).send(e.message);
	}
});

routes.get(
	`${commonPath}/twinoStats/:id/:type/:site`,
	[param('id').exists().isNumeric(), param('type').exists().isString(), param('site').exists().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: Array<SiteStat> | Array<SiteAchiev> = await displayTwinoidSpecificSite(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			//await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

routes.get(`${commonPath}/getmoney`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: Player = (await getPlayerMoney(req.user!.playerId!)) as Player;
		return res.status(200).send(response.money.toString());
	} catch (err) {
		const e = err as ErrorFormator;
		console.error(e.message);
		await postError(e, res);
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
		const e = err as ErrorFormator;
		console.error(e.message);
		await postError(e, res);
		res.status(e.errorCode).send(e.message);
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
			const e = err as ErrorFormator;
			console.error(e.message);
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
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
			const e = err as ErrorFormator;
			console.error(e.message);
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
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
		const e = err as ErrorFormator;
		console.error(e.message);
		await postError(e, res);
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
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

export default routes;
