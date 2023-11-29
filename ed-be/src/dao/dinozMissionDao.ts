import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export const addMissionToDinoz = async (data: Prisma.DinozMissionCreateInput) => {
	const mission = await prisma.dinozMission.create({
		data
	});

	return mission;
};

export const updateMissionStep = async (dinozIds: number[], missionId: number, step: number) => {
	await prisma.dinozMission.updateMany({
		where: {
			dinozId: { in: dinozIds },
			missionId
		},
		data: { step }
	});
};

export const updateMissionProgression = async (dinozId: number, missionId: number, progress: number) => {
	await prisma.dinozMission.update({
		where: { missionId_dinozId: { dinozId, missionId } },
		data: { progress }
	});
};

export const finishMission = async (dinozId: number, missionId: number) => {
	await prisma.dinozMission.update({
		where: { missionId_dinozId: { dinozId, missionId } },
		data: { isFinished: true }
	});
};

export const removeMissionFromDinoz = async (dinozId: number, missionId: number) => {
	await prisma.dinozMission.delete({
		where: { missionId_dinozId: { dinozId, missionId } }
	});
};
