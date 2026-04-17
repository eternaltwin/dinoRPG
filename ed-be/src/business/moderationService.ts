import { Request } from 'express';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { auth, getBannedPlayers, getPlayerBanInfo, getPlayerInfoToReport } from '../dao/playerDao.js';
import { ModerationReason, ModerationAction, $Enums } from '@drpg/prisma';
import {
	createModerationReport,
	createClanModerationReport,
	getModerationReport,
	getModerationReports,
	setModerationReport
} from '../dao/moderationDao.js';
import { LONG_BAN_DURATION_MS, MEDIUM_BAN_DURATION_MS, SHORT_BAN_DURATION_MS } from '@drpg/core/constants';
import { LOGGER } from '../context.js';
import { createNotification } from '../dao/notificationDao.js';
import NotificationSeverity = $Enums.NotificationSeverity;
import { prisma } from '../prisma.js';

/**
 * Get info of a player for a report
 * @param req
 * @param req.params.id {number} player id
 * @returns relevant infos of the player
 */
export async function getPlayerToReport(req: Request) {
	await auth(req);
	const playerToReport = await getPlayerInfoToReport(req.params.id);

	if (!playerToReport) {
		throw new ExpectedError('Inexistent player to report.');
	}
	return playerToReport;
}

/**
 * Report a player
 * @param req
 * @param req.params.id {number} player id
 * @param req.body.reason {string} reason for the report
 * @param req.body.comment {number} additional comment on the report
 * @param req.body.dinozId {number} id of the dinoz concerned by the report
 */
export async function reportPlayer(req: Request) {
	const authed = await auth(req);
	const playerToReport = await getPlayerInfoToReport(req.params.id);

	if (!playerToReport) {
		throw new ExpectedError('Inexistent player to report.');
	}

	if (!Object.values(ModerationReason).includes(req.body.reason)) {
		throw new ExpectedError('Invalid reason.');
	}

	await createModerationReport(authed.id, playerToReport.id, req.body.reason, req.body.comment, req.body.dinozId);

	return;
}

/**
 * Report a clan
 * @param req
 * @param req.params.id {number} clan id
 * @param req.body.reason {string} reason for the report
 * @param req.body.comment {number} additional comment on the report
 */
export async function reportClan(req: Request) {
	const authed = await auth(req);
	const targetClanId = Number(req.params.id);

	if (!Object.values(ModerationReason).includes(req.body.reason)) {
		throw new ExpectedError('Invalid reason.');
	}

	const clan = await prisma.clan.findUnique({
		where: { id: targetClanId },
		select: { leaderId: true }
	});

	if (!clan) {
		throw new ExpectedError('Inexistent clan to report.');
	}

	await createClanModerationReport(authed.id, clan.leaderId, targetClanId, req.body.reason, req.body.comment);

	return;
}

/**
 * Get paginated list of moderation reports
 * @param req
 * @param req.params.page {number} page number to read
 * @returns list of moderation reports at a given page
 */
export async function getAllModeration(req: Request) {
	await auth(req);

	const page = +req.params.page;

	return await getModerationReports(page);
}

/**
 * Record action taken on a report
 * @param req
 * @param req.params.id {number} report ID
 * @body req.body.action {string} action taken on the report
 */
export async function takeActionOnReport(req: Request) {
	const authed = await auth(req);

	const reportId = +req.params.id;
	const action = req.body.action;

	const report = await getModerationReport(reportId);

	if (!report) {
		throw new ExpectedError('Missing moderation report.');
	}

	const playerId = report.target.id;

	let banEndDate = null;

	const promises = [];

	if (action === ModerationAction.closed) {
		promises.push(setModerationReport(reportId, { sorted: ModerationAction.closed }));
	} else if (action === ModerationAction.warning) {
		promises.push(
			setModerationReport(reportId, {
				sorted: action
			})
		);
		promises.push(
			createNotification(
				playerId,
				JSON.stringify({ message: 'banWarning', reason: report.reason }),
				NotificationSeverity.warning
			)
		);
	} else if (action === ModerationAction.shortBan) {
		banEndDate = new Date(Date.now() + SHORT_BAN_DURATION_MS);
		promises.push(
			createNotification(
				playerId,
				JSON.stringify({ message: 'ban', reason: report.reason, banEndDate: banEndDate }),
				NotificationSeverity.warning
			)
		);
	} else if (action === ModerationAction.mediumBan) {
		banEndDate = new Date(Date.now() + MEDIUM_BAN_DURATION_MS);
		promises.push(
			createNotification(
				playerId,
				JSON.stringify({ message: 'ban', reason: report.reason, banEndDate: banEndDate }),
				NotificationSeverity.warning
			)
		);
	} else if (action === ModerationAction.longBan) {
		banEndDate = new Date(Date.now() + LONG_BAN_DURATION_MS);
		promises.push(
			createNotification(
				playerId,
				JSON.stringify({ message: 'ban', reason: report.reason, banEndDate: banEndDate }),
				NotificationSeverity.warning
			)
		);
	} else if (action === ModerationAction.infiniteBan) {
		// Force end date to null in case it has been set before for the same report
		promises.push(
			setModerationReport(reportId, {
				sorted: ModerationAction.infiniteBan,
				banDate: new Date(Date.now()),
				banEndDate: null,
				bannedUser: { connect: { id: playerId } }
			})
		);
		// promises.push(updatePlayerBan(playerId, reportId));
		LOGGER.log(`Player ${playerId} has been banned by ${authed.name} (${authed.id}) indefinitely`);
	}

	if (banEndDate !== null) {
		promises.push(
			setModerationReport(reportId, {
				sorted: action,
				banDate: new Date(Date.now()),
				banEndDate: banEndDate,
				bannedUser: { connect: { id: playerId } }
			})
		);

		LOGGER.log(
			`Player ${report.target.name} (${playerId}) has been banned by ${authed.name} (${authed.id}) until ${banEndDate}`
		);
	}

	await Promise.all(promises);
}

