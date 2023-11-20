import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';


export function addItemToDinoz(item: Prisma.DinozItemCreateInput) {
	return prisma.dinozItem.create({
		data: item
	});
}

export async function removeItemFromDinoz(id: number) {
	await prisma.dinozItem.delete({
		where: { id }
	});
}
