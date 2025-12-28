import type { Request } from 'express';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { auth, ownsDinoz } from '../dao/playerDao.js';
import {
	assignBuildToDinoz,
	createBuild,
	deleteBuild,
	getBuild,
	getPlayerBuilds,
	updateBuildSkills,
	getClanSharedBuilds
} from '../dao/dinozBuildDao.js';
import { prisma } from '../prisma.js';

const toIntArray = (v: unknown) => {
	const array = Array.isArray(v) ? v : [];
	const numbers = array.map(n => Number(n));

	if (!numbers.every(Number.isInteger)) throw new ExpectedError('Invalid skills array');

	return numbers;
}

export const listBuilds = async (req: Request) => {
	const authed = await auth(req);

	return getPlayerBuilds(authed.id);
}

export const createNewBuild = async (req: Request) => {
	const authed = await auth(req);
	const skills = toIntArray(req.body.skills);
	const name = String(req.body.name);
	const shareable = Boolean(req.body.shareable);

	await createBuild(authed.id, skills, name, shareable);
}

export const updateBuild = async (req: Request) => {
	const authed = await auth(req);
	const buildId = String(req.params.buildId);

	const build = await getBuild(buildId);

	if (!build || build.playerId !== authed.id) throw new ExpectedError('Build not found');

	const skills = toIntArray(req.body.skills);
	const name = String(req.body.name);
	const shareable = Boolean(req.body.shareable);

	await updateBuildSkills(buildId, skills, name, shareable);
}

export const removeBuild = async (req: Request) => {
	const authed = await auth(req);
	const buildId = String(req.params.buildId);

	const build = await getBuild(buildId);

	if (!build || build.playerId !== authed.id) throw new ExpectedError('Build not found');

	await deleteBuild(buildId);
}

export const listClanSharedBuilds = async (req: Request) => {
	const authed = await auth(req);

	const clanMember = await prisma.clanMember.findUnique({ where: { playerId: authed.id }, select: { clanId: true } });
	if (!clanMember) return [];

	return getClanSharedBuilds(clanMember.clanId, authed.id);
}

export const copySharedBuild = async (req: Request) => {
	const authed = await auth(req);
	const buildId = String(req.params.buildId);

	const build = await getBuild(buildId);

	if (!build) throw new ExpectedError('Build not found');
	if (build.playerId === authed.id) throw new ExpectedError('Cannot copy own build');
	if (!build.shareable) throw new ExpectedError('Build is not shareable');

	return createBuild(authed.id, build.skills, build.name, build.shareable);
}

export const assignBuild = async (req: Request) => {
	const authed = await auth(req);
	const dinozId = +req.params.id;
	const buildId = req.body.buildId ? String(req.body.buildId) : null;

	const owns = await ownsDinoz(authed.id, dinozId);

	if (!owns) throw new ExpectedError('Invalid dinoz');

	if (buildId) {
		const build = await getBuild(buildId);
		if (!build || build.playerId !== authed.id) throw new ExpectedError('Build not found');
	}

	await assignBuildToDinoz(dinozId, buildId);
}
