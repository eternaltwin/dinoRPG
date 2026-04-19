import { Request, Response, Router } from 'express';
import { validationResult } from 'express-validator';
import { hatchEgg } from '../business/inventoryService.js';
import { itemList, Item } from '@drpg/core/models/item/ItemList';
import { apiRoutes } from '../constants/index.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { checkRole } from '../utils/jwt.js';
import { calculateFightVsMonsters, generateMonsterList, rewardFight } from '../business/fightService.js';
import { getDinozFightDataRequest } from '../dao/dinozDao.js';
import sendError from '../utils/sendErrors.js';
import { LOGGER } from '../context.js';
import { AdminRole } from '@drpg/prisma';
import { createMyDojo } from '../dao/dojoDao.js';
import { generateRandomChallenge } from '../business/dojoService.js';
import gameConfig from '../config/game.config.js';
import { addPlayerInRanking } from '../dao/rankingDao.js';
import fetch from 'node-fetch';
import { prisma } from '../prisma.js';
import { shuffle } from '../utils/tools.js';
import { createTournamentTestDinoz } from '../business/forceBruteService.js';
import { createPlayer, getTestUsers } from '../dao/playerDao.js';
import { getAllDinozFromAccount, updateDinoz } from '../dao/dinozDao.js';
import { updateDojoPoints } from '../dao/rankingDao.js';
import { simplifyCreateTournamentTeam } from '../business/tournamentService.js';
import { getLatestTournament } from '../dao/tournamentDao.js';
const routes: Router = Router();

const commonPath: string = apiRoutes.testingRoute;

/*function compterOccurrences<T>(tableau: T[]): Map<T, number> {
	const occurrences = new Map<T, number>();
	for (const objet of tableau) {
		if (occurrences.has(objet)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			occurrences.set(objet, occurrences.get(objet) + 1);
		} else {
			occurrences.set(objet, 1);
		}
	}
	return occurrences;
}*/

routes.get(`${commonPath}/generateMonster/:id`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}
	const player = await getDinozFightDataRequest(+req.params.id, req.auth.playerId);
	if (!player) {
		throw new ExpectedError(`Player ${+req.params.id} doesn't exist.`);
	}
	const team = player.dinoz;

	try {
		const results = [];
		for (let i = 0; i < 600; i++) {
			const monstersGenerated = await generateMonsterList(team, player.dinoz[0].placeId);
			const fightResult = calculateFightVsMonsters(team, player, player.dinoz[0].placeId, monstersGenerated);
			const result = await rewardFight(team, monstersGenerated, fightResult, player.dinoz[0].placeId, player);

			const flattedMonsters = monstersGenerated.map(a => a.name);
			const counter: { [key: string]: number } = {};
			for (const element of flattedMonsters.flat()) {
				if (counter[element]) {
					counter[element] += 1;
				} else {
					counter[element] = 1;
				}
			}

			const item = {
				gold: result.goldEarned.toString(),
				xp: result.xpEarned.toString(),
				opponents: result.fighters,
				victory: result.result.toString()
			};
			results.push(item);
		}
		LOGGER.error('600 fight result', { fights: results });
		return res.status(200).send();
	} catch (err) {
		await sendError(res, err);
	}
});

interface UserResponse {
	id: string;
}

routes.post(`${commonPath}/test-users`, async (req: Request, res: Response) => {
	try {
		const url = 'http://localhost:50320/api/v1/users';

		for (let i = 1; i <= 256; i++) {
			const name = `test${i}`;
			const body = JSON.stringify({ username: name, display_name: name, password: '74657374313233343536' });
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', // Indicate the body content type
					Accept: 'application/json' // Tell the server you expect JSON in response
				},
				body: body
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error(`Request failed while creating ${name} with status ${response.status} ${errorData}`);
			} else {
				const data = (await response.json()) as UserResponse;

				const user_id = data.id;
				const user_name = name;
				const player = await createPlayer({
					id: user_id,
					name: user_name,
					money: gameConfig.general.initialMoney,
					quetzuBought: 0
				});
				await addPlayerInRanking(player.id);
				await createMyDojo(player.id, generateRandomChallenge());
			}
		}
		console.log(`Finished creating test users`);
		return res.status(200).send();
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/test-dinoz`, async (req: Request, res: Response) => {
	try {
		const players = await getTestUsers();

		const eggs = [
			Item.WINKS_EGG,
			Item.PIGMOU_EGG,
			Item.WINKS_EGG,
			Item.PLANAILLE_EGG,
			Item.MOUEFFE_EGG,
			Item.NUAGOZ_EGG,
			Item.SIRAIN_EGG,
			Item.SIRAIN_EGG_RARE
		].map(itemId => itemList[itemId]);
		for (const player of players) {
			const numDinoz = (await getAllDinozFromAccount(player.id)).length;
			const toCreate = 18 - numDinoz;
			for (let k = 0; k < toCreate; k++) {
				const egg = eggs[Math.floor(Math.random() * eggs.length)];
				if (egg === undefined) {
					throw new ExpectedError('Could not found egg');
				}
				await hatchEgg(egg, { id: player.id, lang: 'es' });
			}

			const dinoz = await getAllDinozFromAccount(player.id);
			let i = 1;
			for (const dino of dinoz) {
				await updateDinoz(dino.id, {
					name: `test ${i}`,
					canChangeName: false
				});
				i++;
			}
		}
		console.log(`Finished creating test dinoz`);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/dojo/register-test-players`, async (req: Request, res: Response) => {
	try {
		const tournament = await getLatestTournament();
		if (!tournament) return;
		const players = await getTestUsers();
		players.length = Math.min(players.length, req.body.numPlayers);
		for (const player of players) {
			await updateDojoPoints(player.id, 2);
			let dinoz = await getAllDinozFromAccount(player.id);
			console.log(`player ${player.name} has ${dinoz.length} dinos`);
			dinoz = shuffle(dinoz);
			dinoz.length = Math.min(dinoz.length, tournament.teamSize);
			await simplifyCreateTournamentTeam(
				player.id,
				dinoz.map(dino => dino.id)
			);
		}
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/fb/register-test-players`, async (req: Request, res: Response) => {
	try {
		const players = await getTestUsers();
		const tournament = await prisma.fBTournament.findFirstOrThrow({
			select: {
				id: true,
				participants: true,
				teamRace: true,
				levelLimit: true
			},
			orderBy: {
				participants: {
					_count: 'asc'
				}
			}
		});
		console.log(
			`Tournament ${tournament.id} with level ${tournament.levelLimit} has ${tournament.participants.length} participants`
		);
		let count = Math.min(256 - tournament.participants.length, req.body.numPlayers);
		for (const player of players) {
			if (count <= 0) break;
			await createTournamentTestDinoz(player.id, player.name, tournament.id);
			count--;
		}
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
