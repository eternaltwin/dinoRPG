import { getDinozForDojoFight, selectDinozForDojoFight } from '../dao/dinozDao.js';
import { calculateFightBetweenPlayers } from '../business/fightService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { getNewLevelLimits } from '../business/tournamentService.js';
import { PismaClientLocal } from '../prisma.js';
import { getRandomNumber, shuffle } from './tools.js';
import {
	MetaData,
	RawTournamentMatch,
	TournamentPhase,
	TournamentPool,
	TournamentPools,
	TournamentSchedule,
	TournamentState
} from '@drpg/core/models/dojo/tournament';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { addMoney } from '../dao/playerDao.js';
import { DISCORD, LOGGER } from '../context.js';
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
import { $Enums, NotificationSeverity, Tournament } from '@drpg/prisma';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { formatName, formatTID } from '@drpg/core/models/dojo/teamFormat';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { romanize } from 'romans';
import NewsType = $Enums.NewsType;
import { FightRules, TimeoutOutcomePolicy } from '@drpg/core/models/fight/FightConfiguration';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { invalidateTournamentCache } from './tournament.cache.js';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';
import { UnavailableReason } from '@drpg/prisma';
import { nextMonday } from './date.js';

class TournamentManager {
	private readonly QUALIFIED_TEAMS = 64;
	private readonly NUMBER_OF_POOLS = 4;
	private readonly TEAMS_PER_POOL = this.QUALIFIED_TEAMS / this.NUMBER_OF_POOLS;
	private readonly MATCHES_PER_POOL = this.TEAMS_PER_POOL / 2;

	constructor(
		private tournamentId: string,
		private startDate: Date // Date du lundi de qualification
	) {}

