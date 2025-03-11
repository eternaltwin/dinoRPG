import { GameDinozUsage, Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export async function removeUnlockableSkillsFromDinoz(dinozId: number, skillId: number[], event?: GameDinozUsage) {
	if (event) {
		await prisma.dinozSkillUnlockable.deleteMany({
			where: { gameDinozId: dinozId, skillId: { in: skillId } }
		});
	} else {
		await prisma.dinozSkillUnlockable.deleteMany({
			where: { dinozId: dinozId, skillId: { in: skillId } }
		});
	}
}

//TODO
export async function addMultipleUnlockableSkills(
	skills: Prisma.DinozSkillUnlockableCreateManyInput[],
	event?: GameDinozUsage
) {
	if (event) {
		await prisma.dinozSkillUnlockable.createMany({
			data: skills
		});
	} else {
		await prisma.dinozSkillUnlockable.createMany({
			data: skills
		});
	}
}

export async function removeAllUnlockableSkillsFromDinoz(dinozId: number) {
	await prisma.dinozSkillUnlockable.deleteMany({
		where: { dinozId: dinozId }
	});
}
