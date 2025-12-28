import { prisma } from '../prisma.js';

export const getPlayerBuilds = (playerId: string) => {
	return prisma.dinozBuild.findMany({
		where: { playerId }
	});
};

export const getBuild = (buildId: string) => {
	return prisma.dinozBuild.findUnique({
		where: { id: buildId }
	});
};

export const createBuild = (playerId: string, skills: number[], name: string, shareable: boolean) => {
	return prisma.dinozBuild.create({
		data: { player: { connect: { id: playerId } }, skills, shareable, name },
		select: { id: true }
	});
};

export const updateBuildSkills = (buildId: string, skills: number[], name: string, shareable: boolean) => {
	return prisma.dinozBuild.update({
		where: { id: buildId },
		data: { skills, name, shareable },
		select: { id: true }
	});
};

export const deleteBuild = (buildId: string) => {
	return prisma.dinozBuild.delete({ where: { id: buildId } });
};

export const assignBuildToDinoz = (dinozId: number, buildId: string | null) => {
	return prisma.dinoz.update({ where: { id: dinozId }, data: { buildId }, select: { id: true } });
};

export const getClanSharedBuilds = (clanId: number) => {
	return prisma.dinozBuild.findMany({
		where: {
			shareable: true,
			player: { ClanMember: { is: { clanId } } }
		}
	});
};
