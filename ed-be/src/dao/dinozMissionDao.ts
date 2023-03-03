import { AppDataSource } from '../data-source.js';
import { DinozMission } from '../entity/index.js';
import { DeleteResult } from 'typeorm';

const missionRepository = AppDataSource.getRepository(DinozMission);

const addMissionToDinoz = (mission: DinozMission): Promise<DinozMission> => {
	return missionRepository.save(mission);
};

const updateMissionStep = (dinozId: number, missionId: number, step: number) => {
	return missionRepository
		.createQueryBuilder()
		.update(DinozMission)
		.set({ step: step, progress: 0 })
		.where('dinoz.id = :dId AND missionId = :mId', { dId: dinozId, mId: missionId })
		.execute();
};

const updateMissionProgression = (dinozId: number, missionId: number, progress: number) => {
	return missionRepository
		.createQueryBuilder()
		.update(DinozMission)
		.set({ progress: () => 'progress + :addedProgress' })
		.setParameter('addedProgress', progress)
		.where('dinoz.id = :dId AND missionId = :mId', { dId: dinozId, mId: missionId })
		.execute();
};

const finishMission = (dinozId: number, missionId: number) => {
	return missionRepository
		.createQueryBuilder()
		.update(DinozMission)
		.set({ isFinished: true })
		.where('dinoz.id = :dId AND missionId = :mId', { dId: dinozId, mId: missionId })
		.execute();
};

const removeMissionToDinoz = (dinozId: number, missionId: number): Promise<DeleteResult> => {
	return missionRepository
		.createQueryBuilder()
		.delete()
		.from(DinozMission)
		.where('missionId = :mId AND dinoz.id = :dId', { mId: missionId, dId: dinozId })
		.execute();
};

export { addMissionToDinoz, updateMissionStep, updateMissionProgression, finishMission, removeMissionToDinoz };
