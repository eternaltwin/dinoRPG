
import { Concentration, Dinoz } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export async function setConcentration(concentration: Concentration & { dinoz: Pick<Dinoz, 'id'>[] }) {
	const dinoz = concentration.dinoz.map(d => ({ id: d.id }));

	const object = await prisma.concentration.upsert({
		where: {
			id: concentration.id
		},
		create: {
			dinoz: { connect: dinoz }
		},
		update: {
			dinoz: { set: dinoz }
		},
		include: {
			dinoz: true
		}
	});

	return object;
}

export async function getConcentration(concentrationId: number) {
	const concentration = await prisma.concentration.findUnique({
		where: {
			id: concentrationId
		},
		include: {
			dinoz: true
		}
	});

	return concentration;
}

export async function removeConcentration(id: number) {
	await prisma.concentration.delete({
		where: { id }
	});
}
