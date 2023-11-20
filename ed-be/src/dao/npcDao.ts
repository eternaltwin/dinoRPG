import { NPC } from '@drpg/prisma';
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

const createDinozStep = async (npc: NPC) => {
	const createdNpc = await prisma.nPC.create({
		data: npc
	});

	return createdNpc;
};

const updateDinozStep = async (dinoz: number, npcId: number, step: string) => {
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

