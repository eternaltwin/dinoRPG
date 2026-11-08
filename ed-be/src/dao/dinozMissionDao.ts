import { LogType, Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { createLog, createLogForMultipleDinoz } from './logDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export const addMissionToDinoz = async (playerId: string, data: Prisma.DinozMissionCreateInput) => {
	if (!data.dinoz?.connect?.id) {
		throw new ExpectedError('Dinoz id is required');
	}

	await prisma.dinozMission.create({
		data,
		select: { id: true }
	});

	await createLog(LogType.MissionStep, playerId, data.dinoz.connect.id, data.missionId, data.step);
};

export const updateMissionStep = async (playerId: string, dinozIds: number[], missionId: number, step: number) => {
	await prisma.dinozMission.updateMany({
		where: {
			dinozId: { in: dinozIds },
			missionId
		},
		data: { step, progress: 0 }
	});

	await createLogForMultipleDinoz(LogType.MissionStep, playerId, dinozIds, missionId, step);
};

export const updateMissionProgression = async (
	dinozId: number,
	missionId: number,
	progress: Prisma.DinozMissionUpdateInput
) => {
	await prisma.dinozMission.update({
		where: { missionId_dinozId: { dinozId, missionId } },
		data: progress
	});
};

/**
 * Marks a mission finished, only if it was not yet: the caller pays the reward only when this returns `true`,
 * so concurrent requests can't each be rewarded.
 */
export const finishMission = async (playerId: string, dinozId: number, missionId: number): Promise<boolean> => {
	const { count } = await prisma.dinozMission.updateMany({
		where: { dinozId, missionId, isFinished: false },
		data: { isFinished: true }
	});
	if (count !== 1) {
		return false;
	}

	await createLog(LogType.MissionFinished, playerId, dinozId, missionId.toString());
	return true;
};

export const removeMissionFromDinoz = async (playerId: string, dinozId: number, missionId: number) => {
	await prisma.dinozMission.delete({
		where: { missionId_dinozId: { dinozId, missionId } }
	});

	await createLog(LogType.MissionCanceled, playerId, dinozId, missionId.toString());
};

export async function removeAllMissionsFromDinoz(dinozId: number) {
	await prisma.dinozMission.deleteMany({
		where: { dinozId: dinozId }
	});
}
