import { Request } from 'express';
// import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { PantheonMotif } from '@drpg/prisma';
import { getPantheons } from '../dao/pantheonDao.js';
import { raceList } from '@drpg/core/models/dinoz/RaceList';

export async function getPantheon(req: Request) {
	const type = req.params.type as PantheonMotif;
	const level = req.query.level ? +req.query.level : null;
	const race = req.query.race ? req.query.race : null;
	const rewardId = req.query.rewardId ? +req.query.rewardId : null;

	const raceId = Object.values(raceList).find(r => r.name === race)?.raceId ?? null;

	return await getPantheons(type, level, raceId, rewardId);
}
