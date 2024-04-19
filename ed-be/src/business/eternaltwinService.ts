import { Request } from 'express';
import { getLBPlayer } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';

export async function checkPlayerLB(req: Request) {
	const eternalTwinID = req.params.uuid;
	const player = await getLBPlayer(eternalTwinID);
	if (!player) {
		throw new ErrorFormator(500, `Player ${eternalTwinID} doesn't exist.`);
	}

	if (player.dinoz.length < 0) return false;

	const remainingAction = player.dinoz.reduce((partialSum, a) => partialSum + a.remaining, 0);

	if (remainingAction === 0) return true;

	return false;
}
