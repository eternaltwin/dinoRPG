import { AssDinozSkill, DinozSkillEdit } from '../models/index.js';

const addSkillToDinoz = (
	dinozId: number,
	skillId: number
): Promise<AssDinozSkill> => {
	return AssDinozSkill.create({
		dinozId: dinozId,
		skillId: skillId
	});
};

const addMultipleSkillToDinoz = (
	skills: Array<DinozSkillEdit>
): Promise<Array<AssDinozSkill>> => {
	return AssDinozSkill.bulkCreate(skills);
};

const removeSkillToDinoz = (
	dinozId: number,
	skillId: number
): Promise<number> => {
	return AssDinozSkill.destroy({
		where: {
			dinozId: dinozId,
			skillId: skillId
		}
	});
};

export { addSkillToDinoz, removeSkillToDinoz, addMultipleSkillToDinoz };
