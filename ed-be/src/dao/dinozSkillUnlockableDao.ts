import { AppDataSource } from '../data-source.js';
import { DinozSkillUnlockable } from '../entity/index.js';
import { DeleteResult } from 'typeorm';

const skillUnlockableRepository = AppDataSource.getRepository(DinozSkillUnlockable);

export async function removeUnlockableSkillsToDinoz(dinozId: number, skillId: Array<number>): Promise<DeleteResult> {
	return skillUnlockableRepository
		.createQueryBuilder()
		.delete()
		.from(DinozSkillUnlockable)
		.where('skillId IN (:...sId) AND dinoz.id = :dId', { sId: skillId, dId: dinozId })
		.execute();
}

//TODO
export async function addMultipleUnlockableSkills(skills: Array<DinozSkillUnlockable>) {
	return skillUnlockableRepository.save(skills);
}
