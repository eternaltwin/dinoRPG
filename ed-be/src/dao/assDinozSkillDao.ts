import { AssDinozSkill } from '../models/index.js';

const addSkillToDinoz = (dinozId: number, skillId: number): void => {
	AssDinozSkill.create({
		dinozId: dinozId,
		skillId: skillId,
	});
};

export { addSkillToDinoz };
