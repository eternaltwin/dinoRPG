import { Request, Response, Router } from 'express';
import { validationResult } from 'express-validator';

import { apiRoutes } from '../constants/index.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { checkRole } from '../utils/jwt.js';
import { calculateFightVsMonsters, generateMonsterList, rewardFightVsMonsters } from '../business/fightService.js';
import { getDinozFightDataRequest } from '../dao/dinozDao.js';
import sendError from '../utils/sendErrors.js';
import { LOGGER } from '../context.js';
import { AdminRole } from '@drpg/prisma';

const routes: Router = Router();

const commonPath: string = apiRoutes.testingRoute;

/*function compterOccurrences<T>(tableau: T[]): Map<T, number> {
	const occurrences = new Map<T, number>();
	for (const objet of tableau) {
		if (occurrences.has(objet)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			occurrences.set(objet, occurrences.get(objet) + 1);
		} else {
			occurrences.set(objet, 1);
		}
	}
	return occurrences;
}*/

routes.get(`${commonPath}/generateMonster/:id`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}
	const player = await getDinozFightDataRequest(+req.params.id, req.auth.playerId);
	if (!player) {
		throw new ExpectedError(`Player ${+req.params.id} doesn't exist.`);
	}
	const team = player.dinoz;

	try {
		const results = [];
		for (let i = 0; i < 600; i++) {
			const monstersGenerated = await generateMonsterList(team, player.dinoz[0].placeId);
			const fightResult = calculateFightVsMonsters(team, player, player.dinoz[0].placeId, monstersGenerated);
			const result = await rewardFightVsMonsters(team, monstersGenerated, fightResult, player.dinoz[0].placeId, player);

			const flattedMonsters = monstersGenerated.map(a => a.name);
			const counter: { [key: string]: number } = {};
			for (const element of flattedMonsters.flat()) {
				if (counter[element]) {
					counter[element] += 1;
				} else {
					counter[element] = 1;
				}
			}

			const item = {
				gold: result.goldEarned.toString(),
				xp: result.xpEarned.toString(),
				opponents: result.fighters,
				victory: result.result.toString()
			};
			results.push(item);
		}
		LOGGER.error('600 fight result', { fights: results });
		return res.status(200).send();
	} catch (err) {
		await sendError(res, err);
	}
});

export default routes;
