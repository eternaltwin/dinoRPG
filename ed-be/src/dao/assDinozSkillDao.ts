import { AssDinozSkill } from '../models/index.js';

const addSkillToDinoz = (
	dinozId: number,
	skillId: number
): Promise<AssDinozSkill> => {
	return AssDinozSkill.create({
		dinozId: dinozId,
		skillId: skillId
	});
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

export { addSkillToDinoz, removeSkillToDinoz };
