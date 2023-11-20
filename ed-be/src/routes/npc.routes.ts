import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getNpcSpeech } from '../business/npcService.js';
import { apiRoutes } from '../constants/index.js';
import { postError } from '../utils/discord.js';
import { ErrorFormator } from '../utils/errorFormator.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.npcRoute;

/**
 * @openapi
 * /api/v1/npc/{dinozId}/{npc}:
 *   put:
 *     summary: Talk to a NPC
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - NPC
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: npc
 *         type: string
 *         required: true
 *         description: Name of the NPC.
 *       - in: path
 *         name: dinozId
 *         type: number
 *         required: true
 *         description: Dinoz Id.
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - step
 *           properties:
 *             step:
 *               type: string
 *               description: Name of the NPC
 *             stop:
 *               type: boolean
 *               description: Tell if the player exit the conversation
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.put(
	`${commonPath}/:dinozId/:npc`,
	[
		param('npc').exists().isString(),
		param('dinozId').exists().toInt().isNumeric(),
		body('step').exists().isString(),
		body('stop').optional({ nullable: true }).exists().toBoolean().isBoolean()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const dialogue = await getNpcSpeech(req);
			res.status(200).send(dialogue);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

export default routes;
