import { calculateFightBetweenPlayers } from '../business/fightService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { PismaClientLocal } from '../prisma.js';
import { shuffle } from './tools.js';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { FBDetails, FBMetaData, FBPool, FBPools, RawMatch } from '@drpg/core/models/dojo/ForceBrute';
import { LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';
import dayjs from 'dayjs';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { $Enums } from '@drpg/prisma';
import GameDinozUsage = $Enums.GameDinozUsage;
import { STANDARD_PVP_RULES } from '@drpg/core/models/fight/FightConfiguration';
class ForceBruteManager {
	private readonly QUALIFIED_TEAMS = 256;
	private readonly TEAMS_PER_POOL = 16;
	private readonly NUMBER_OF_POOLS = 16;

	constructor(private level: number) {}

	public async initializeTournament(prisma: PismaClientLocal) {
		const tournamentFormat = FBDetails[this.level];

		// Check if there is already a tournament in progress for this level
		const check = await prisma.fBTournament.findFirst({
			where: {
				levelLimit: this.level
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

		// Notify users
		const notifications = await prisma.$executeRaw`
			INSERT INTO "Notification" ("playerId", "message", "link", "severity")
			SELECT id, 'FBStarted', ${`/events/tournament?id=${newTournament.id}`}, 'event'
			FROM "player";
		`;

		LOGGER.log(
			`Creation of the FBTournament ${newTournament.id} for the level ${this.level}. ${notifications} notifications sent.`
		);
		scheduleJob(`create_FBTournament_${newTournament.id}`, endCreation, () => this.generateNextRound(prisma));
		return newTournament;
	}

	private async createPools(teams: number[]): Promise<number[][]> {
		const shuffledTeams = shuffle(teams);
		const pools: number[][] = Array(this.NUMBER_OF_POOLS)
			.fill([])
			.map(() => []);

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
				playerId: true,
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
			where: { FBTournamentId: tournament.id },
			orderBy: { tournamentStep: 'desc' }
		});

		const round = lastFight ? lastFight.tournamentStep + 1 : 0;
		let phase: TournamentPhase;
		if (round <= 3) {
			phase = TournamentPhase.POOLS;
		} else {
			phase = TournamentPhase.FINALS;
		}

		// Add 24h if not enough participants
		if (tournament.participants < this.QUALIFIED_TEAMS) {
			phase = TournamentPhase.QUALIFICATION;
			if (tournament.nextRound < new Date()) {
				LOGGER.log(
					`Post-poned pool phase of tournament ${tournament.id} because there is only ${tournament.participants} participants.`
				);
				const postPoned = dayjs(tournament.nextRound).add(1, 'day').toDate();
				await prisma.fBTournament.update({
					where: {
						id: tournament.id
					},
					data: {
						nextRound: postPoned
					}
				});
				scheduleJob(`postponed_FBTournament_${tournament.id}`, postPoned, () => this.generateNextRound(prisma));
			}
		}

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
	): Promise<{ id: string; winner: number }> {
		const team1Dinoz = await this.getDinozToFight(dinoz1, prisma);
		const team2Dinoz = await this.getDinozToFight(dinoz2, prisma);

		// Remove items from dinoz for the fight and set life to maxLife
		team1Dinoz.skills = team1Dinoz.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
		team1Dinoz.life = team1Dinoz.maxLife;
		team2Dinoz.skills = team2Dinoz.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
		team2Dinoz.life = team2Dinoz.maxLife;

		const fight = calculateFightBetweenPlayers(
			STANDARD_PVP_RULES,
			[team1Dinoz],
			false,
			[team2Dinoz],
			false,
			PlaceEnum.DOJO
		);

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
							dark: f.dark,
							size: f.size,
							entrance: f.entrance
						};
					})
				),
				steps: JSON.stringify(fight.steps),
				seed: fight.seed,
				result: fight.winner,
				tournamentStep: round,
				FBTournamentId: tournamentId,
				metadata: JSON.stringify(metadata),
				FBTournamentLeftId: dinoz1,
				FBTournamentRightId: dinoz2,
				leftPlayerId: team1Dinoz.playerId,
				rightPlayerId: team2Dinoz.playerId
			}
		});

		return { id: fightArchive.id, winner: fight.winner ? dinoz1 : dinoz2 };
	}

	private async getWinnersFromPreviousRound(
		round: number,
		prisma: PismaClientLocal,
		tournamentId: string
	): Promise<RawMatch[]> {
		const previousMatches = await prisma.fightArchive.findMany({
			where: {
				FBTournamentId: tournamentId,
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
	): Promise<{ id: string; nextRound: Date; startDate: Date; participants: number }> {
		const activeTournament = await prisma.fBTournament.findFirstOrThrow({
			where: {
				levelLimit: this.level
			},
			select: {
				id: true,
				nextRound: true,
				date: true,
				_count: {
					select: {
						participants: {
							where: {
								level: this.level
							}
						}
					}
				}
			}
		});

		return {
			id: activeTournament.id,
			nextRound: activeTournament.nextRound,
			startDate: activeTournament.date,
			participants: activeTournament._count.participants
		};
	}

	public async resume(prisma: PismaClientLocal) {
		// Vérifier si le tournoi est toujours en cours
		const currentState = await this.getCurrentState(prisma);

		if (currentState.phase !== TournamentPhase.QUALIFICATION) {
			if (currentState.round <= 7) {
				this.generateNextRound(prisma);
			}
		} else {
			// LOGGER.log(`Scheduled FB ${currentState.tournamentId} for ${currentState.nextRound}`);
			scheduleJob(`FBTournament_${currentState.tournamentId}`, currentState.nextRound, () =>
				this.generateNextRound(prisma)
			);
		}
	}

	private translatePools(originalData: RawMatch[]): FBPools[] {
		// Grouper les données par pool
		const poolsMap = new Map<number, RawMatch[]>();

		originalData.forEach(item => {
			if (!poolsMap.has(item.poolNumber)) {
				poolsMap.set(item.poolNumber, []);
			}
			poolsMap.get(item.poolNumber)?.push(item);
		});

		// Transformer les pools
		const transformedPools: FBPools[] = [];

		poolsMap.forEach((poolData, poolId) => {
			// Trier les données par numéro de match pour préserver l'ordre
			const sortedPoolData = [...poolData].sort((a, b) => a.matchNumber - b.matchNumber);

			// Créer les matches pour ce pool en regroupant les dinoz deux par deux
			const matches: FBPool[] = [];

			// Pour chaque paire de dinoz dans ce pool
			for (let i = 0; i < sortedPoolData.length; i += 2) {
				// S'assurer qu'il y a un deuxième dinoz disponible pour former une paire
				if (i + 1 < sortedPoolData.length) {
					matches.push({
						// Utiliser le plus petit des deux numéros de match comme identifiant de match
						match: Math.min(sortedPoolData[i].matchNumber, sortedPoolData[i + 1].matchNumber),
						left: sortedPoolData[i].dinoz,
						right: sortedPoolData[i + 1].dinoz
					});
				}
			}

			// Ajouter le pool transformé seulement s'il contient des matches
			if (matches.length > 0) {
				transformedPools.push({
					poolId: poolId,
					matches: matches
				});
			}
		});

		return transformedPools;
	}

	async generateNextRound(prisma: PismaClientLocal): Promise<void> {
		const currentState = await this.getCurrentState(prisma);
		const matches: number[] = [];

		// Logique spécifique selon la phase
		switch (currentState.phase) {
			case TournamentPhase.QUALIFICATION:
				return; // Pas de matchs à générer pendant la qualification

			case TournamentPhase.POOLS: {
				let dinozToMatch: RawMatch[] = [];

				if (currentState.round === 0) {
					// Premier round : on les dinoz
					const qualifiedTeams = await prisma.gameDinoz.findMany({
						where: {
							AND: [
								{ level: this.level },
								{ usage: GameDinozUsage.FBTournament },
								{ FBTournamentId: currentState.tournamentId }
							]
						},
						take: this.QUALIFIED_TEAMS,
						orderBy: {
							createdDate: 'asc'
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
				let teamsToMatch: RawMatch[] = [];
				const lastWinners = await this.getWinnersFromPreviousRound(
					currentState.round,
					prisma,
					currentState.tournamentId
				);
				if (currentState.round === 4 && lastWinners.length !== 16) {
					LOGGER.error(`There is no 16 winners from pools phase for tournament ${currentState.tournamentId}.`);
					throw new Error('There is no 16 winners from pools phase.');
				}
				if (currentState.round === 4) {
					// Start of the final
					teamsToMatch = shuffle(lastWinners);
					teamsToMatch = teamsToMatch.map((m, index) => {
						return { ...m, poolNumber: 17, matchNumber: Math.floor(index / 2) };
					});
				} else {
					// Rounds suivants : on ne prend que les gagnants du round précédent
					teamsToMatch = await this.getWinnersFromPreviousRound(currentState.round, prisma, currentState.tournamentId);
				}
				const tournamentRound = this.translatePools(teamsToMatch);

				for (const fbPool of tournamentRound) {
					for (const match of fbPool.matches) {
						const winner = await this.generateAndSaveFight(
							match.left,
							match.right,
							TournamentPhase.FINALS,
							currentState.round,
							prisma,
							fbPool.poolId,
							match.match,
							currentState.tournamentId
						);
						matches.push(winner.winner);
					}
				}
				break;
			}

			default:
				throw new Error('Phase de tournoi invalide');
		}

		LOGGER.log(`Generated round ${currentState.round} of ${currentState.tournamentId}.`);

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
			scheduleJob(`FBTournament_${currentState.tournamentId}`, nextPhase.toDate(), () =>
				this.generateNextRound(prisma)
			);
			return;
		}

		if (currentState.round === 7) {
			await prisma.fBTournament.update({
				where: {
					id: currentState.tournamentId
				},
				data: {
					winnerId: matches[0]
				}
			});
			return;
		}

		this.generateNextRound(prisma);
		return;
	}
}

export default ForceBruteManager;
