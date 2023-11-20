import { DeleteResult, UpdateResult } from 'typeorm';
import { prisma } from '../prisma.js';
import { DinozSkill, Prisma } from '@drpg/prisma';

export async function setSkillStateRequest(dinozId: number, skillId: number, state: boolean) {
	await prisma.dinozSkill.update({
		where: { skillId_dinozId: { dinozId, skillId } },
		data: { state }
	});
}

//TODO
export async function addSkillToDinoz(skill: Prisma.DinozSkillCreateInput) {
	await prisma.dinozSkill.create({
		data: skill
	});
}

//TODO
export async function addMultipleSkillToDinoz(skills: Prisma.DinozSkillCreateManyInput[]) {
	await prisma.dinozSkill.createMany({
		data: skills
	});
}

export async function removeSkillFromDinoz(dinozId: number, skillId: number) {
	await prisma.dinozSkill.delete({
		where: { skillId_dinozId: { dinozId, skillId } }
	});
}
