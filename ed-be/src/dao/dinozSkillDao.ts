import { DeleteResult, UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { DinozSkill } from '../entity/index.js';

const skillRepository = AppDataSource.getRepository(DinozSkill);

const setSkillStateRequest = async (dinozId: number, skillId: number, state: boolean): Promise<UpdateResult> => {
	return skillRepository
		.createQueryBuilder('skill')
		.update(DinozSkill)
		.set({ state: state })
		.where('skillId = :sId AND dinoz.id = :dId', { sId: skillId, dId: dinozId })
		.execute();
};

//TODO
const addSkillToDinoz = (skill: DinozSkill): Promise<DinozSkill> => {
	return skillRepository.save(skill);
};

//TODO
const addMultipleSkillToDinoz = (skills: Array<DinozSkill>): Promise<Array<DinozSkill>> => {
	return skillRepository.save(skills);
};

const removeSkillToDinoz = (dinozId: number, skillId: number): Promise<DeleteResult> => {
	return skillRepository
		.createQueryBuilder()
		.delete()
		.from(DinozSkill)
		.where('skillId = :sId AND dinoz.id = :dId', { sId: skillId, dId: dinozId })
		.execute();
};

export { addSkillToDinoz, removeSkillToDinoz, addMultipleSkillToDinoz, setSkillStateRequest };
