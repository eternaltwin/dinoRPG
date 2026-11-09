import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { getCurrentChampionship } from '../business/clanChampionshipService.js';
import { getMatchReplay } from '../business/clanChampionshipReplayService.js';
import { auth } from '../dao/playerDao.js';
import { isUuid } from '@drpg/core/utils/isUuid';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

const routes: Router = Router();

const commonPath = apiRoutes.clanChampionshipRoutes;

/*
Everything else about the championship goes through the clan socket (see clanSocketRequestService).
The current championship stays here because any player reads it, including from another clan's page or without a
clan; the replay because it is a whole match, too big for a socket message.

List of endpoints
GET 				/
	Get the current championship (or null)
GET 				/match/:matchId/replay
	Get the omniscient replay of a finished match of the player's clan
 */

routes.get(`${commonPath}/`, async (req: Request, res: Response) => {
	try {
		const response = await getCurrentChampionship(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/match/:matchId/replay`, async (req: Request, res: Response) => {
	try {
		const matchId = req.params.matchId;
		if (typeof matchId !== 'string' || !isUuid(matchId)) throw new ExpectedError('Wrong data format');
		const authed = await auth(req);
		const response = await getMatchReplay(authed, matchId);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
