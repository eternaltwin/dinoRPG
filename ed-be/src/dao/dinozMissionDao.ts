import { LogType, Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { createLog, createLogForMultipleDinoz } from './logDao.js';

export const addMissionToDinoz = async (playerId: number, data: Prisma.DinozMissionCreateInput) => {
	if (!data.dinoz?.connect?.id) {
		throw new Error('Dinoz id is required');
	}

	await prisma.dinozMission.create({
		data,
		select: { id: true }
	});

	await createLog(LogType.MissionStep, playerId, data.dinoz.connect.id, data.missionId, data.step);
};

export const updateMissionStep = async (playerId: number, dinozIds: number[], missionId: number, step: number) => {
	await prisma.dinozMission.updateMany({
		where: {
			dinozId: { in: dinozIds },
			missionId
		},
		data: { step }
	});

	await createLogForMultipleDinoz(LogType.MissionStep, playerId, dinozIds, missionId, step);
};

export const updateMissionProgression = async (dinozId: number, missionId: number, progress: number) => {
	await prisma.dinozMission.update({
		where: { missionId_dinozId: { dinozId, missionId } },
		data: { progress }
	});
};

export const finishMission = async (playerId: number, dinozId: number, missionId: number) => {
	await prisma.dinozMission.update({
		where: { missionId_dinozId: { dinozId, missionId } },
		data: { isFinished: true }
	});

	await createLog(LogType.MissionFinished, playerId, dinozId, missionId.toString());
};

export const removeMissionFromDinoz = async (playerId: number, dinozId: number, missionId: number) => {
	await prisma.dinozMission.delete({
		where: { missionId_dinozId: { dinozId, missionId } }
	});

	await createLog(LogType.MissionCanceled, playerId, dinozId, missionId.toString());
};
