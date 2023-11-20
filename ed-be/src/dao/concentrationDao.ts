
import { Dinoz } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export const createConcentration = async (dinozList: Pick<Dinoz, 'id'>[]) => {
	const concentration = await prisma.concentration.create({
		data: {
			dinoz: {
				connect: dinozList
			}
		},
		include: {
			dinoz: { select: { id: true } }
		}
	});

	return concentration;
};

export const updateConcentration = async (concentrationId: number, dinozList: Pick<Dinoz, 'id'>[]) => {
	const concentration = await prisma.concentration.update({
		where: {
			id: concentrationId
		},
		data: {
			dinoz: {
				set: dinozList
			}
		}
	});

	return concentration;
};

export type ConcentrationFromGetConcentration = Awaited<ReturnType<typeof getConcentration>>;
export async function getConcentration(concentrationId: number) {
	const concentration = await prisma.concentration.findUnique({
		where: {
			id: concentrationId
		},
		include: {
			dinoz: { select: { id: true } }
		}
	});

	return concentration;
}

export async function removeConcentration(id: number) {
	await prisma.concentration.delete({
		where: { id }
	});
}
