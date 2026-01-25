import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

const getDinozStep = async (dinozId: number, npcId: number) => {
	const npc = await prisma.nPC.findFirst({
		where: {
			dinozId,
			npcId
		},
		select: { npcId: true, step: true }
	});

	return npc;
};

const createDinozStep = async (dinozId: number, npc: Prisma.NPCCreateInput) => {
	const createdNpc = await prisma.nPC.create({
		data: {
			dinoz: { connect: { id: dinozId } },
			...npc
		}
	});

	return createdNpc;
};

const updateDinozStep = async (dinoz: number, npcId: number, step: string) => {
	const testNPC = await prisma.nPC.findFirst({
		where: {
			dinozId: dinoz,
			npcId: npcId
		}
	});
	if (!testNPC) {
		return;
	}
	await prisma.nPC.update({
		where: {
			npcId_dinozId: { dinozId: dinoz, npcId }
		},
		data: {
			step
		}
	});
};

export { createDinozStep, getDinozStep, updateDinozStep };
