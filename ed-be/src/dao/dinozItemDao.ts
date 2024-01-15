import { prisma } from '../prisma.js';

export function addItemToDinoz(dinozId: number, itemId: number) {
	return prisma.dinozItem.create({
		data: {
			dinozId,
			itemId
		}
	});
}

export async function removeItemFromDinoz(dinozId: number, itemId: number) {
	const item = await prisma.dinozItem.findFirst({
		where: {
			itemId,
			dinozId
		},
		select: {
			id: true
		}
	});

	if (!item) {
		return;
	}

	await prisma.dinozItem.delete({
		where: { id: item.id }
	});
}
