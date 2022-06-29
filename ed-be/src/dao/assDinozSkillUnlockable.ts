import { AssDinozSkillUnlockable } from '../models/index.js';

const removeUnlockableSkillsToDinoz = (dinozId: number, skillId: Array<number>): Promise<number> => {
	return AssDinozSkillUnlockable.destroy({
		where: {
			dinozId,
			skillId
		}
	});
};

const addMultipleUnlockableSkills = (skills: Array<AssDinozSkillUnlockable>) => {
	return AssDinozSkillUnlockable.bulkCreate(skills);
};

export { removeUnlockableSkillsToDinoz, addMultipleUnlockableSkills };
