import { getDinozForDojoFight } from '../dao/dinozDao.js';
import { calculateFightBetweenPlayers } from '../business/fightService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { createFirstTournament, getLevelLimits, getSelectedDojo } from '../business/tournamentService.js';
import { PismaClientLocal } from '../prisma.js';
import { getRandomNumber, shuffle } from './tools.js';
import {
	MetaData,
	TournamentMatch,
	TournamentPhase,
	TournamentSchedule,
	TournamentState
} from '@drpg/core/models/dojo/tournament';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { Item } from '@drpg/core/models/item/ItemList';
import { addMoney } from '../dao/playerDao.js';
import { LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';
import dayjs from 'dayjs';
import { createNews } from '../dao/newsDao.js';
import { translateTarget } from './translate.js';
import 'dayjs/locale/de.js';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/es.js';
import 'dayjs/locale/en.js';
import { tournamentQualifRewards } from '@drpg/core/models/dojo/tournamentQualifRewards';
import { rewarder, RewarderPromise } from './rewarder.js';
import { createNotification } from '../dao/notificationDao.js';
import { NotificationSeverity, UnavailableReason } from '@drpg/prisma';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { formatName, formatTID } from '@drpg/core/models/dojo/teamFormat';

class TournamentManager {
	private readonly QUALIFIED_TEAMS = 64;
	private readonly TEAMS_PER_POOL = 16;
	private readonly NUMBER_OF_POOLS = 4;

	constructor(
		private tournamentId: string,
		private startDate: Date // Date du lundi de qualification
	) {}

	private getSchedule(): TournamentSchedule {
		const qualificationStart = dayjs(this.startDate).toDate();
		// Qualif end the sunday night
		const qualificationEnd = dayjs(this.startDate)
			.add(6, 'days')
			.set('hour', 23)
			.set('minute', 59)
			.set('second', 59)
			.toDate();

		const poolsStart = dayjs(this.startDate).add(7, 'days').set('hour', 0).set('minute', 0).set('second', 0).toDate();

		const finalsStart = dayjs(this.startDate).add(11, 'days').set('hour', 0).set('minute', 0).set('second', 0).toDate();

		return {
			qualificationStart,
			qualificationEnd,
			poolsStart,
			finalsStart
		};
	}

	private getMatchTimes(): { time: Date; description: string; round: number }[] {
		const schedule = this.getSchedule();
		const times: { time: Date; description: string; round: number }[] = [];

		// Mardi (Poules Round 1 & 2)
		const tuesday = dayjs(schedule.poolsStart).add(1, 'days');
		times.push(
			{
				time: tuesday.set('hour', 12).set('minute', 0).set('second', 0).toDate(),
				description: 'Pools - Huitièmes de finales',
				round: 0
			},
			{
				time: tuesday.set('hour', 21).set('minute', 0).set('second', 0).toDate(),
				description: 'Pools - Quarts de finales',
				round: 1
			}
		);

		// Mercredi (Demis et Finales)
		const wednesday = dayjs(schedule.poolsStart).add(2, 'days');
		times.push(
			{
				time: wednesday.set('hour', 12).set('minute', 0).set('second', 0).toDate(),
				description: 'Pools - Demis-finales',
				round: 2
			},
			{
				time: wednesday.set('hour', 21).set('minute', 0).set('second', 0).toDate(),
				description: 'Pools - Finales',
				round: 3
			}
		);

		// Vendredi (Début des finales)
		const friday = dayjs(schedule.finalsStart);
		times.push(
			{
				time: friday.set('hour', 12).set('minute', 0).set('second', 0).toDate(),
				description: 'Finales - Premiers matchs',
				round: 4
			},
			{
				time: friday.set('hour', 21).set('minute', 0).set('second', 0).toDate(),
				description: 'Finales - Winners/Losers',
				round: 5
			}
		);

		// Samedi (Finales)
		const saturday = dayjs(schedule.finalsStart).add(1, 'days');
		times.push(
			{
				time: saturday.set('hour', 12).set('minute', 0).set('second', 0).toDate(),
				description: 'Finales - Repêchage',
				round: 6
			},
			{
				time: saturday.set('hour', 21).set('minute', 0).set('second', 0).toDate(),
				description: 'Grande Finale',
				round: 7
			}
		);

		const nextMonday = dayjs(schedule.qualificationStart).add(2, 'week');
		times.push({
			time: nextMonday.set('hour', 0).set('minute', 0).set('second', 1).toDate(),
			description: 'New tournament',
			round: 8
		});

		return times;
	}

	private async getDinozIdsFromTeam(team: string, prisma: PismaClientLocal): Promise<number[]> {
		const tournamentTeam = await prisma.tournamentTeam.findUniqueOrThrow({
			where: { id: team },
			include: { dinoz: true }
		});

		return tournamentTeam.dinoz.map(d => d.id);
	}

	private async createPools(teams: string[]): Promise<string[][]> {
		const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
		const pools: string[][] = [[], [], [], []];

		for (let i = 0; i < shuffledTeams.length; i++) {
			const poolIndex = Math.floor(i / this.TEAMS_PER_POOL);
			pools[poolIndex].push(shuffledTeams[i]);
		}

		return pools;
	}

	private async generateAndSaveFight(
		team1Id: string,
		team2Id: string,
		phase: TournamentPhase,
		round: number,
		scheduledFor: Date,
		prisma: PismaClientLocal,
		poolNumber: number,
		matchNumber: number
	): Promise<{ fightId: string; winnerId: string }> {
		const team1Dinoz = await getDinozForDojoFight(await this.getDinozIdsFromTeam(team1Id, prisma));
		const team2Dinoz = await getDinozForDojoFight(await this.getDinozIdsFromTeam(team2Id, prisma));

		// Remove items from dinoz for the fight and set life to maxLife
		team1Dinoz.map(d => {
			d.items = [];
			d.life = d.maxLife;
		});
		team2Dinoz.map(d => {
			d.items = [];
			d.life = d.maxLife;
		});

		const fight = calculateFightBetweenPlayers(team1Dinoz, false, team2Dinoz, false, PlaceEnum.DOJO);

		const metadata: MetaData = {
			phase: phase,
			round: round,
			poolNumber: poolNumber,
			matchNumber: matchNumber,
			scheduledFor: scheduledFor.toISOString(),
			team1Id: team1Id,
			team2Id: team2Id
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
				tournamentId: this.tournamentId,
				metadata: JSON.stringify(metadata),
				tournamentTeamLeftId: team1Id,
				tournamentTeamRightId: team2Id
			}
		});

		// Détermine quelle équipe a gagné
		const winnerId = fight.winner ? team1Id : team2Id;

		return { fightId: fightArchive.id, winnerId };
	}

	private async getWinnersFromPreviousRound(round: number, prisma: PismaClientLocal): Promise<string[]> {
		const previousMatches = await prisma.fightArchive.findMany({
			where: {
				tournamentId: this.tournamentId,
				tournamentStep: round - 1
			},
			select: {
				tournamentTeamRightId: true,
				tournamentTeamLeftId: true,
				result: true,
				metadata: true
			}
		});

		const winners = [];

		for (const match of previousMatches) {
			if (match.tournamentTeamRightId && match.tournamentTeamLeftId && match.metadata) {
				winners.push({
					team: match.result ? match.tournamentTeamLeftId : match.tournamentTeamRightId,
					metada: JSON.parse(match.metadata) as MetaData
				});
				// winners.add(match.result ? match.tournamentTeamLeftId : match.tournamentTeamRightId);
			}
		}

		return winners
			.sort(
				(m1, m2) =>
					m1.metada.poolNumber * 100 + m1.metada.matchNumber - (m2.metada.poolNumber * 100 + m2.metada.matchNumber)
			)
			.map(m => m.team);
	}

	private async getLoosersFromPreviousRound(round: number, prisma: PismaClientLocal): Promise<string[]> {
		const previousMatches = await prisma.fightArchive.findMany({
			where: {
				tournamentId: this.tournamentId,
				tournamentStep: round - 1
			},
			select: {
				tournamentTeamRightId: true,
				tournamentTeamLeftId: true,
				result: true,
				metadata: true
			}
		});

		const winners = [];

		for (const match of previousMatches) {
			if (match.tournamentTeamRightId && match.tournamentTeamLeftId) {
				winners.push(match.result ? match.tournamentTeamRightId : match.tournamentTeamLeftId);
			}
		}

		return winners;
	}

	private async rewardTournament(prisma: PismaClientLocal) {
		const tournament = await prisma.tournament.findUniqueOrThrow({
			where: {
				id: this.tournamentId
			},
			select: {
				fights: {
					orderBy: {
						tournamentStep: 'desc'
					},
					select: {
						tournamentTeamLeft: {
							select: {
								dojoId: true
							}
						},
						tournamentTeamRight: {
							select: {
								dojoId: true
							}
						},
						metadata: true,
						result: true
					}
				},
				cashPrice: true
			}
		});
		const allTournamentParticipants = tournament.fights;
		const ranking = new Set<string>();
		// Get winners from all match from finals to pool
		// This should order by ranking
		allTournamentParticipants.forEach(match => {
			if (
				!match.tournamentTeamLeft ||
				!match.tournamentTeamLeft.dojoId ||
				!match.tournamentTeamRight ||
				!match.tournamentTeamRight.dojoId
			) {
				throw new Error('Player cannot be rewarded');
			}
			ranking.add(match.result ? match.tournamentTeamLeft.dojoId : match.tournamentTeamRight.dojoId);
		});
		// Fill with all looser from first round
		allTournamentParticipants.forEach(match => {
			const metadata = JSON.parse(match.metadata as string) as MetaData;
			if (metadata.round === 0) {
				if (
					!match.tournamentTeamLeft ||
					!match.tournamentTeamLeft.dojoId ||
					!match.tournamentTeamRight ||
					!match.tournamentTeamRight.dojoId
				) {
					throw new Error('Player cannot be rewarded');
				}
				ranking.add(match.result ? match.tournamentTeamRight.dojoId : match.tournamentTeamLeft.dojoId);
			}
		});

		const players: string[] = [];
		for (const dojo of ranking) {
			const player = await prisma.dojo.findUnique({
				where: {
					id: dojo
				},
				select: {
					playerId: true
				}
			});
			if (player) players.push(player.playerId);
		}

		let index = 1;

		const promises = [];
		for (const playerId of players) {
			if (index === 1) {
				//Zen medal
				promises.push(
					addRewardToPlayer({
						rewardId: Reward.TID1,
						player: { connect: { id: playerId } }
					})
				);
				// Dinoz egg (rare)
				promises.push(increaseItemQuantity(playerId, Item.TOUFUFU_BABY_RARE, 1));
				// Legendary box
				promises.push(increaseItemQuantity(playerId, Item.BOX_LEGENDARY, 1));
				// Cash price
				promises.push(addMoney(playerId, Math.floor(tournament.cashPrice * 0.12)));
				//Notification
				promises.push(
					createNotification(
						playerId,
						JSON.stringify([
							{
								rewardType: RewardEnum.EPIC,
								value: Reward.TID1
							},
							{
								rewardType: RewardEnum.GOLD,
								value: Math.floor(tournament.cashPrice * 0.12)
							},
							{
								rewardType: RewardEnum.ITEM,
								value: Item.TOUFUFU_BABY_RARE,
								quantity: 1
							},
							{
								rewardType: RewardEnum.ITEM,
								value: Item.BOX_LEGENDARY,
								quantity: 1
							}
						]),
						NotificationSeverity.reward
					)
				);
			} else if (index <= 4) {
				// Dinoz egg (rare)
				promises.push(increaseItemQuantity(playerId, Item.TOUFUFU_BABY, 1));
				// Epic box
				promises.push(increaseItemQuantity(playerId, Item.BOX_EPIC, 1));
				// Cash price
				promises.push(addMoney(playerId, Math.floor(tournament.cashPrice * 0.06)));
				//Notification
				promises.push(
					createNotification(
						playerId,
						JSON.stringify([
							{
								rewardType: RewardEnum.GOLD,
								value: Math.floor(tournament.cashPrice * 0.06)
							},
							{
								rewardType: RewardEnum.ITEM,
								value: Item.TOUFUFU_BABY,
								quantity: 1
							},
							{
								rewardType: RewardEnum.ITEM,
								value: Item.BOX_EPIC,
								quantity: 1
							}
						]),
						NotificationSeverity.reward
					)
				);
			} else if (index <= 8) {
				// Rare box
				promises.push(increaseItemQuantity(playerId, Item.BOX_RARE, 1));
				// Cash price
				promises.push(addMoney(playerId, Math.floor(tournament.cashPrice * 0.0375)));
				//Notification
				promises.push(
					createNotification(
						playerId,
						JSON.stringify([
							{
								rewardType: RewardEnum.GOLD,
								value: Math.floor(tournament.cashPrice * 0.0375)
							},
							{
								rewardType: RewardEnum.ITEM,
								value: Item.BOX_RARE,
								quantity: 1
							}
						]),
						NotificationSeverity.reward
					)
				);
			} else if (index <= 16) {
				// Rare box
				promises.push(increaseItemQuantity(playerId, Item.BOX_RARE, 1));
				// Cash price
				promises.push(addMoney(playerId, Math.floor(tournament.cashPrice * 0.01875)));
				//Notification
				promises.push(
					createNotification(
						playerId,
						JSON.stringify([
							{
								rewardType: RewardEnum.GOLD,
								value: Math.floor(tournament.cashPrice * 0.01875)
							},
							{
								rewardType: RewardEnum.ITEM,
								value: Item.BOX_RARE,
								quantity: 1
							}
						]),
						NotificationSeverity.reward
					)
				);
			} else if (index <= 32) {
				// Cash price
				promises.push(addMoney(playerId, Math.floor(tournament.cashPrice * 0.0075)));
				//Notification
				promises.push(
					createNotification(
						playerId,
						JSON.stringify([
							{
								rewardType: RewardEnum.GOLD,
								value: Math.floor(tournament.cashPrice * 0.0075)
							}
						]),
						NotificationSeverity.reward
					)
				);
			} else {
				// Cash price
				promises.push(addMoney(playerId, Math.floor(tournament.cashPrice * 0.0025)));
				//Notification
				promises.push(
					createNotification(
						playerId,
						JSON.stringify([
							{
								rewardType: RewardEnum.GOLD,
								value: Math.floor(tournament.cashPrice * 0.0025)
							}
						]),
						NotificationSeverity.reward
					)
				);
			}
			index++;
		}
		Promise.all(promises);

		const nextTournament = this.getMatchTimes().find(t => t.round === 8);
		if (!nextTournament) {
			LOGGER.error('Cannot find next time for a tournament');
			throw new Error('Cannot find next time for a tournament');
		}
		LOGGER.log(`Rewarded ${ranking.size} player. initializeTournament is planned for ${nextTournament.time}`);
		await prisma.tournament.update({
			where: {
				id: this.tournamentId
			},
			data: {
				nextRound: nextTournament.time
			}
		});
		scheduleJob('Next tournament', nextTournament.time, () => this.initializeTournament(prisma));
	}

	async initializeTournament(prisma: PismaClientLocal): Promise<TournamentManager> {
		// Reset all dojo
		await prisma.dojoOpponents.deleteMany();
		await prisma.dojoTeam.deleteMany();
		await prisma.dojoChallengeHistory.deleteMany();
		await prisma.dojo.updateMany({
			data: {
				reputation: 0,
				tournamentTeamId: null,
				dailyReset: 0
			}
		});
		await prisma.ranking.updateMany({
			data: {
				dojo: 0
			}
		});

		const tournamentFormat = formatTID[getRandomNumber(0, 12) as formatName];

		const teamSize = tournamentFormat.teamSize ?? getRandomNumber(3, 6);
		const teamRace = tournamentFormat.teamRace;
		const raceMinimum = tournamentFormat.raceMinimum ?? getRandomNumber(2, teamSize);
		const levelLimit = tournamentFormat.levelLimit ?? (await getLevelLimits(tournamentFormat.teamRace));

		const endQualif = dayjs().add(6, 'days').set('hour', 23).set('minute', 59).set('second', 59).toDate();
		const newTournament = await prisma.tournament.create({
			data: {
				formatName: tournamentFormat.name,
				teamSize: teamSize,
				raceMinimum: raceMinimum,
				poison: tournamentFormat.poison,
				teamRace: teamRace.toString(),
				levelLimit: levelLimit,
				nextRound: endQualif
			},
			select: {
				id: true
			}
		});
		this.tournamentId = newTournament.id;

		const frTrad = {
			type: translateTarget(`tournament.${tournamentFormat.name}`, 'fr'),
			endQualif: dayjs(endQualif).locale('fr').format('ddd DD MMMM mm:hh'),
			rule1: translateTarget('dojo.teamSize', 'fr', { nb: teamSize, races: raceMinimum }),
			rule2: translateTarget('dojo.raceLimit', 'fr', {
				races: teamRace.map(r => ' ' + translateTarget(`race.${r}`, 'fr'))
			}),
			rule3: translateTarget(tournamentFormat.poison ? 'dojo.poison' : 'dojo.nopoison', 'fr'),
			rule4: translateTarget('dojo.levelLimit', 'fr', { level: levelLimit })
		};
		const esTrad = {
			type: translateTarget(`tournament.${tournamentFormat.name}`, 'es'),
			endQualif: dayjs(endQualif).locale('es').format('ddd DD MMMM mm:hh'),
			rule1: translateTarget('dojo.teamSize', 'es', { nb: teamSize, races: raceMinimum }),
			rule2: translateTarget('dojo.raceLimit', 'es', {
				races: teamRace.map(r => ' ' + translateTarget(`race.${r}`, 'es'))
			}),
			rule3: translateTarget(tournamentFormat.poison ? 'dojo.poison' : 'dojo.nopoison', 'es'),
			rule4: translateTarget('dojo.levelLimit', 'es', { level: levelLimit })
		};
		const enTrad = {
			type: translateTarget(`tournament.${tournamentFormat.name}`, 'en'),
			endQualif: dayjs(endQualif).locale('en').format('ddd DD MMMM mm:hh'),
			rule1: translateTarget('dojo.teamSize', 'en', { nb: teamSize, races: raceMinimum }),
			rule2: translateTarget('dojo.raceLimit', 'en', {
				races: teamRace.map(r => ' ' + translateTarget(`race.${r}`, 'en'))
			}),
			rule3: translateTarget(tournamentFormat.poison ? 'dojo.poison' : 'dojo.nopoison', 'en'),
			rule4: translateTarget('dojo.levelLimit', 'en', { level: levelLimit })
		};
		const deTrad = {
			type: translateTarget(`tournament.${tournamentFormat.name}`, 'de'),
			endQualif: dayjs(endQualif).locale('de').format('ddd DD MMMM mm:hh'),
			rule1: translateTarget('dojo.teamSize', 'de', { nb: teamSize, races: raceMinimum }),
			rule2: translateTarget('dojo.raceLimit', 'de', {
				races: teamRace.map(r => ' ' + translateTarget(`race.${r}`, 'de'))
			}),
			rule3: translateTarget(tournamentFormat.poison ? 'dojo.poison' : 'dojo.nopoison', 'de'),
			rule4: translateTarget('dojo.levelLimit', 'de', { level: levelLimit })
		};

		await createNews({
			title: this.tournamentId,
			// image: req.file?.buffer,
			frenchTitle: translateTarget('dojo.newsTitle', 'fr'),
			englishTitle: translateTarget('dojo.newsTitle', 'en'),
			spanishTitle: translateTarget('dojo.newsTitle', 'es'),
			germanTitle: translateTarget('dojo.newsTitle', 'de'),
			frenchText: translateTarget('dojo.newsCorpus', 'fr', frTrad),
			englishText: translateTarget('dojo.newsCorpus', 'en', esTrad),
			spanishText: translateTarget('dojo.newsCorpus', 'es', enTrad),
			germanText: translateTarget('dojo.newsCorpus', 'de', deTrad)
		});

		return new TournamentManager(this.tournamentId, new Date());
	}

	static async getCurrentTournament(prisma: PismaClientLocal): Promise<TournamentState | null> {
		const currentDate = new Date();

		// Recherche le tournoi le plus récent qui n'est pas terminé
		const tournament = await prisma.tournament.findFirst({
			where: {
				// La date du tournoi ne doit pas être plus vieille que 13 jours
				// (12 jours de tournoi + 1 jour de marge)
				date: {
					lte: currentDate,
					gte: dayjs().subtract(14, 'day').toDate()
				}
			},
			orderBy: {
				date: 'desc'
			}
		});

		if (!tournament) {
			return null;
		}

		// Crée une instance de TournamentManager pour utiliser ses méthodes
		const manager = new TournamentManager(tournament.id, tournament.date);
		const schedule = manager.getSchedule();

		// Récupère l'état actuel
		const state = await manager.getCurrentState(prisma);

		return {
			id: tournament.id,
			...state,
			schedule,
			cashPrice: tournament.cashPrice,
			levelLimit: tournament.levelLimit
		};
	}

	static async getCurrentTournamentState(prisma: PismaClientLocal): Promise<TournamentState | null> {
		return TournamentManager.getCurrentTournament(prisma);
	}

	static async resume(prisma: PismaClientLocal): Promise<TournamentManager | null> {
		const activeTournament = await prisma.tournament.findFirst({
			orderBy: {
				date: 'desc'
			}
		});

		if (!activeTournament) {
			const today = dayjs();
			const daysUntilNextMonday = (1 + 7 - today.day()) % 7;
			const nextMonday = today.add(daysUntilNextMonday, 'day').startOf('day');
			LOGGER.error(`No tournament found, schedule a creation for ${nextMonday}.`);
			scheduleJob('createFirstTournament', nextMonday.toDate(), () => createFirstTournament(prisma));
			return null;
		}

		const manager = new TournamentManager(activeTournament.id, activeTournament.date);

		// Vérifier si le tournoi est toujours en cours
		const currentState = await manager.getCurrentState(prisma);
		const schedule = manager.getSchedule();
		if (currentState.nextScheduledMatch && currentState.round <= 7) {
			if (currentState.nextScheduledMatch <= new Date()) {
				await manager.generateNextRound(prisma);
				return manager;
			}
			LOGGER.log(
				`Reprise du tournoi ${activeTournament.id} à la phase ${currentState.phase}, round ${currentState.round} prévu pour ${currentState.nextScheduledMatch}`
			);
			scheduleJob(activeTournament.id, currentState.nextScheduledMatch, () => manager.generateNextRound(prisma));
			return manager;
		} else if (currentState.nextScheduledMatch && currentState.round === 8) {
			if (currentState.nextScheduledMatch <= new Date()) {
				await manager.initializeTournament(prisma);
				return manager;
			}
			LOGGER.log(`Création du prochain tournois prévu pour ${currentState.nextScheduledMatch}`);
			scheduleJob(activeTournament.id, currentState.nextScheduledMatch, () => manager.initializeTournament(prisma));
			return manager;
		} else {
			LOGGER.log(`Le tournoi ${activeTournament.id} est déjà terminé, création d'un nouveau.`);
			return await manager.initializeTournament(prisma);
		}
	}

	async getCurrentState(
		prisma: PismaClientLocal
	): Promise<{ phase: TournamentPhase; round: number; nextScheduledMatch?: Date }> {
		const tournament = await prisma.tournament.findUnique({
			where: { id: this.tournamentId }
		});

		if (!tournament) {
			throw new Error('Tournoi non trouvé');
		}
		const lastFight = await prisma.fightArchive.findFirst({
			where: { tournamentId: this.tournamentId },
			orderBy: { tournamentStep: 'desc' }
		});

		const currentDate = new Date();
		const schedule = this.getSchedule();

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
			nextScheduledMatch: tournament.nextRound
		};
	}

	async generateNextRound(prisma: PismaClientLocal): Promise<void> {
		const currentState = await this.getCurrentState(prisma);

		// Trouve le prochain créneau prévu
		const nextMatch = currentState.nextScheduledMatch;

		if (!nextMatch) {
			throw new Error('Pas de match prévu à cette heure');
		}
		const matches: TournamentMatch[] = [];

		// Logique spécifique selon la phase
		switch (currentState.phase) {
			case TournamentPhase.QUALIFICATION:
				return; // Pas de matchs à générer pendant la qualification

			case TournamentPhase.POOLS: {
				let teamsToMatch: string[] = [];

				if (currentState.round === 0) {
					await this.rewardQualification(prisma)
					const teamSize = await prisma.tournament.findUniqueOrThrow({
						where: {
							id: this.tournamentId
						},
						select: {
							teamSize: true
						}
					});
					// Premier round : on prend les équipes qualifiées
					const qualifiedTeams = await getSelectedDojo(teamSize.teamSize, this.QUALIFIED_TEAMS);
					teamsToMatch = qualifiedTeams.map(t => t.tournamentTeamId).filter(t => t !== null);
				} else {
					// Rounds suivants : on ne prend que les gagnants du round précédent
					teamsToMatch = await this.getWinnersFromPreviousRound(currentState.round, prisma);
				}

				if (currentState.round === 0) {
					const pools = await this.createPools(teamsToMatch);

					for (const [poolIndex, pool] of pools.entries()) {
						let matchIndex = 0;
						for (let i = 0; i < pool.length; i += 2) {
							if (pool[i] && pool[i + 1]) {
								const { fightId, winnerId } = await this.generateAndSaveFight(
									pool[i],
									pool[i + 1],
									TournamentPhase.POOLS,
									currentState.round,
									nextMatch,
									prisma,
									poolIndex,
									matchIndex
								);

								matches.push({
									id: fightId,
									round: currentState.round,
									phase: TournamentPhase.POOLS,
									poolNumber: poolIndex,
									scheduledFor: nextMatch,
									winner: winnerId
								});
								matchIndex++;
							}
						}
					}
				} else {
					// Pour les rounds suivants, on apparie simplement les gagnants deux par deux
					for (let i = 0; i < teamsToMatch.length; i += 2) {
						if (teamsToMatch[i] && teamsToMatch[i + 1]) {
							const { fightId, winnerId } = await this.generateAndSaveFight(
								teamsToMatch[i],
								teamsToMatch[i + 1],
								TournamentPhase.POOLS,
								currentState.round,
								nextMatch,
								prisma,
								Math.floor(i / (this.TEAMS_PER_POOL / Math.pow(2, currentState.round))),
								i
							);

							matches.push({
								id: fightId,
								round: currentState.round,
								phase: TournamentPhase.POOLS,
								scheduledFor: nextMatch,
								winner: winnerId
							});
						}
					}
				}
				break;
			}

			case TournamentPhase.FINALS: {
				let teamsToMatch: string[] = [];
				const lastWinners = await this.getWinnersFromPreviousRound(currentState.round, prisma);
				if (currentState.round === 4) {
					// Random pick of two fighters out of 4
					teamsToMatch = shuffle(lastWinners) as string[];
				} else if (currentState.round === 5) {
					// Winners fight and loosers fight
					const winnerBracket = await this.getWinnersFromPreviousRound(currentState.round, prisma);
					const looserBracket = await this.getLoosersFromPreviousRound(currentState.round, prisma);
					teamsToMatch.push(...winnerBracket, ...looserBracket);
				} else if (currentState.round === 6) {
					// Winner from looserBracket vs looser from winnerBracket
					const lastRound = await prisma.fightArchive.findMany({
						where: {
							tournamentId: this.tournamentId,
							tournamentStep: currentState.round - 1
						},
						select: {
							tournamentTeamRightId: true,
							tournamentTeamLeftId: true,
							result: true,
							metadata: true
						}
					});
					if (lastRound.length !== 2) {
						throw new Error("Round 5 doesn't have 2 matches");
					}
					const winnerBracket = lastRound.find(f => {
						const metadata = JSON.parse(<string>f.metadata) as MetaData;
						return metadata.matchNumber === 0;
					});
					const looserBracket = lastRound.find(f => {
						const metadata = JSON.parse(<string>f.metadata) as MetaData;
						return metadata.matchNumber === 2;
					});
					if (
						winnerBracket &&
						looserBracket &&
						winnerBracket.tournamentTeamLeftId &&
						winnerBracket.tournamentTeamRightId &&
						looserBracket.tournamentTeamRightId &&
						looserBracket.tournamentTeamLeftId
					) {
						teamsToMatch.push(
							winnerBracket.result ? winnerBracket.tournamentTeamRightId : winnerBracket.tournamentTeamLeftId
						);
						teamsToMatch.push(
							looserBracket.result ? looserBracket.tournamentTeamLeftId : looserBracket.tournamentTeamRightId
						);
					}
				} else if (currentState.round === 7) {
					// Grand final
					const looserBracketWinner = await this.getWinnersFromPreviousRound(currentState.round, prisma);
					teamsToMatch.push(...looserBracketWinner);
					const lastLastRound = await prisma.fightArchive.findMany({
						where: {
							tournamentId: this.tournamentId,
							tournamentStep: currentState.round - 2
						},
						select: {
							tournamentTeamRightId: true,
							tournamentTeamLeftId: true,
							result: true,
							metadata: true
						}
					});
					if (lastLastRound.length !== 2) {
						throw new Error("Round 5 doesn't have 2 matches");
					}
					const winnerBracket = lastLastRound[0];
					if (winnerBracket.tournamentTeamLeftId && winnerBracket.tournamentTeamRightId) {
						teamsToMatch.push(
							winnerBracket.result ? winnerBracket.tournamentTeamLeftId : winnerBracket.tournamentTeamRightId
						);
					}
				}

				for (let i = 0; i < teamsToMatch.length; i += 2) {
					if (teamsToMatch[i] && teamsToMatch[i + 1]) {
						const { fightId, winnerId } = await this.generateAndSaveFight(
							teamsToMatch[i],
							teamsToMatch[i + 1],
							TournamentPhase.FINALS,
							currentState.round,
							nextMatch,
							prisma,
							this.NUMBER_OF_POOLS + 1,
							i
						);

						matches.push({
							id: fightId,
							round: currentState.round,
							phase: TournamentPhase.FINALS,
							scheduledFor: nextMatch,
							winner: winnerId
						});
					}
				}
				break;
			}

			default:
				throw new Error('Phase de tournoi invalide');
		}

		const nextPlannedMatch = this.getMatchTimes().find(m => m.round === currentState.round + 1);
		if (!nextPlannedMatch) {
			LOGGER.error('nextPlannedMatch is not found');
			return;
		}
		if (currentState.round === 7) {
			// Tournament is over, reward
			await this.rewardTournament(prisma);
			return;
		}

		// Record next round time
		await prisma.tournament.update({
			where: {
				id: this.tournamentId
			},
			data: {
				nextRound: nextPlannedMatch.time
			}
		});

		LOGGER.log(
			`Generated ${matches.length} fights for round ${currentState.round}. Next round is for ${nextPlannedMatch.time}`
		);
		scheduleJob(this.tournamentId, nextPlannedMatch.time, () => this.generateNextRound(prisma));
	}

	async rewardQualification(prisma: PismaClientLocal): Promise<void> {
		const allRewarded = await prisma.ranking.findMany({
			where: {
				dojo: {
					gte: 500
				}
			},
			select: {
				playerId: true,
				dojo: true,
				player: {
					select: {
						dinoz: {
							take: 1,
							select: {
								id: true,
								level: true,
								status: {
									select: {
										statusId: true
									}
								}
							}
						}
					}
				}
			}
		});
		const promises: RewarderPromise[] = [];
		tournamentQualifRewards.forEach(floor => {
			allRewarded
				.filter(player => player.dojo >= floor.floor)
				.forEach(player => {
					if (!player.player || !player.player.dinoz || !player.playerId) return;
					promises.push(rewarder(floor.rewards, player.player.dinoz, player.playerId));
				});
		});
		LOGGER.log(`Rewarded ${allRewarded.length} players.`);
		await Promise.all(promises);
		const nextPlannedMatch = this.getMatchTimes().find(m => m.round === 0);
		if (!nextPlannedMatch) {
			LOGGER.error('nextPlannedMatch is not found');
			return;
		}
		// Record next round time
		await prisma.tournament.update({
			where: {
				id: this.tournamentId
			},
			data: {
				nextRound: nextPlannedMatch.time
			}
		});
		scheduleJob(this.tournamentId, nextPlannedMatch.time, () => this.generateNextRound(prisma));
		LOGGER.log(`First round is for ${nextPlannedMatch.time}.`);
	}
}

export default TournamentManager;
