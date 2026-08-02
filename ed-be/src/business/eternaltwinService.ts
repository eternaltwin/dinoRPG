import { Request } from 'express';
import { auth, getLBPlayer, getLBResponseInformation, setPlayer } from '../dao/playerDao.js';
import fetch from 'node-fetch';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import dayjs from 'dayjs';
import { createLog } from '../dao/logDao.js';
import { LogType } from '@drpg/prisma';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/server/translate.js';

export async function checkPlayerLB(req: Request) {
	const eternalTwinID = req.params.uuid;
	const player = await getLBPlayer(eternalTwinID);
	if (!player) {
		throw new ExpectedError(`Player ${eternalTwinID} doesn't exist.`);
	}

	if (!dayjs().isSame(player.lastLogin, 'day')) return false;

	if (player.dinoz.length < 1) return false;

	const remainingAction = player.dinoz.reduce((partialSum, a) => partialSum + a.remaining, 0);

	return remainingAction === 0;
}

export async function checkLB(req: Request) {
	const authed = await auth(req);
	const player = await getLBResponseInformation(authed.id);
	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	let LBDone = player.labruteDone;

	if (LBDone) {
		throw new ExpectedError(translate(`alreadyClaimed`, authed));
	}

	const amIDone = await fetch(`https://brute.eternaltwin.org/api/user/${authed.id}/done`);
	const data = await amIDone.text();

	LBDone = data === 'true';

	if (data !== 'true' && data !== 'false') {
		if (data === 'No brutes found') {
			throw new ExpectedError(translate(`noBruteFound`, authed));
		}
		throw new ExpectedError(data);
	}

	if (!LBDone) {
		throw new ExpectedError(translate(`needToDoAllAction`, authed));
	}

	const portion = Math.ceil(player._count.dinoz / 3);

	await increaseItemQuantity(
		authed.id,
		itemList[Item.POTION_IRMA].itemId,
		Math.min(portion, itemList[Item.POTION_IRMA].maxQuantity)
	);

	player.labruteDone = true;

	await setPlayer(authed.id, { labruteDone: true });
	await createLog(LogType.LBDone, authed.id, undefined);

	return { quantity: portion };
}
