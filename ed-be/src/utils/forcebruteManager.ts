import { calculateFightBetweenPlayers } from '../business/fightService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { PismaClientLocal, prisma } from '../prisma.js';
import { shuffle } from './tools.js';
import { TournamentPhase, TournamentSchedule } from '@drpg/core/models/dojo/tournament';
import { FBDetails, FBMetaData, FBPool, FBPools, rawMatches } from '@drpg/core/models/dojo/ForceBrute';
import { LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';
import dayjs from 'dayjs';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { $Enums } from '@drpg/prisma';
import GameDinozUsage = $Enums.GameDinozUsage;

class ForceBruteManager {
	private readonly QUALIFIED_TEAMS = 256;
	private readonly TEAMS_PER_POOL = 16;
	private readonly NUMBER_OF_POOLS = 16;

	constructor(private level: number) {}

	public async initializeTournament(prisma: PismaClientLocal) {
		const tournamentFormat = FBDetails[this.level];

		// Check if there is already a tournament in progress or if this one doesn't exist already
		const check = await prisma.fBTournament.findFirst({
			where: {
				OR: [
					{levelLimit: this.level},
					{winnerId: null}
				]

			}
		});
		if (check) {
			return;
		}

		const endCreation = dayjs().add(2, 'days').set('hour', 23).set('minute', 59).set('second', 59).toDate();
		const newTournament = await prisma.fBTournament.create({
			data: {
				teamRace: tournamentFormat.toString(),
				levelLimit: this.level,
				nextRound: endCreation
			},
			select: {
				id: true
			}
		});

		LOGGER.log(`Creation of the FBTournament ${newTournament.id} for the level ${this.level}.`)
		return newTournament;
	}

	private async getSchedule(prisma: PismaClientLocal): Promise<TournamentSchedule> {
		const tournament = await this.getActiveTournament(prisma);
		const qualificationStart = dayjs(tournament.startDate).toDate();
		// 3 days to create the dinoz pool
		const qualificationEnd = dayjs(tournament.startDate)
			.add(2, 'days')
			.set('hour', 23)
			.set('minute', 59)
			.set('second', 59)
			.toDate();

		const poolsStart = dayjs(tournament.startDate)
			.add(3, 'days')
			.set('hour', 0)
			.set('minute', 0)
			.set('second', 0)
			.toDate();

		const finalsStart = dayjs(tournament.startDate)
			.add(3, 'days')
			.set('hour', 12)
			.set('minute', 0)
			.set('second', 0)
			.toDate();

		return {
			qualificationStart,
			qualificationEnd,
			poolsStart,
			finalsStart
		};
	}

	private async createPools(teams: number[]): Promise<number[][]> {
		const shuffledTeams = shuffle(teams);
		const pools: number[][] = [[], [], [], []];

		for (let i = 0; i < shuffledTeams.length; i++) {
			const poolIndex = Math.floor(i / this.TEAMS_PER_POOL);
			pools[poolIndex].push(shuffledTeams[i]);
		}

		return pools;
	}

	private async getDinozToFight(dinozId: number, prisma: PismaClientLocal) {
		const dinoz = await prisma.gameDinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				display: true,
				name: true,
				level: true,
				life: true,
				maxLife: true,
				nbrUpFire: true,
				nbrUpWood: true,
				nbrUpWater: true,
				nbrUpLightning: true,
				nbrUpAir: true,
				skills: {
					select: { skillId: true }
				}
			}
		});
		if (!dinoz) {
			throw new Error("Dinoz doesn't exist");
		}
		return { ...dinoz, status: [], items: [], catches: [] };
	}

	public async getCurrentState(
		prisma: PismaClientLocal
	): Promise<{ phase: TournamentPhase; round: number; tournamentId: string; nextRound: Date }> {
		const tournament = await this.getActiveTournament(prisma);

		const lastFight = await prisma.fightArchive.findFirst({
			where: { tournamentId: tournament.id },
			orderBy: { tournamentStep: 'desc' }
		});

		const currentDate = new Date();
		const schedule = await this.getSchedule(prisma);

		let phase: TournamentPhase;
		if (currentDate <= schedule.qualificationEnd) {
			phase = TournamentPhase.QUALIFICATION;
		} else if (currentDate <= schedule.finalsStart) {
			phase = TournamentPhase.POOLS;
		} else {
			phase = TournamentPhase.FINALS;
		}

		const round = lastFight ? lastFight.tournamentStep + 1 : 0;

		return {
			phase: phase,
			round,
			tournamentId: tournament.id,
			nextRound: tournament.nextRound
		};
	}

	private async generateAndSaveFight(
		dinoz1: number,
		dinoz2: number,
		phase: TournamentPhase,
		round: number,
		prisma: PismaClientLocal,
		poolNumber: number,
		matchNumber: number,
		tournamentId: string
	): Promise<string> {
		const team1Dinoz = await this.getDinozToFight(dinoz1, prisma);
		const team2Dinoz = await this.getDinozToFight(dinoz2, prisma);

		// Remove items from dinoz for the fight and set life to maxLife
		team1Dinoz.skills = team1Dinoz.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
		team2Dinoz.skills = team1Dinoz.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);

		const fight = calculateFightBetweenPlayers([team1Dinoz], false, [team2Dinoz], false, PlaceEnum.DOJO);

		const metadata: FBMetaData = {
			phase: phase,
			round: round,
			poolNumber: poolNumber,
			matchNumber: matchNumber,
			dinoz1: dinoz1,
			dinoz2: dinoz2,
			winner: fight.winner ? 'left' : 'right'
		};

		const fightArchive = await prisma.fightArchive.create({
			data: {
				fighters: JSON.stringify(
					fight.fighters.map(f => {
						return {
							id: f.id,
							type: f.type,
							name: f.name,
							display: f.display,
							attacker: f.attacker,
							maxHp: f.maxHp,
							startingHp: f.startingHp,
							energy: f.energy,
							maxEnergy: f.maxEnergy,
							energyRecovery: f.energyRecovery,
							dark: undefined,
							size: undefined
						};
					})
				),
				steps: JSON.stringify(fight.steps),
				seed: fight.seed,
				result: fight.winner,
				tournamentStep: round,
				tournamentId: tournamentId,
				metadata: JSON.stringify(metadata)
			}
		});

		return fightArchive.id;
	}

	private async getWinnersFromPreviousRound(
		round: number,
		prisma: PismaClientLocal,
		tournamentId: string
	): Promise<rawMatches[]> {
		const previousMatches = await prisma.fightArchive.findMany({
			where: {
				tournamentId: tournamentId,
				tournamentStep: round - 1
			},
			select: {
				metadata: true
			}
		});

		const winners = [];

		for (const match of previousMatches) {
			if (match.metadata) {
				const data = JSON.parse(match.metadata) as FBMetaData;
				winners.push({
					dinoz: data.winner === 'left' ? data.dinoz1 : data.dinoz2,
					poolNumber: data.poolNumber,
					matchNumber: data.matchNumber
				});
			}
		}

		return winners.sort((m1, m2) => m1.poolNumber * 100 + m1.matchNumber - (m2.poolNumber * 100 + m2.matchNumber));
	}

	public async getActiveTournament(
		prisma: PismaClientLocal
	): Promise<{ id: string; nextRound: Date; startDate: Date }> {
		const activeTournament = await prisma.fBTournament.findFirstOrThrow({
			orderBy: {
				date: 'desc'
			}
		});

		return { id: activeTournament.id, nextRound: activeTournament.nextRound, startDate: activeTournament.date };
	}

	public async resume(prisma: PismaClientLocal) {
		// Vérifier si le tournoi est toujours en cours
		const currentState = await this.getCurrentState(prisma);

		if (currentState.phase !== TournamentPhase.QUALIFICATION) {
			const lastFight = await prisma.fightArchive.findFirstOrThrow({
				where: {
					FBTournamentId: currentState.tournamentId
				},
				orderBy: {
					tournamentStep: 'desc'
				}
			});
			if (lastFight.tournamentStep < 7) {
				this.generateNextRound(prisma);
			}
		} else {
			LOGGER.log(`Scheduled FB ${currentState.tournamentId} for ${currentState.nextRound}`);
			scheduleJob(currentState.tournamentId, currentState.nextRound, () => this.generateNextRound(prisma));
		}
	}

	private translatePools(originalData: rawMatches[]): FBPools[] {
		// Grouper les données par pool
		const poolsMap = new Map<number, rawMatches[]>();

		originalData.forEach(item => {
			if (!poolsMap.has(item.poolNumber)) {
				poolsMap.set(item.poolNumber, []);
			}
			poolsMap.get(item.poolNumber)?.push(item);
		});

		// Transformer les pools
		const transformedPools: FBPools[] = [];

		poolsMap.forEach((poolData, poolId) => {
			// Groupe les données par match
			const matchesMap = new Map<number, rawMatches[]>();
			poolData.forEach(item => {
				if (!matchesMap.has(item.matchNumber)) {
					matchesMap.set(item.matchNumber, []);
				}
				matchesMap.get(item.matchNumber)?.push(item);
			});

			// Créer les matches pour ce pool
			const matches: FBPool[] = [];
			matchesMap.forEach((matchData, matchNumber) => {
				// S'assurer qu'il y a exactement 2 dinoz par match
				if (matchData.length === 2) {
					matches.push({
						match: matchNumber,
						left: matchData[0].dinoz,
						right: matchData[1].dinoz
					});
				}
			});

			// Ajouter le pool transformé
			transformedPools.push({
				poolId: poolId,
				matches: matches
			});
		});

		return transformedPools;
	}

	async generateNextRound(prisma: PismaClientLocal): Promise<void> {
		const currentState = await this.getCurrentState(prisma);

		// Logique spécifique selon la phase
		switch (currentState.phase) {
			case TournamentPhase.QUALIFICATION:
				return; // Pas de matchs à générer pendant la qualification

			case TournamentPhase.POOLS: {
				let dinozToMatch: rawMatches[] = [];

				if (currentState.round === 0) {
					// Premier round : on les dinoz
					const qualifiedTeams = await prisma.gameDinoz.findMany({
						where: {
							AND: [{ level: this.level }, { usage: GameDinozUsage.FBTournament }]
						},
						select: {
							id: true
						}
					});
					const pools = await this.createPools(qualifiedTeams.map(d => d.id));
					pools.forEach((pool, poolIndex) => {
						pool.forEach((d, dinozIndex) => {
							dinozToMatch.push({ dinoz: d, poolNumber: poolIndex, matchNumber: Math.floor(dinozIndex / 2) });
						});
					});
				} else {
					// Rounds suivants : on ne prend que les gagnants du round précédent
					dinozToMatch = await this.getWinnersFromPreviousRound(currentState.round, prisma, currentState.tournamentId);
				}

				const tournamentRound = this.translatePools(dinozToMatch);
				for (const fbPool of tournamentRound) {
					for (const match of fbPool.matches) {
						await this.generateAndSaveFight(
							match.left,
							match.right,
							TournamentPhase.POOLS,
							currentState.round,
							prisma,
							fbPool.poolId,
							match.match,
							currentState.tournamentId
						);
					}
				}
				break;
			}

			case TournamentPhase.FINALS: {
				let teamsToMatch: rawMatches[] = [];
				const lastWinners = await this.getWinnersFromPreviousRound(
					currentState.round,
					prisma,
					currentState.tournamentId
				);
				if (currentState.round === 4 && lastWinners.length !== 16) {
					LOGGER.error('There is no 16 winners from pools phase.');
					throw new Error('There is no 16 winners from pools phase.');
				}
				if (currentState.round === 4) {
					// Start of the final
					teamsToMatch = shuffle(lastWinners);
				} else {
					// Rounds suivants : on ne prend que les gagnants du round précédent
					teamsToMatch = await this.getWinnersFromPreviousRound(currentState.round, prisma, currentState.tournamentId);
				}
				const tournamentRound = this.translatePools(teamsToMatch);
				for (const fbPool of tournamentRound) {
					for (const match of fbPool.matches) {
						await this.generateAndSaveFight(
							match.left,
							match.right,
							TournamentPhase.POOLS,
							currentState.round,
							prisma,
							fbPool.poolId,
							match.match,
							currentState.tournamentId
						);
					}
				}
				break;
			}

			default:
				throw new Error('Phase de tournoi invalide');
		}

		LOGGER.log(`Generated round ${currentState.round}.`);

		if (currentState.round === 3) {
			// End of pool phase
			const nextPhase = dayjs().add(12, 'hours');
			await prisma.fBTournament.update({
				where: {
					id: currentState.tournamentId
				},
				data: {
					nextRound: nextPhase.toDate()
				}
			});
			scheduleJob(currentState.tournamentId, nextPhase.toDate(), () => this.generateNextRound(prisma));
			return;
		}

		if (currentState.round === 7) {
			return;
		}

		this.generateNextRound(prisma);
		return;
	}
}

export default ForceBruteManager;
