import { ClanWar } from '@drpg/prisma';

export function computeWarPowers(war: Pick<ClanWar, 'isCastleDestroyed'>) {
	const attackerWon = war.isCastleDestroyed;

	const attackerPWin = attackerWon ? 100 : 10;
	const attackerPLost = attackerWon ? 10 : 100;

	const defenderPWin = attackerWon ? 10 : 100;
	const defenderPLost = attackerWon ? 100 : 10;

	return {
		attacker: { attackerPWin, attackerPLost },
		defender: { defenderPWin, defenderPLost }
	};
}
