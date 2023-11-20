import { Request } from 'express';
import { ImportResponse } from '@drpg/core/models/import/ImportResponse';
import {
	Dinoz,
	ImportedDinoz,
	ImportedDinozSkill,
	ImportedDinozStatus,
	ImportedPlayer,
	ImportedPlayerIngredients,
	ImportedPlayerItem,
	ImportedPlayerReward,
	ImportedPlayerScenario,
	ImportedTwinoidAchievements,
	ImportedTwinoidSite,
	ImportedTwinoidStats,
	Player,
	PlayerIngredient,
	PlayerItem,
	PlayerReward,
	Secret
} from '../entity/index.js';
import { getAllSecretsRequest } from '../dao/secretDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getImportedData, getImportedTwinoidData, resetUser, setPlayer } from '../dao/playerDao.js';
import { DinoRPGProfile, twinoResponseAPI, TwinoUser } from '@drpg/core/models/import/TwinoAPI';
import {
	deleteImportedPlayer,
	getImportedPlayerSite,
	getImportedPlayerSpecificSiteAchievements,
	getImportedPlayerSpecificSiteStat,
	saveAchievements,
	saveImport,
	saveSite,
	saveStats,
	searchImportedPlayer
} from '../dao/importDao.js';
import { sendDiscord } from '../utils/discord.js';
import { statusResolution } from '../constants/import/statusResolution.js';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { itemResolution } from '../constants/import/itemResolution.js';
import { skillNameResolution } from '../constants/import/skillResolution.js';
import { accentsTidy, parseShop } from '../utils/import.js';
import { ingredientResolution } from '../constants/import/ingredientResolution.js';
import { updateMultipleDinozPlaceId } from '../dao/dinozDao.js';
import { setMultipleIngredient } from '../dao/playerIngredientDao.js';
import { setMultipleItem } from '../dao/playerItemDao.js';
import { addMultipleRewardToPlayer } from '../dao/playerRewardsDao.js';
import { parse } from 'node-html-parser';
import { sleep } from '../utils/index.js';
import { TwinoStat } from '@drpg/core/models/import/twinoStat';
import { SiteStat } from '@drpg/core/models/import/siteStat';
import { SiteAchiev } from '@drpg/core/models/import/siteAchiev';

