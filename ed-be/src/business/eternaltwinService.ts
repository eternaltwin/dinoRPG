import { Request } from 'express';
import { getLBPlayer, getLBResponseInformation, setPlayer } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import fetch from 'node-fetch';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { itemList } from '@drpg/core/models/item/ItemList';
import dayjs from 'dayjs';

export async function checkPlayerLB(req: Request) {
	const eternalTwinID = req.params.uuid;
	const player = await getLBPlayer(eternalTwinID);
	if (!player) {
		throw new ErrorFormator(500, `Player ${eternalTwinID} doesn't exist.`);
	}

	if (!dayjs().isSame(player.lastLogin, 'day')) return false;

	if (player.dinoz.length < 0) return false;

	const remainingAction = player.dinoz.reduce((partialSum, a) => partialSum + a.remaining, 0);

	if (remainingAction === 0) return true;

	return false;
}

export async function checkLB(req: Request) {
	const playerId = +req.params.id;
	const player = await getLBResponseInformation(playerId);
	if (!player) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	let LBDone = player.labruteDone;

	if (LBDone) {
		throw new ErrorFormator(400, `alreadyClaimed`);
	}

	const amIDone = await fetch(`https://brute.eternaltwin.org/api/user/${player.eternalTwinId}/done`);
	const data = await amIDone.text();

	LBDone = data === 'true';

	if (data !== 'true' && data !== 'false') {
		throw new ErrorFormator(500, data);
	}

	if (!LBDone) {
		throw new ErrorFormator(400, `needToDoAllAction`);
	}

	const portion = Math.ceil(player._count.dinoz / 3);

	await increaseItemQuantity(
		playerId,
		itemList.POTION_IRMA.itemId,
		Math.min(portion, itemList.POTION_IRMA.maxQuantity)
	);

	player.labruteDone = true

	await setPlayer(playerId, { labruteDone: true});

	return { quantity: portion };
}
