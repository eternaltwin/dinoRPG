import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export function getAllSecretsRequest() {
	return prisma.secret.findMany();
}

export function getSpecificSecret(secret: string) {
	return prisma.secret.findFirst({
		where: {
			key: secret
		},
		select: { key: true, value: true }
	});
}

export function addNewSecret(secret: Prisma.SecretCreateInput) {
	return prisma.secret.create({
		data: secret
	});
}