// Import are not available
/*export async function importAPI(req: Request): Promise<ImportResponse | void> {
	const secrets: Array<Secret> = await getAllSecretsRequest();
	const twinoidAPISecret = secrets.find(s => s.key === 'twinoAPI');
	if (!twinoidAPISecret) {
		throw new ErrorFormator(500, `Import are not ready yet.`);
	}
	const redirect_uri = secrets.find(s => s.key === 'redirect_uri');
	if (!redirect_uri) {
		throw new ErrorFormator(500, `Id don't know where we are`);
	}

	const client_id = secrets.find(s => s.key === 'client_id');
	if (!client_id) {
		throw new ErrorFormator(500, `Id don't the API ID.`);
	}

	const code: string = req.body.code;
	const cookie = req.body.cookie;
	const url = 'https://twinoid.com/oauth/token';
	const params = new URLSearchParams();
	const playerId: number = req.auth!.playerId!;
	let server: string;
	let serverResponse: 'fr' | 'en' | 'es' = req.body.server;
	if (!['fr', 'en', 'es'].some(s => s === serverResponse)) {
		throw new ErrorFormator(500, `The server ${serverResponse} doesn't exist !`);
	}
	switch (req.body.server) {
		case 'fr':
			server = 'www.dinorpg.com';
			break;
		case 'en':
			server = 'en.dinorpg.com';
			break;
		case 'es':
			server = 'es.dinorpg.com';
			break;
		default:
			server = 'www.dinorpg.com';
			break;
	}
	const playerData: Player | null = await getImportedData(playerId);

	if (!playerData) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	params.append('client_id', client_id.value);
	params.append('client_secret', twinoidAPISecret.value);
	params.append('redirect_uri', redirect_uri.value);
	params.append('code', code);
	params.append('grant_type', 'authorization_code');
	const ResponseAPI: twinoResponseAPI = await (await fetch(url, { method: 'POST', body: params })).json();

	const paramsAPI = new URLSearchParams();
	paramsAPI.append('access_token', ResponseAPI.access_token);
	paramsAPI.append(
		'fields',
		'dinos.fields(display,life,maxLife,pos,canAct,canGather,xp,elements,equip.fields(desc,name,icon,locked,max,family),status,effects.fields(name,desc,icon,hidden)),objects.fields(count,desc,name,icon,locked,max,family),collections.fields(id,uid,name,desc),money,scenarios,twinId'
	);

	const dinorpg: DinoRPGProfile = await (
		await fetch(`http://${server}/tid/graph/me`, { method: 'POST', body: paramsAPI })
	).json();

	if (!dinorpg.twinId) {
		throw new ErrorFormator(400, 'nocookie');
	}

	const dinozToName = dinorpg.dinos.find(dino => !dino.name);
	if (dinozToName) {
		throw new ErrorFormator(
			500,
			`Please go to http://${server}/dino/${dinozToName.id}/ and give a name to your dinoz.`
		);
	}

	const test = await searchImportedPlayer(dinorpg.twinId);

	if (test) {
		await deleteImportedPlayer(test.id);
		await sendDiscord(`Oh ${dinorpg.name} !\nYou deleted your import.`);
		return {
			status: 'deleted',
			server: serverResponse,
			dinozCount: dinorpg.dinos.length,
			demonCount: 0,
			twinoAccountName: dinorpg.name,
			twinoAccountID: dinorpg.twinId
		};
	}

	const cookieTest = await (
		await fetch(`http://${server}/`, {
			method: 'GET',
			headers: {
				cookie: `sid=${cookie}`
			}
		})
	).text();
	const logged = cookieTest.match(/<div id="combat" class="swf slide">/);
	if (logged) {
		throw new ErrorFormator(400, `nocookie`);
	}

	let importedPlayer = new ImportedPlayer(new Player(playerData.id), dinorpg);

	importedPlayer = await saveImport(importedPlayer);
	importedPlayer.dinoz = [];
	importedPlayer.rewards = [];
	importedPlayer.items = [];
	importedPlayer.scenario = [];

	for (const dino of dinorpg.dinos) {
		let newDino = new ImportedDinoz(dino, false);
		newDino.player = importedPlayer;
		newDino.status = [];
		for (const status of dino.effects) {
			const statusId = Object.entries(statusResolution).find(
				statusa => statusa[0].toLowerCase() === status.eid.toLowerCase()
			);
			if (!statusId) {
				await sendDiscord(`Error in status \`${status.eid}\` from the version ${serverResponse}`);
				continue;
			}
			let newStatus = new ImportedDinozStatus();
			newStatus.dinoz = newDino;
			newStatus.statusId = statusId[1];
			newDino.status.push(newStatus);
		}
		importedPlayer.dinoz.push(newDino);
	}

	for (const reward of dinorpg.collections) {
		const rewardId = Object.entries(rewardList).find(rewarda => rewarda[0].toLowerCase() === reward.oid.toLowerCase());
		if (!rewardId) {
			await sendDiscord(`Error in collection \`${reward.oid}\` from the version ${serverResponse}`);
			continue;
		}
		let newReward = new ImportedPlayerReward(rewardId[1]);
		newReward.player = importedPlayer;
		importedPlayer.rewards.push(newReward);
	}

	for (const object of dinorpg.objects) {
		const itemId = Object.entries(itemResolution).find(name => name[0].toLowerCase() === object.oid.toLowerCase());
		if (!itemId) {
			await sendDiscord(`Error in item \`${object.oid}\` from the version ${serverResponse}`);
			continue;
		}
		let newObject = new ImportedPlayerItem(itemId[1], object.count);
		newObject.player = importedPlayer;
		importedPlayer.items.push(newObject);
	}

	for (const scenario of dinorpg.scenarios) {
		let newScenario = new ImportedPlayerScenario(scenario);
		newScenario.player = importedPlayer;
		importedPlayer.scenario.push(newScenario);
	}

	//Scraping Skills
	for (const dinoz of importedPlayer.dinoz) {
		const dinozFetch = await (
			await fetch(`http://${server}/dino/${dinoz.importedId}/setTab?t=details`, {
				method: 'GET',
				headers: {
					cookie: `sid=${cookie}`
				}
			})
		).text();
		let skillArray = [];
		const root = parse(dinozFetch);
		if (root.querySelector('title')?.firstChild.text.search(/Superdom/) !== -1) {
			throw new ErrorFormator(
				500,
				`The dinoz ${dinoz.name} is at the Superdom waiting its fight to be viewed. Please view it and retry.`
			);
		}
		const dinozDetails = root.getElementById(`dinozDetails`).querySelectorAll('tr');
		for (let i = 1; i < dinozDetails.length; i++) {
			const skillSearch = dinozDetails[i].childNodes[1].childNodes[1].childNodes;
			const skillRegex = skillSearch[skillSearch.length - 1].innerText.match(/\n\n\t\n (.*)\n\t\t\t/);
			if (!skillRegex) {
				throw new ErrorFormator(
					500,
					`There is an error in one the skill of the dinoz ${dinoz.importedId} from the player ${playerData.id}`
				);
			}
			const skill = skillRegex![1];
			const skillId = Object.entries(skillNameResolution).find(name =>
				name[1].some(el => accentsTidy(el) === accentsTidy(skill))
			);
			if (!skillId) {
				await sendDiscord(`Error in skill \`${skill}\` from the version ${serverResponse}`);
				continue;
			}
			let newSkill = new ImportedDinozSkill();
			newSkill.dinoz = dinoz;
			newSkill.skillId = parseInt(skillId[0]);
			skillArray.push(newSkill);
			switch (parseInt(skillId[0])) {
				case skillList.INGENIEUR.skillId:
					playerData.engineer = true;
					break;
				case skillList.LEADER.skillId:
					playerData.leader = true;
					break;
				case skillList.CUISINIER.skillId:
					playerData.cooker = true;
					break;
				case skillList.MAGASINIER.skillId:
					playerData.shopKeeper = true;
					break;
				case skillList.MARCHAND.skillId:
					playerData.merchant = true;
					break;
				case skillList.PRETRE.skillId:
					playerData.priest = true;
					break;
				case skillList.PROFESSEUR.skillId:
					playerData.teacher = true;
					break;
				case skillList.MESSIE.skillId:
					//TODO add this in player entity
					playerData.leader = true;
					break;
				default:
					break;
			}
		}
		dinoz.skills = skillArray;
	}

	const demonShop = await (
		await fetch(`http://${server}/shop/demon`, {
			method: 'GET',
			headers: {
				cookie: `sid=${cookie}`
			}
		})
	).text();
	const dinozShop = await parseShop(demonShop, importedPlayer);
	importedPlayer.dinoz.push(...dinozShop);

	await sleep(500);
	const dinorpgIngredient = await (
		await fetch(`http://${server}/user/ingr`, {
			method: 'GET',
			headers: {
				cookie: `sid=${cookie}`
			}
		})
	).text();

	const ingredientListRegex = [...dinorpgIngredient.matchAll(/document.getElementById\("ingr_(.*)"\).value = (\d+);/g)];
	const ingredientList = ingredientListRegex.map(ingredient => {
		const newIngredient = new ImportedPlayerIngredients(ingredientResolution[ingredient[1]], parseInt(ingredient[2]));
		newIngredient.player = importedPlayer;
		return newIngredient;
	});

	importedPlayer.ingredients = ingredientList;
	await saveImport(importedPlayer);
	await sendDiscord(`Thanks to ${importedPlayer.name} !\nYou imported ${importedPlayer.dinoz.length} dinoz.`);

	await resetUser(playerData.id);

	const importedDinoz = importedPlayer.dinoz
		.filter(dinoz => dinoz.isSacrificed === false)
		.map(dinoz => {
			return new Dinoz('import', playerData, dinoz.display, dinoz.toImportDinoz());
		});
	await setMultipleDinoz(importedDinoz);

	const ingredients = importedPlayer.ingredients.map(ing => {
		return new PlayerIngredient(playerData, ing.ingredientId, ing.quantity);
	});
	await setMultipleIngredient(ingredients);

	const items = importedPlayer.items.map(item => {
		return new PlayerItem(playerData, item.itemId, item.quantity);
	});
	await setMultipleItem(items);

	const rewards = importedPlayer.rewards.map(reward => {
		return new PlayerReward(playerData, reward.rewardId);
	});
	await addMultipleRewardToPlayer(rewards);

	playerData.money = importedPlayer.money;
	await setPlayer(playerData);

	const dinozCount = importedDinoz.length;
	const sumPoints = importedDinoz.reduce((partialSum, a) => partialSum + a.level, 0);
	const averagePoints = Math.round(sumPoints / dinozCount);
	await updatePoints(req.auth!.playerId!, sumPoints, averagePoints, dinozCount);

	return {
		status: 'imported',
		server: serverResponse,
		dinozCount: importedPlayer.dinoz.length,
		demonCount: dinozShop.length,
		twinoAccountName: importedPlayer.name,
		twinoAccountID: importedPlayer.twinId
	};
}

export async function importTwinoidData(req: Request): Promise<void> {
	const secrets: Array<Secret> = await getAllSecretsRequest();
	const code = req.body.code;
	const twinoidAPISecret = secrets.find(s => s.key === 'twinoAPI');
	if (!twinoidAPISecret) {
		throw new ErrorFormator(500, `Import are not ready yet.`);
	}
	const redirect_uri = secrets.find(s => s.key === 'redirect_uri');
	if (!redirect_uri) {
		throw new ErrorFormator(500, `Id don't know where we are`);
	}

	const client_id = secrets.find(s => s.key === 'client_id');
	if (!client_id) {
		throw new ErrorFormator(500, `Id don't the API ID.`);
	}
	const playerId: number = req.auth!.playerId!;

	const playerData: Player | null = await getImportedTwinoidData(playerId);

	if (!playerData) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	if (playerData.twinosite.length && playerData.twinosite.length > 0) {
		throw new ErrorFormator(500, `Sorry you already saved your data !`);
	}

	const url = 'https://twinoid.com/oauth/token';

	const params = new URLSearchParams();
	params.append('client_id', client_id.value);
	params.append('client_secret', twinoidAPISecret.value);
	params.append('redirect_uri', redirect_uri.value);
	params.append('code', code);
	params.append('grant_type', 'authorization_code');
	const ResponseAPI = (await (await fetch(url, { method: 'POST', body: params })).json()) as twinoResponseAPI;

	const paramsAPI = new URLSearchParams();
	paramsAPI.append('access_token', ResponseAPI.access_token);
	paramsAPI.append(
		'fields',
		'id,name,sites.fields(link,site.fields(name),stats.fields(id,score,name,rare,social,description),achievements.fields(id,name,stat,score,points,npoints,description,data,date,index),points,npoints)'
	);

	const me = (await (
		await fetch(`https://twinoid.com/graph/me`, { method: 'POST', body: paramsAPI })
	).json()) as TwinoUser;

	if (!me.sites) {
		throw new ErrorFormator(500, `Sorry ${me.name} there is nothing I can save about your account.`);
	}

	playerData.twinoStats = [];
	playerData.twinosite = [];
	playerData.twinoAchievement = [];
	me.sites.forEach(site => {
		if (site.npoints && site.npoints > 0) {
			const twinosite = new ImportedTwinoidSite();
			twinosite.player = playerData;
			twinosite.siteId = site.site.id;
			twinosite.npoints = Math.trunc(site.npoints);
			twinosite.points = Math.trunc(site.points);
			playerData.twinosite.push(twinosite);
		}

		if (site.achievements && site.achievements.length > 0) {
			const achievementsArray = site.achievements.map(ach => {
				const achievements = new ImportedTwinoidAchievements();
				achievements.player = playerData;
				achievements.siteId = site.site.id;
				achievements.date = ach.date;
				achievements.nameId = ach.id;
				achievements.requirement = ach.stat;
				achievements.quantity = ach.score;
				return achievements;
			});
			playerData.twinoAchievement.push(...achievementsArray);
		}

		if (site.stats && site.stats.length > 0) {
			const statArray = site.stats.map(stat => {
				const stats = new ImportedTwinoidStats();
				stats.player = playerData;
				stats.siteId = site.site.id;
				stats.score = Math.trunc(stat.score);
				stats.nameId = stat.id;
				return stats;
			});
			playerData.twinoStats.push(...statArray);
		}
	});
	await saveSite(playerData.twinosite);
	await saveStats(playerData.twinoStats);
	await saveAchievements(playerData.twinoAchievement);
}*/

export async function displayTwinoidSite(req: Request): Promise<Array<TwinoStat>> {
	const playerId = req.params.id;
	const playerSite: Array<ImportedTwinoidSite> = await getImportedPlayerSite(parseInt(playerId));
	return playerSite.map(site => site.toTwinoStat());
}

export async function displayTwinoidSpecificSite(req: Request): Promise<Array<SiteStat> | Array<SiteAchiev>> {
	const site: number = parseInt(req.params.site);
	const playerId = req.params.id;
	const type: string = req.params.type;
	if (type === 'stat') {
		const playerSite: Array<ImportedTwinoidStats> = await getImportedPlayerSpecificSiteStat(parseInt(playerId), site);
		return playerSite.map(site => site.toSiteStat());
	} else {
		const playerSite: Array<ImportedTwinoidAchievements> = await getImportedPlayerSpecificSiteAchievements(
			req.auth?.playerId!,
			site
		);
		return playerSite.map(site => site.toSiteAchiev());
	}
}
