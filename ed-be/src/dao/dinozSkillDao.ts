import { prisma } from '../prisma.js';

export async function setSkillStateRequest(dinozId: number, skillId: number, state: boolean) {
	await prisma.dinozSkill.update({
		where: { skillId_dinozId: { dinozId, skillId } },
		data: { state }
	});
}

//TODO
export async function addSkillToDinoz(dinozId: number, skillId: number) {
	await prisma.dinozSkill.create({
		data: {
			dinozId,
			skillId
		}
	});
}

//TODO
export async function addMultipleSkillToDinoz(dinozId: number,  skillIds: number[]) {
	await prisma.dinozSkill.createMany({
		data: skillIds.map(skillId => ({
			dinozId,
			skillId
		}))
	});
}

export async function removeSkillFromDinoz(dinozId: number, skillId: number) {
	await prisma.dinozSkill.delete({
		where: { skillId_dinozId: { dinozId, skillId } }
	});
}