/**
 * Get paginated list of banned players
 * @param req
 * @param req.params.page {number} page number to read
 * @returns list of moderation reports at a given page
 */
export async function getPaginatedBannedPlayers(req: Request) {
	await auth(req);

	const page = +req.params.page;

	return await getBannedPlayers(page);
}

/**
 * Directly ban a player and create at the same time the report
 * @param req
 * @param req.params.id {number} player ID
 * @param req.body.action {string} type of ban
 * @param req.body.reason {string} reason for the ban
 * @param req.body.comment {number} additional comment on the ban
 * @param req.body.dinozId {number} id of the dinoz concerned by the ban
 */
export async function banPlayer(req: Request) {
	const authed = await auth(req);
	const playerId = req.params.id;
	const player = await getPlayerBanInfo(playerId);
	const action = req.body.action;
	const reason = req.body.reason;
	const comment = req.body.comment;
	const dinozId = req.body.dinozId;

	if (!player) {
		throw new ExpectedError('Player not found');
	}

	// Update the ban of the player, even if it is already banned: create a report and execute the ban
	const report = await createModerationReport(authed.id, playerId, reason, comment, dinozId);

	let banEndDate = null;
	if (action === ModerationAction.shortBan) {
		banEndDate = new Date(Date.now() + SHORT_BAN_DURATION_MS);
	} else if (action === ModerationAction.mediumBan) {
		banEndDate = new Date(Date.now() + MEDIUM_BAN_DURATION_MS);
	} else if (action === ModerationAction.longBan) {
		banEndDate = new Date(Date.now() + LONG_BAN_DURATION_MS);
	} else if (action === ModerationAction.infiniteBan) {
		await setModerationReport(report.id, {
			sorted: ModerationAction.infiniteBan,
			banDate: new Date(Date.now()),
			bannedUser: { connect: { id: playerId } }
		});
		LOGGER.log(`Player ${player.name} (${playerId}) has been banned by ${authed.name}(${authed.id}) indefinitely`);
	}

	if (banEndDate !== null) {
		await setModerationReport(report.id, {
			sorted: action,
			banDate: new Date(Date.now()),
			banEndDate: banEndDate,
			bannedUser: { connect: { id: playerId } }
		});
		LOGGER.log(
			`Player ${player.name} (${playerId}) has been banned by ${authed.name}(${authed.id}) until ${banEndDate}`
		);
	}
}

/**
 * Update the ban of a player
 * @param req
 * @param req.params.id {number} player ID
 * @param req.body.action {string} type of ban
 */
export async function updateBan(req: Request) {
	const authed = await auth(req);
	const playerId = req.params.id;
	const player = await getPlayerBanInfo(playerId);

	if (!player) {
		throw new ExpectedError('Player not found');
	}

	if (!player.banCase) {
		throw new ExpectedError('Player is not banned');
	}

	if (!player.banCase.banDate) {
		throw new ExpectedError('Player missing ban date');
	}

	let newBanEndDate = null;
	if (req.body.action === ModerationAction.shortBan) {
		newBanEndDate = new Date(player.banCase.banDate.getTime() + SHORT_BAN_DURATION_MS);
	} else if (req.body.action === ModerationAction.mediumBan) {
		newBanEndDate = new Date(player.banCase.banDate.getTime() + MEDIUM_BAN_DURATION_MS);
	} else if (req.body.action === ModerationAction.longBan) {
		newBanEndDate = new Date(player.banCase.banDate.getTime() + LONG_BAN_DURATION_MS);
	}

	const updatedBanCase = {
		reason: req.body.reason,
		sorted: req.body.action,
		comment: req.body.comment,
		dinozId: req.body.dinozId,
		banEndDate: newBanEndDate
	};

	await setModerationReport(player.banCase.id, updatedBanCase);
	LOGGER.log(`Player ${player.name} (${playerId})'s ban has been updated by ${authed.name} (${authed.id}).`);
}

/**
 * Cancel ban of a player
 * @param req
 * @param req.params.id {number} player ID
 */
export async function cancelBan(req: Request) {
	const authed = await auth(req);
	const playerId = req.params.id;
	const player = await getPlayerBanInfo(playerId);

	if (!player) {
		throw new ExpectedError('Player not found');
	}

	if (!player.banCase) {
		throw new ExpectedError('Player is not banned');
	}

	await setModerationReport(player.banCase.id, { bannedUser: { disconnect: true } });
	LOGGER.log(`Player ${player.name} (${playerId})'s ban has been cancelled by ${authed.name} (${authed.id}).`);
}

export async function multipleBan(req: Request) {
	const authed = await auth(req);
	const list = req.body.list;

	for (const playerId of list) {
		const report = await createModerationReport(
			authed.id,
			playerId,
			ModerationReason.multi,
			`Banned by ${authed.name}`
		);
		const player = await getPlayerBanInfo(playerId);
		await setModerationReport(report.id, {
			sorted: ModerationAction.infiniteBan,
			banDate: new Date(Date.now()),
			bannedUser: { connect: { id: playerId } }
		});
		LOGGER.log(`Player ${player?.name} (${playerId}) has been banned by ${authed.name}(${authed.id}) indefinitely`);
	}
	console.log(list);
}
