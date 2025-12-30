import { Reward } from '@drpg/core/models/reward/RewardList';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import type { Request } from 'express';
import {
	assignBuildToDinoz,
	createBuild,
	deleteBuild,
	getBuild,
	getClanSharedBuilds,
	getPlayerBuilds,
	updateBuildSkills
} from '../dao/dinozBuildDao.js';
import { auth, getPlayerForDinozBuildChecks, ownsDinoz } from '../dao/playerDao.js';
import { prisma } from '../prisma.js';

const toIntArray = (v: unknown) => {
	const array = Array.isArray(v) ? v : [];
	const numbers = array.map(n => Number(n));

	if (!numbers.every(Number.isInteger)) throw new ExpectedError('Invalid skills array');

	return numbers;
};

const hasPAC = (player: Awaited<ReturnType<typeof getPlayerForDinozBuildChecks>>) => {
	return player.rewards?.some(r => r.rewardId === Reward.PAC);
};

const areSkillsDiscovered = (player: Awaited<ReturnType<typeof getPlayerForDinozBuildChecks>>, skills: number[]) => {
	return skills.every(skillId => player.discoveredSkills.includes(skillId));
};

export const listBuilds = async (req: Request) => {
	const authed = await auth(req);

	return getPlayerBuilds(authed.id);
};

export const createNewBuild = async (req: Request) => {
	const authed = await auth(req);
	const player = await getPlayerForDinozBuildChecks(authed.id);

	if (!hasPAC(player)) {
		throw new ExpectedError('PAC is required to create dinoz builds');
	}

	const skills = toIntArray(req.body.skills);

	if (!areSkillsDiscovered(player, skills)) {
		throw new ExpectedError('One or more skills have not been discovered');
	}

	const name = String(req.body.name);

	if (name.length === 0) {
		throw new ExpectedError('Build name cannot be empty');
	}

	const shareable = Boolean(req.body.shareable);

	return createBuild(authed.id, skills, name, shareable);
};

export const updateBuild = async (req: Request) => {
	const authed = await auth(req);
	const player = await getPlayerForDinozBuildChecks(authed.id);

	if (!hasPAC(player)) {
		throw new ExpectedError('PAC is required to create dinoz builds');
	}

	const buildId = String(req.params.buildId);

	const build = await getBuild(buildId);

	if (!build || build.playerId !== authed.id) throw new ExpectedError('Build not found');

	const skills = toIntArray(req.body.skills);

	if (!areSkillsDiscovered(player, skills)) {
		throw new ExpectedError('One or more skills have not been discovered');
	}

	const name = String(req.body.name);

	if (name.length === 0) {
		throw new ExpectedError('Build name cannot be empty');
	}

	const shareable = Boolean(req.body.shareable);

	await updateBuildSkills(buildId, skills, name, shareable);
};

export const removeBuild = async (req: Request) => {
	const authed = await auth(req);
	const player = await getPlayerForDinozBuildChecks(authed.id);

	if (!hasPAC(player)) {
		throw new ExpectedError('PAC is required to delete dinoz builds');
	}

	const buildId = String(req.params.buildId);

	const build = await getBuild(buildId);

	if (!build || build.playerId !== authed.id) throw new ExpectedError('Build not found');

	await deleteBuild(buildId);
};

export const listClanSharedBuilds = async (req: Request) => {
	const authed = await auth(req);
	const player = await getPlayerForDinozBuildChecks(authed.id);

	if (!hasPAC(player)) {
		throw new ExpectedError('PAC is required to view clan shared dinoz builds');
	}

	const clanMember = await prisma.clanMember.findUnique({ where: { playerId: authed.id }, select: { clanId: true } });
	if (!clanMember) return [];

	return getClanSharedBuilds(clanMember.clanId);
};

export const copySharedBuild = async (req: Request) => {
	const authed = await auth(req);
	const player = await getPlayerForDinozBuildChecks(authed.id);

	if (!hasPAC(player)) {
		throw new ExpectedError('PAC is required to copy dinoz builds');
	}

	const buildId = String(req.params.buildId);

	const build = await getBuild(buildId);

	if (!build) throw new ExpectedError('Build not found');
	if (build.playerId === authed.id) throw new ExpectedError('Cannot copy own build');
	if (!build.shareable) throw new ExpectedError('Build is not shareable');

	return createBuild(authed.id, build.skills, build.name, build.shareable);
};

export const assignBuild = async (req: Request) => {
	const authed = await auth(req);
	const player = await getPlayerForDinozBuildChecks(authed.id);

	if (!hasPAC(player)) {
		throw new ExpectedError('PAC is required to assign dinoz builds');
	}

	const dinozId = +req.params.id;
	const buildId = req.body.buildId ? String(req.body.buildId) : null;

	const owns = await ownsDinoz(authed.id, dinozId);

	if (!owns) throw new ExpectedError('Invalid dinoz');

	if (buildId) {
		const build = await getBuild(buildId);
		if (!build || build.playerId !== authed.id) throw new ExpectedError('Build not found');
	}

	await assignBuildToDinoz(dinozId, buildId);
};
