import { Request } from 'express';
import { dinorpg } from 'twinoid-goals';
import { setSpecificStat } from '../dao/trackingDao.js';

export async function displayPlayerGoals(req: Request) {
	await setSpecificStat('1', 1, 10);
}
