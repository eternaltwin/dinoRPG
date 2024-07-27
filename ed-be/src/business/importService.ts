import { Request } from 'express';
import {
	getImportedPlayerSite,
	getImportedPlayerSpecificSiteAchievements,
	getImportedPlayerSpecificSiteStat
} from '../dao/importDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export async function displayTwinoidSite(req: Request) {
	const playerId = +req.params.id;
	const playerSite = await getImportedPlayerSite(playerId);
	return playerSite.map(site => ({
		siteId: site.siteId,
		npoints: site.npoints
	}));
}

export async function displayTwinoidSpecificSite(req: Request) {
	const site = +req.params.site;
	const playerId = +req.params.id;
	const type = req.params.type;
	if (type === 'stat') {
		const playerSite = await getImportedPlayerSpecificSiteStat(playerId, site);
		return playerSite.map(site => ({
			name: site.nameId,
			score: site.score
		}));
	} else {
		if (!req.auth?.playerId) {
			throw new ExpectedError(`You are not logged in.`);
		}
		const playerSite = await getImportedPlayerSpecificSiteAchievements(req.auth.playerId, site);
		return playerSite.map(site => ({
			name: site.nameId,
			requirement: site.requirement,
			quantity: site.quantity
		}));
	}
}