	private getSchedule(): TournamentSchedule {
		const qualificationStart = dayjs(this.startDate).locale('fr').toDate();
		// Qualif end the sunday night
		const qualificationEnd = dayjs(this.startDate).locale('fr').endOf('week').endOf('day').toDate();

		const poolsStart = dayjs(this.startDate).locale('fr').add(1, 'week').startOf('week').toDate();

		const finalsStart = dayjs(this.startDate).locale('fr').add(11, 'days').startOf('day').toDate();

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
			time: nextMonday.startOf('day').toDate(),
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

	/**
	 * Returns the indices of the seeding algorithm where even indices are matched against odd indices.
	 *
	 * @param numberOfTeams - The number of teams of the tournament. It is assumed that it is a power of 2.
	 */
	private async seedTournament(numberOfTeams: number): Promise<number[]> {
		let seeds = [0, 1];
		while (seeds.length < numberOfTeams) {
			const newSeeds: number[] = [];
			seeds.forEach(s => {
				newSeeds.push(s, 2 * seeds.length - 1 - s);
			});
			seeds = newSeeds;
		}
		return seeds;
	}

	/**
	 * Creates the pools and the teams to be matched in each pool, using a seeding algorithm to arrange the matches,
	 * matching the first team with the last team, the second with the second to last, etc.
	 *
	 * If the number of teams is not equal to `QUALIFIED_TEAMS`, byes are given to the first teams. Byes will be
	 * distributed in a way that the "distance" between byes is maximized.
	 *
	 * @param teams - The qualified teams.
	 */
	private async createPools(teams: string[]): Promise<RawTournamentMatch[]> {
		if (teams.length < this.QUALIFIED_TEAMS) {
			teams.push(...Array(this.QUALIFIED_TEAMS - teams.length).fill(null));
		}
		const teamsToMatch = [];
		const indices = await this.seedTournament(this.QUALIFIED_TEAMS);
		for (let i = 0; 2 * i < teams.length; i++) {
			// Even indices are matched against odd indices
			const team1 = teams[indices[2 * i]];
			const team2 = teams[indices[2 * i + 1]];

			const poolNumber = Math.floor(i / this.MATCHES_PER_POOL);
			teamsToMatch.push({ team: team1, poolNumber: poolNumber, matchNumber: i % this.MATCHES_PER_POOL });
			teamsToMatch.push({ team: team2, poolNumber: poolNumber, matchNumber: i % this.MATCHES_PER_POOL });
		}
		return teamsToMatch;
	}

	private async generateAndSaveFight(
		tournamentRules: Pick<Tournament, 'poison'>,
		team1Id: string | null,
		team2Id: string | null,
		phase: TournamentPhase,
		round: number,
		scheduledFor: Date,
		prisma: PismaClientLocal,
		poolNumber: number,
		matchNumber: number
	): Promise<void> {
		let team1Dinoz: selectDinozForDojoFight;
		if (!team1Id) {
			team1Dinoz = [];
		} else {
			team1Dinoz = await getDinozForDojoFight(await this.getDinozIdsFromTeam(team1Id, prisma));
		}
		let team2Dinoz: selectDinozForDojoFight;
		if (!team2Id) {
			team2Dinoz = [];
		} else {
			team2Dinoz = await getDinozForDojoFight(await this.getDinozIdsFromTeam(team2Id, prisma));
		}

		team1Dinoz.map(d => {
			// Keep only magic items
			d.items = d.items.filter(i =>
				Object.values(itemList).find(item => item.itemId === i.itemId && item.itemType === ItemType.MAGICAL)
			);
			// Set life to max
			d.life = d.maxLife;
			// Remove Trou noir, Sylphides and Hypnose
			d.skills = d.skills.filter(
				s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
			);
		});
		team2Dinoz.map(d => {
			// Keep only magic items
			d.items = d.items.filter(i =>
				Object.values(itemList).find(item => item.itemId === i.itemId && item.itemType === ItemType.MAGICAL)
			);
			// Set life to max
			d.life = d.maxLife;
			// Remove Trou noir, Sylphides and Hypnose
			d.skills = d.skills.filter(
				s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
			);
		});

		const rules: FightRules = {
			canUseCapture: false,
			castleFight: false,
			enableStats: false,
			poisonEnabled: tournamentRules.poison,
			canUseEquipment: true,
			canUsePermanentEquipmentOnly: true,
			timeoutPolicy: TimeoutOutcomePolicy.PercentageHealth
		};

		// Replay the fight if a tie happened (up to 5 times)
		let retry_counter = 0;
		let fight = calculateFightBetweenPlayers(rules, team1Dinoz, false, team2Dinoz, false, PlaceEnum.DOJO);
		while (fight.outcome === FightOutcome.Tie && retry_counter < 5) {
			fight = calculateFightBetweenPlayers(rules, team1Dinoz, false, team2Dinoz, false, PlaceEnum.DOJO);
			retry_counter++;
		}

		// Determine winning side (true for left, false for right)
		let winner = false;

		if (fight.outcome === FightOutcome.AttackerWin) {
			winner = true;
		}

		if (retry_counter >= 5) {
			LOGGER.error('Maximum number of retries after ties reached in Tournament Manager', {
				fightData: fight
			});
		}

		const metadata: MetaData = {
			phase: phase,
			round: round,
			poolNumber: poolNumber,
			matchNumber: matchNumber,
			scheduledFor: scheduledFor.toISOString(),
			team1Id: team1Id,
			team2Id: team2Id
		};

		await prisma.fightArchive.create({
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
				result: fight.outcome === FightOutcome.AttackerWin,
				tournamentStep: round,
				tournamentId: this.tournamentId,
				metadata: JSON.stringify(metadata),
				tournamentTeamLeftId: team1Id,
				tournamentTeamRightId: team2Id,
				leftPlayerId: team1Dinoz.length > 0 ? team1Dinoz[0].playerId : null,
				rightPlayerId: team2Dinoz.length > 0 ? team2Dinoz[0].playerId : null
			}
		});
	}

