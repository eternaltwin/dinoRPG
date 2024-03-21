import { Request, Response, Router } from 'express';
import { validationResult } from 'express-validator';

import { apiRoutes } from '../constants/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { checkIsAdmin } from '../utils/jwt.js';
import { calculateFight, generateMonster, rewardFightCalculate } from '../business/fightService.js';
import { getDinozFightDataRequest } from '../dao/dinozDao.js';
import { sendJSONToDiscord } from '../utils/discord.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.testingRoute;

/*function compterOccurrences<T>(tableau: T[]): Map<T, number> {
	const occurrences = new Map<T, number>();
	for (const objet of tableau) {
		if (occurrences.has(objet)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			occurrences.set(objet, occurrences.get(objet)! + 1);
		} else {
			occurrences.set(objet, 1);
		}
	}
	return occurrences;
}*/

routes.get(`${commonPath}/generateMonster/:id`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	const dinozData = await getDinozFightDataRequest(+req.params.id);
	if (!dinozData) {
		throw new ErrorFormator(500, `Player ${+req.params.id} doesn't exist.`);
	}
	const followers = dinozData.followers.map(follower => ({
		...follower,
		player: dinozData.player
	}));
	const team = [dinozData, ...followers];

	try {
		const results = [];
		for (let i = 0; i < 600; i++) {
			const monstersGenerated = generateMonster(team, dinozData.placeId);
			const fightResult = calculateFight(team, dinozData.placeId, monstersGenerated);
			const result = await rewardFightCalculate(team, monstersGenerated, fightResult);

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
				opponents: result.opponent,
				victory: result.result.toString()
			};
			results.push(item);
		}
		sendJSONToDiscord('600 fight result', { fights: results });
		return res.status(200).send();
	} catch (err) {
		const e = err as ErrorFormator;
		console.error(e.message);
		return res.status(e.errorCode || 500).send(e.message);
	}
});

export default routes;
