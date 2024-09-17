import { Request } from 'express';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { getPlayerInfoToReport } from '../dao/playerDao.js';
import { ModerationReason } from '@drpg/prisma';
import { createModeration, getModeration } from '../dao/moderationDao.js';

export async function getPlayerToReport(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const playerToReport = await getPlayerInfoToReport(+req.params.id);

	if (!playerToReport) {
		throw new ExpectedError('Inexistant player to report.');
	}
	return playerToReport;
}

export async function reportPlayer(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const playerToReport = await getPlayerInfoToReport(+req.params.id);

	if (!playerToReport) {
		throw new ExpectedError('Inexistant player to report.');
	}

	if (!Object.values(ModerationReason).includes(req.body.reason)) {
		throw new ExpectedError('Invalid reason.');
	}

	await createModeration(req.auth.playerId, playerToReport.id, req.body.reason, req.body.comment, req.body.dinozId);

	return;
}

export async function getAllModeration(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const page = +req.params.page;

	return await getModeration(page);
}
