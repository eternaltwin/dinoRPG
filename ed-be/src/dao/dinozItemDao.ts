import { prisma } from '../prisma.js';

export function addItemToDinoz(dinozId: number, itemId: number) {
	return prisma.dinozItem.create({
		data: {
			dinozId,
			itemId
		}
	});
}

export async function removeItemFromDinoz(id: number) {
	await prisma.dinozItem.delete({
		where: { id }
	});
}
