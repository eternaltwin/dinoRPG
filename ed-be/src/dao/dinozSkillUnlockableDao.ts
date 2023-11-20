import { Prisma } from "@drpg/prisma";
import { prisma } from "../prisma.js";


export async function removeUnlockableSkillsFromDinoz(dinozId: number, skillId: number[]) {
	await prisma.dinozSkillUnlockable.deleteMany({
		where: { dinozId, skillId: { in: skillId } }
	});
}

//TODO
export async function addMultipleUnlockableSkills(skills: Prisma.DinozSkillUnlockableCreateManyInput[]) {
	await prisma.dinozSkillUnlockable.createMany({
		data: skills
	});
}
