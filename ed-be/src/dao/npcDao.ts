import { AppDataSource } from '../data-source.js';
import { NPC } from '../entity/index.js';
import { UpdateResult } from 'typeorm';

const npcRepository = AppDataSource.getRepository(NPC);

const getDinozStep = (dinozId: number, npcId: number): Promise<NPC | null> => {
	return npcRepository
		.createQueryBuilder('npc')
		.select(['npc.npcId', 'npc.step'])
		.where('npc.dinozId = :dId AND npc.npcId = :nId', { dId: dinozId, nId: npcId })
		.getOne();
};

const createDinozStep = (npc: NPC): Promise<NPC> => {
	return npcRepository.save(npc);
};

const updateDinozStep = (dinoz: number, npcId: number, step: string): Promise<UpdateResult> => {
	return npcRepository
		.createQueryBuilder()
		.update(NPC)
		.set({ step: step })
		.where('dinoz.id = :d AND npcId = :n', { d: dinoz, n: npcId })
		.execute();
};

export { getDinozStep, createDinozStep, updateDinozStep };