	async getWinnersFromPreviousRound(round: number, prisma: PismaClientLocal): Promise<RawTournamentMatch[]> {
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
			if (match.metadata) {
				const meta = JSON.parse(match.metadata) as MetaData;
				winners.push({
					team: match.result ? match.tournamentTeamLeftId : match.tournamentTeamRightId,
					poolNumber: meta.poolNumber,
					matchNumber: meta.matchNumber
				});
			}
		}

		return winners;
	}

	private async getLosersFromPreviousRound(round: number, prisma: PismaClientLocal): Promise<RawTournamentMatch[]> {
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

		const losers = [];

		for (const match of previousMatches) {
			if (match.metadata) {
				const meta = JSON.parse(match.metadata) as MetaData;
				losers.push({
					team: match.result ? match.tournamentTeamRightId : match.tournamentTeamLeftId,
					poolNumber: meta.poolNumber,
					matchNumber: meta.matchNumber
				});
			}
		}

		return losers;
	}

	private async rewardTournament(prisma: PismaClientLocal) {
		invalidateTournamentCache();
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
				match.tournamentTeamLeft &&
				match.tournamentTeamLeft.dojoId &&
				match.tournamentTeamRight &&
				match.tournamentTeamRight.dojoId
			) {
				ranking.add(match.result ? match.tournamentTeamLeft.dojoId : match.tournamentTeamRight.dojoId);
			}
		});
		// Fill with all losers from first round
		allTournamentParticipants.forEach(match => {
			const metadata = JSON.parse(match.metadata as string) as MetaData;
			if (metadata.round === 0) {
				if (
					match.tournamentTeamLeft &&
					match.tournamentTeamLeft.dojoId &&
					match.tournamentTeamRight &&
					match.tournamentTeamRight.dojoId
				) {
					ranking.add(match.result ? match.tournamentTeamRight.dojoId : match.tournamentTeamLeft.dojoId);
				}
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

	static async createTournament(prisma: PismaClientLocal): Promise<TournamentManager> {
		const today = dayjs().locale('fr');
		const newTournamentStartDate = today.startOf('week').toDate();

		const tournamentFormat = formatTID[getRandomNumber(0, 13) as formatName];

		const teamSize = tournamentFormat.teamSize ?? getRandomNumber(2, 6);
		const teamRace = tournamentFormat.teamRace;
		const raceMinimum = tournamentFormat.raceMinimum ?? getRandomNumber(2, teamSize);
		const levelLimit = tournamentFormat.levelLimit ?? (await getNewLevelLimits(tournamentFormat.teamRace));
		const poison = tournamentFormat.poison ?? getRandomNumber(1, 2) === 1;

		const endQualif = today.endOf('week').endOf('day').toDate();
		const newTournament = await prisma.tournament.create({
			data: {
				date: newTournamentStartDate,
				formatName: tournamentFormat.name,
				teamSize: teamSize,
				raceMinimum: raceMinimum,
				poison: poison,
				teamRace: teamRace.toString(),
				levelLimit: levelLimit,
				nextRound: endQualif
			},
			select: {
				id: true
			}
		});
		const total = await prisma.tournament.count();

		const frTrad = {
			type: translateTarget(`tournament.${tournamentFormat.name}`, 'fr'),
			endQualif: dayjs(endQualif).locale('fr').format('ddd DD MMMM HH:mm'),
			rule1: translateTarget('dojo.teamSize', 'fr', {
				nb: teamSize,
				races: raceMinimum,
				context: raceMinimum === 1 ? 'singleRace' : undefined
			}),
			rule2: translateTarget('dojo.raceLimit', 'fr', {
				races: teamRace.map(r => ' ' + translateTarget(`race.${r}`, 'fr'))
			}),
			rule3: translateTarget(poison ? 'dojo.poison' : 'dojo.nopoison', 'fr'),
			rule4: translateTarget('dojo.levelLimit', 'fr', { level: levelLimit }),
			number: romanize(total)
		};
		const esTrad = {
			type: translateTarget(`tournament.${tournamentFormat.name}`, 'es'),
			endQualif: dayjs(endQualif).locale('es').format('ddd DD MMMM HH:mm'),
			rule1: translateTarget('dojo.teamSize', 'es', {
				nb: teamSize,
				races: raceMinimum,
				context: raceMinimum === 1 ? 'singleRace' : undefined
			}),
			rule2: translateTarget('dojo.raceLimit', 'es', {
				races: teamRace.map(r => ' ' + translateTarget(`race.${r}`, 'es'))
			}),
			rule3: translateTarget(poison ? 'dojo.poison' : 'dojo.nopoison', 'es'),
			rule4: translateTarget('dojo.levelLimit', 'es', { level: levelLimit }),
			number: romanize(total)
		};
		const enTrad = {
			type: translateTarget(`tournament.${tournamentFormat.name}`, 'en'),
			endQualif: dayjs(endQualif).locale('en').format('ddd DD MMMM HH:mm'),
			rule1: translateTarget('dojo.teamSize', 'en', {
				nb: teamSize,
				races: raceMinimum,
				context: raceMinimum === 1 ? 'singleRace' : undefined
			}),
			rule2: translateTarget('dojo.raceLimit', 'en', {
				races: teamRace.map(r => ' ' + translateTarget(`race.${r}`, 'en'))
			}),
			rule3: translateTarget(poison ? 'dojo.poison' : 'dojo.nopoison', 'en'),
			rule4: translateTarget('dojo.levelLimit', 'en', { level: levelLimit }),
			number: romanize(total)
		};
		const deTrad = {
			type: translateTarget(`tournament.${tournamentFormat.name}`, 'de'),
			endQualif: dayjs(endQualif).locale('de').format('ddd DD MMMM HH:mm'),
			rule1: translateTarget('dojo.teamSize', 'de', {
				nb: teamSize,
				races: raceMinimum,
				context: raceMinimum === 1 ? 'singleRace' : undefined
			}),
			rule2: translateTarget('dojo.raceLimit', 'de', {
				races: teamRace.map(r => ' ' + translateTarget(`race.${r}`, 'de'))
			}),
			rule3: translateTarget(poison ? 'dojo.poison' : 'dojo.nopoison', 'de'),
			rule4: translateTarget('dojo.levelLimit', 'de', { level: levelLimit }),
			number: romanize(total)
		};

		const news = await createNews({
			title: newTournament.id,
			// image: req.file?.buffer,
			type: NewsType.tid_start,
			frenchTitle: translateTarget('dojo.newsTitle', 'fr'),
			englishTitle: translateTarget('dojo.newsTitle', 'en'),
			spanishTitle: translateTarget('dojo.newsTitle', 'es'),
			germanTitle: translateTarget('dojo.newsTitle', 'de'),
			frenchText: translateTarget('dojo.newsCorpus', 'fr', frTrad),
			englishText: translateTarget('dojo.newsCorpus', 'en', enTrad),
			spanishText: translateTarget('dojo.newsCorpus', 'es', esTrad),
			germanText: translateTarget('dojo.newsCorpus', 'de', deTrad)
		});
		if (news.frenchTitle && news.frenchText) {
			DISCORD.sendNewsNotification(news.frenchTitle, news.frenchText, undefined);
		} else {
			LOGGER.error(`Tournament News is missing French title (${news.frenchTitle}) and/or text (${news.frenchText})`);
		}

		const tournamentManager = new TournamentManager(newTournament.id, newTournamentStartDate);
		scheduleJob(`tournament_${newTournament.id}`, endQualif, () => tournamentManager.generateNextRound(prisma));
		LOGGER.log(`initializeTournament is over. GenerateNextRound for 1st round is planned for ${endQualif}.`);

		return tournamentManager;
	}

	async initializeTournament(prisma: PismaClientLocal): Promise<TournamentManager> {
		LOGGER.log(`initializeTournament in progress, cleaning dojoOpponents, dojoTeam and dojoChallengeHistory.`);
		invalidateTournamentCache();
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

		const tournament = await TournamentManager.createTournament(prisma);
		this.tournamentId = tournament.tournamentId;
		this.startDate = tournament.startDate;

		return tournament;
	}

	static async createFirstTournament(prisma: PismaClientLocal) {
		// Check if there is at least:
		// - 5000 dinoz active
		//
		const dinozCount = await prisma.dinoz.count({
			where: {
				OR: [
					{ unavailableReason: null },
					{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
				]
			}
		});

		if (dinozCount > 5000) {
			TournamentManager.createTournament(prisma);
		} else {
			const tournamentDate = nextMonday();
			LOGGER.error(`Not enough dinoz (currently ${dinozCount}), next check ${tournamentDate}.`);
			scheduleJob('createFirstTournament', tournamentDate, () => TournamentManager.createFirstTournament(prisma));
		}
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
			levelLimit: tournament.levelLimit,
			nextScheduledMatch: tournament.nextRound
		};
	}

	static async getCurrentTournamentState(prisma: PismaClientLocal): Promise<TournamentState | null> {
		return TournamentManager.getCurrentTournament(prisma);
	}

	static async getActiveTeams(prisma: PismaClientLocal) {
		const currentTournament = await TournamentManager.getCurrentTournament(prisma);
		let winners: { tournamentTeamId: string }[] = [];
		if (!currentTournament) {
			return null;
		}
		if (currentTournament.round !== 0) {
			const previousMatches = await prisma.fightArchive.findMany({
				where: {
					tournamentId: currentTournament.id,
					tournamentStep: currentTournament.round - 1
				},
				select: {
					tournamentTeamRightId: true,
					tournamentTeamLeftId: true,
					result: true
				}
			});

			for (const match of previousMatches) {
				if (match.tournamentTeamLeftId) {
					if (!match.tournamentTeamRightId) {
						winners.push({
							tournamentTeamId: match.tournamentTeamLeftId
						});
					} else {
						winners.push({
							tournamentTeamId: match.result ? match.tournamentTeamLeftId : match.tournamentTeamRightId
						});
					}
				}
			}
			return { winners, id: currentTournament.id };
		} else {
			const teamSize = await prisma.tournament.findUniqueOrThrow({
				where: {
					id: currentTournament.id
				},
				select: {
					teamSize: true
				}
			});
			winners = await prisma.$queryRaw`
					SELECT d."tournamentTeamId"
FROM dojo d
         JOIN "TournamentTeam" tt ON d."tournamentTeamId" = tt.id
         JOIN player p ON d."playerId" = p.id
         JOIN ranking r ON p.id = r."playerId"
WHERE tt."teamCount" = ${teamSize.teamSize}
  AND d."tournamentTeamId" IS NOT NULL
ORDER BY r.dojo DESC
LIMIT ${64};`;

			return { winners, id: currentTournament.id };
		}
	}

	static async resume(prisma: PismaClientLocal): Promise<TournamentManager | null> {
		const activeTournament = await prisma.tournament.findFirst({
			orderBy: {
				date: 'desc'
			}
		});

		if (!activeTournament) {
			const tournamentDate = nextMonday();
			LOGGER.error(`No tournament found, schedule a creation for ${tournamentDate}.`);
			scheduleJob('createFirstTournament', tournamentDate, () => TournamentManager.createFirstTournament(prisma));
			return null;
		}

		const manager = new TournamentManager(activeTournament.id, activeTournament.date);

		// Vérifier si le tournoi est toujours en cours
		const currentState = await manager.getCurrentState(prisma);
		if (currentState.nextScheduledMatch && currentState.round <= 7) {
			if (currentState.nextScheduledMatch <= new Date()) {
				await manager.generateNextRound(prisma);
				return manager;
			}
			LOGGER.log(
				`Reprise du tournoi ${activeTournament.id} à la phase ${currentState.phase}, round ${currentState.round} prévu pour ${currentState.nextScheduledMatch}`
			);
			// manager.generateNextRound(prisma);
			scheduleJob(`tournament_${activeTournament.id}`, currentState.nextScheduledMatch, () =>
				manager.generateNextRound(prisma)
			);
			return manager;
		} else if (currentState.nextScheduledMatch && currentState.round === 8) {
			if (currentState.nextScheduledMatch <= new Date()) {
				await manager.initializeTournament(prisma);
				return manager;
			}
			LOGGER.log(`Création du prochain tournois prévu pour ${currentState.nextScheduledMatch}`);
			scheduleJob(`tournament_${activeTournament.id}`, currentState.nextScheduledMatch, () =>
				manager.initializeTournament(prisma)
			);
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
		if (currentDate < schedule.qualificationEnd) {
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

	private translatePools(originalData: RawTournamentMatch[]): TournamentPools[] {
		// Grouper les données par pool
		const poolsMap = new Map<number, RawTournamentMatch[]>();

		originalData.forEach(item => {
			if (!poolsMap.has(item.poolNumber)) {
				poolsMap.set(item.poolNumber, []);
			}
			poolsMap.get(item.poolNumber)?.push(item);
		});

		// Transformer les pools
		const transformedPools: TournamentPools[] = [];

		poolsMap.forEach((poolData, poolId) => {
			// Trier les données par numéro de match pour préserver l'ordre
			const sortedPoolData = [...poolData].sort((a, b) => a.matchNumber - b.matchNumber);

			// Créer les matches pour ce pool en regroupant les dinoz deux par deux
			const matches: TournamentPool[] = [];

			// Pour chaque paire de dinoz dans ce pool
			for (let i = 0; i < sortedPoolData.length; i += 2) {
				matches.push({
					// Utiliser le plus petit des deux numéros de match comme identifiant de match
					match: Math.min(sortedPoolData[i].matchNumber, sortedPoolData[i + 1].matchNumber),
					left: sortedPoolData[i].team,
					right: sortedPoolData[i + 1].team
				});
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
		LOGGER.log(`Generated next round for ${currentState.phase}`);

		const tournamentRules = await prisma.tournament.findUniqueOrThrow({
			where: {
				id: this.tournamentId
			},
			select: {
				poison: true,
				teamSize: true
			}
		});

		// Trouve le prochain créneau prévu
		const nextMatch = currentState.nextScheduledMatch;

		if (!nextMatch) {
			throw new Error('Pas de match prévu à cette heure');
		}
		let matches = 0;

		// Logique spécifique selon la phase
		switch (currentState.phase) {
			case TournamentPhase.QUALIFICATION:
				return; // Pas de matchs à générer pendant la qualification

			case TournamentPhase.POOLS: {
				LOGGER.log(`Round is ${currentState.round}`);
				let teamsToMatch: RawTournamentMatch[] = [];

				if (currentState.round === 0) {
					await this.rewardQualification(prisma);
					// Premier round : on prend les équipes qualifiées
					const qualifiedTeams: { tournamentTeamId: string }[] = await prisma.$queryRaw`
					SELECT d."tournamentTeamId"
FROM dojo d
         JOIN "TournamentTeam" tt ON d."tournamentTeamId" = tt.id
         JOIN player p ON d."playerId" = p.id
         JOIN ranking r ON p.id = r."playerId"
WHERE tt."teamCount" = ${tournamentRules.teamSize}
  AND d."tournamentTeamId" IS NOT NULL
ORDER BY r.dojo DESC
LIMIT ${this.QUALIFIED_TEAMS};`;
					teamsToMatch = await this.createPools(shuffle(qualifiedTeams).map(t => t.tournamentTeamId));
				} else {
					teamsToMatch = await this.getWinnersFromPreviousRound(currentState.round, prisma);
				}
				const tournamentRound = this.translatePools(teamsToMatch);
				for (const pool of tournamentRound) {
					for (const match of pool.matches) {
						await this.generateAndSaveFight(
							tournamentRules,
							match.left,
							match.right,
							TournamentPhase.POOLS,
							currentState.round,
							nextMatch,
							prisma,
							pool.poolId,
							match.match
						);
						matches++;
					}
				}
				break;
			}

			case TournamentPhase.FINALS: {
				let teamsToMatch: RawTournamentMatch[] = [];
				if (currentState.round === 4) {
					const lastWinners: RawTournamentMatch[] = await this.getWinnersFromPreviousRound(currentState.round, prisma);
					// Random pick of two fighters out of 4
					teamsToMatch = shuffle(lastWinners);
					teamsToMatch = teamsToMatch.map((m, index) => {
						return { ...m, poolNumber: 5, matchNumber: Math.floor(index / 2) };
					});
				} else if (currentState.round === 5) {
					// Winners fight and losers fight
					const winnerBracket = await this.getWinnersFromPreviousRound(currentState.round, prisma);
					const loserBracket = await this.getLosersFromPreviousRound(currentState.round, prisma);
					teamsToMatch.push(
						...winnerBracket.map(m => {
							return { ...m, matchNumber: 0 };
						}),
						...loserBracket.map(m => {
							return { ...m, matchNumber: 1 };
						})
					);
				} else if (currentState.round === 6) {
					// Winner from loserBracket vs loser from winnerBracket
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
					const winnerBracket = lastRound.find(f => {
						const metadata = JSON.parse(<string>f.metadata) as MetaData;
						return metadata.matchNumber === 0;
					});
					const loserBracket = lastRound.find(f => {
						const metadata = JSON.parse(<string>f.metadata) as MetaData;
						return metadata.matchNumber === 1;
					});
					if (winnerBracket && loserBracket) {
						teamsToMatch.push({
							team: winnerBracket.result ? winnerBracket.tournamentTeamRightId : winnerBracket.tournamentTeamLeftId,
							poolNumber: 5,
							matchNumber: 5
						});
						teamsToMatch.push({
							team: loserBracket.result ? loserBracket.tournamentTeamLeftId : loserBracket.tournamentTeamRightId,
							poolNumber: 5,
							matchNumber: 5
						});
					}
				} else if (currentState.round === 7) {
					// Grand final
					const loserBracketWinner = await this.getWinnersFromPreviousRound(currentState.round, prisma);
					teamsToMatch.push(...loserBracketWinner);
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
					teamsToMatch.push({
						team: winnerBracket.result ? winnerBracket.tournamentTeamLeftId : winnerBracket.tournamentTeamRightId,
						poolNumber: 5,
						matchNumber: 6
					});
				}
				const tournamentRound = this.translatePools(teamsToMatch);
				for (const fbPool of tournamentRound) {
					for (const match of fbPool.matches) {
						await this.generateAndSaveFight(
							tournamentRules,
							match.left,
							match.right,
							TournamentPhase.FINALS,
							currentState.round,
							nextMatch,
							prisma,
							fbPool.poolId,
							match.match
						);
						matches++;
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
			`Generated ${matches} fights for round ${currentState.round}. Next round is for ${nextPlannedMatch.time}`
		);

		if (nextPlannedMatch.time <= new Date() && matches > 0) {
			await this.generateNextRound(prisma);
		}
		invalidateTournamentCache();

		scheduleJob(`tournament_${this.tournamentId}`, nextPlannedMatch.time, () => this.generateNextRound(prisma));
	}

	async rewardQualification(prisma: PismaClientLocal): Promise<void> {
		LOGGER.log(`invalidateTournamentCache`);
		invalidateTournamentCache();
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
					promises.push(rewarder(floor.rewards, player.player.dinoz, player.playerId, true));
				});
		});
		LOGGER.log(`Rewarding ${allRewarded.length} players.`);
		await Promise.all(promises);
		LOGGER.log(`Rewarded ${allRewarded.length} players.`);
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
		// scheduleJob(this.tournamentId, nextPlannedMatch.time, () => this.generateNextRound(prisma));
		// LOGGER.log(`First round is for ${nextPlannedMatch.time}.`);
	}
}

export default TournamentManager;
