import { PismaClientLocal, prisma } from '../prisma.js';
import { withSpan } from '../utils/server/tracing.js';
import { Prisma, UnavailableReason } from '@drpg/prisma';
import { ArchetypeContext } from '@drpg/core/models/dojo/tournamentArchetypes';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { Skill } from '@drpg/core/models/dinoz/SkillList';

export async function getLatestTournament() {
	return withSpan(getLatestTournament.name, async () => {
		return await prisma.tournament.findFirst({
			orderBy: {
				date: 'desc'
			},
			select: {
				id: true,
				date: true,
				raceMinimum: true,
				teamRace: true,
				teamSize: true,
				levelLimit: true,
				formatName: true,
				poison: true,
				metaArchetype: true,
				rules: true
			}
		});
	});
}

export async function incrementCashPrice(tournamentId: string, quantity: number) {
	return withSpan(incrementCashPrice.name, async () => {
		await prisma.tournament.update({
			where: {
				id: tournamentId
			},
			data: {
				cashPrice: { increment: quantity }
			}
		});
	});
}

/** Number of tournaments (the reference one included) used for the registrations of the echo `outsiders` sub. */
const RECENT_TOURNAMENTS = 3;
/** Pools finals (round 3) gather the 8 finalist teams. */
const POOL_FINALS_ROUND = 3;
/** Grand final (round 7) decides the champion. */
const GRAND_FINAL_ROUND = 7;

function countBy<K extends number>(rows: { key: number; count: number }[]): Partial<Record<K, number>> {
	const result: Partial<Record<K, number>> = {};
	for (const row of rows) {
		result[row.key as K] = (result[row.key as K] ?? 0) + row.count;
	}
	return result;
}

/** Number of dinoz of each race matching the filter. */
async function countRaces(
	prisma: PismaClientLocal,
	where: Prisma.DinozWhereInput
): Promise<Partial<Record<RaceEnum, number>>> {
	const rows = await prisma.dinoz.groupBy({
		by: ['raceId'],
		where,
		_count: { _all: true }
	});
	return countBy<RaceEnum>(rows.map(r => ({ key: r.raceId, count: r._count._all })));
}

/** Teams that fought in a round of a tournament (byes excluded). */
async function getTeamsOfRound(prisma: PismaClientLocal, tournamentId: string, round: number): Promise<string[]> {
	const fights = await prisma.fightArchive.findMany({
		where: { tournamentId, tournamentStep: round },
		select: { tournamentTeamLeftId: true, tournamentTeamRightId: true }
	});
	return [
		...new Set(
			fights.flatMap(f => [f.tournamentTeamLeftId, f.tournamentTeamRightId]).filter((id): id is string => !!id)
		)
	];
}

/**
 * Computes the history used by the echo sub archetypes, and the race population used by monorace.
 *
 * Dinoz counts come from a groupBy on the dinoz: a dinoz registered in several of the considered teams counts once.
 * Skills are the current skills of the dinoz, not the ones they had during the tournament.
 *
 * @param prisma - The prisma client.
 * @param params.referenceTournamentId - The tournament whose qualification is over: its qualified teams, featured races
 * and registrations are used.
 * @param params.finishedTournamentId - The last finished tournament (its champion and finalists are used), null if none.
 * @param params.qualifiedTeamIds - The teams qualified for the reference tournament. When absent, they are read from the
 * fights of its first round.
 */
export async function getArchetypeContext(
	prisma: PismaClientLocal,
	params: { referenceTournamentId: string; finishedTournamentId: string | null; qualifiedTeamIds?: string[] }
): Promise<ArchetypeContext> {
	const reference = await prisma.tournament.findUnique({
		where: { id: params.referenceTournamentId },
		select: { date: true, featuredRaces: true }
	});

	// Races of the teams qualified for the reference tournament
	const qualifiedTeamIds = params.qualifiedTeamIds ?? (await getTeamsOfRound(prisma, params.referenceTournamentId, 0));
	const lastQualifiedRaces =
		qualifiedTeamIds.length > 0
			? await countRaces(prisma, { TournamentTeam: { some: { id: { in: qualifiedTeamIds } } } })
			: {};

	// Races registered over the last tournaments (the reference one included)
	const recentTournaments = reference
		? await prisma.tournament.findMany({
				where: { date: { lte: reference.date } },
				orderBy: { date: 'desc' },
				take: RECENT_TOURNAMENTS,
				select: { id: true }
			})
		: [];
	const recentRegisteredRaces =
		recentTournaments.length > 0
			? await countRaces(prisma, {
					TournamentTeam: { some: { tournamentId: { in: recentTournaments.map(t => t.id) } } }
				})
			: {};

	// Champion and finalists of the last finished tournament
	let lastChampionRaces: RaceEnum[] = [];
	let lastFinalistSkills: Partial<Record<Skill, number>> = {};
	if (params.finishedTournamentId) {
		const grandFinal = await prisma.fightArchive.findFirst({
			where: { tournamentId: params.finishedTournamentId, tournamentStep: GRAND_FINAL_ROUND },
			select: { result: true, tournamentTeamLeftId: true, tournamentTeamRightId: true }
		});
		// Same rule as rewardTournament: a true result means the left team won
		let championTeamId: string | null = null;
		if (grandFinal) {
			championTeamId = grandFinal.result ? grandFinal.tournamentTeamLeftId : grandFinal.tournamentTeamRightId;
		}
		if (championTeamId) {
			const champion = await prisma.dinoz.findMany({
				where: { TournamentTeam: { some: { id: championTeamId } } },
				select: { raceId: true }
			});
			lastChampionRaces = [...new Set(champion.map(d => d.raceId as RaceEnum))];
		}

		const finalistTeamIds = await getTeamsOfRound(prisma, params.finishedTournamentId, POOL_FINALS_ROUND);
		if (finalistTeamIds.length > 0) {
			const rows = await prisma.dinozSkill.groupBy({
				by: ['skillId'],
				where: { dinoz: { TournamentTeam: { some: { id: { in: finalistTeamIds } } } } },
				_count: { _all: true }
			});
			lastFinalistSkills = countBy<Skill>(rows.map(r => ({ key: r.skillId, count: r._count._all })));
		}
	}

	// Active dinoz of each race
	const racePopulation = await countRaces(prisma, {
		OR: [
			{ unavailableReason: null },
			{ unavailableReason: { notIn: [UnavailableReason.frozen, UnavailableReason.sacrificed] } }
		]
	});

	return {
		lastQualifiedRaces,
		recentRegisteredRaces,
		lastFeaturedRaces: (reference?.featuredRaces ?? []) as RaceEnum[],
		lastChampionRaces,
		lastFinalistSkills,
		racePopulation
	};
}

/** The tournament created right before the given one, null if none. */
export async function getPreviousTournamentId(prisma: PismaClientLocal, tournamentId: string): Promise<string | null> {
	const current = await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { date: true } });
	if (!current) return null;
	const previous = await prisma.tournament.findFirst({
		where: { date: { lt: current.date } },
		orderBy: { date: 'desc' },
		select: { id: true }
	});
	return previous?.id ?? null;
}
