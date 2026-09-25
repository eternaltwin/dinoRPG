import { prisma } from '../prisma.js';

export async function upsertToken(playerId: string, accessToken: string, scope: string, expiresAt: Date | null) {
	return prisma.playerEternaltwinToken.upsert({
		where: { playerId },
		create: { playerId, accessToken, scope, expiresAt },
		update: { accessToken, scope, expiresAt, obtainedAt: new Date() }
	});
}

export type EternaltwinToken = Awaited<ReturnType<typeof getToken>>;
export async function getToken(playerId: string) {
	return prisma.playerEternaltwinToken.findUnique({ where: { playerId } });
}

export async function deleteToken(playerId: string) {
	await prisma.playerEternaltwinToken.deleteMany({ where: { playerId } });
}
