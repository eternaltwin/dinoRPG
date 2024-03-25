import { Item } from '@drpg/core/models/item/ItemList';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { orderDinozList, toDinozFiche, toDinozFicheLite, toDinozPublicFiche } from '@drpg/core/utils/DinozUtils';
import dayjs from 'dayjs';
import { Request } from 'express';
import { getAllDinozFicheLite, getDinozTotalCount, updateDinoz } from '../dao/dinozDao.js';
import {
	getCommonDataRequest,
	getPlayerDataRequest,
	getPlayerRewardsRequest,
	searchPlayersByName,
	setPlayer
} from '../dao/playerDao.js';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { calculatePlayerPower } from '../utils/boxesLogic.js';
import { updateCompletion } from '../dao/rankingDao.js';
import { Skill } from '@drpg/core/models/dinoz/SkillList';

/**
 * @summary Get data from player on login
 * @param req
 * @return Player
 */
export async function getCommonData(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}
	const playerCommonData = await getCommonDataRequest(req.auth.playerId);
	if (!playerCommonData) {
		throw new ErrorFormator(500, `Player ${req.auth.playerId} doesn't exist.`);
	}

	// Check if it's the first login of the day
	if (!dayjs().isSame(playerCommonData.lastLogin, 'day')) {
		// Add 1 daily ticket
		await increaseItemQuantity(req.auth.playerId, Item.DAILY_TICKET, 1);

		// Update completion
		const completion = await calculatePlayerPower(playerCommonData.id);
		await updateCompletion(req.auth.playerId, completion);

		// Update last login
		await setPlayer(req.auth.playerId, { lastLogin: new Date() });

		// Tik bracelet regen
		const dinozWithTikBracelet = playerCommonData.dinoz.filter(dinoz =>
			dinoz.items.some(item => item.itemId === Item.TIK_BRACELET)
		);

		for (const dinoz of dinozWithTikBracelet) {
			// Regen 10 HP
			const newHp = Math.min(dinoz.life + 10, dinoz.maxLife);
			await updateDinoz(dinoz.id, { life: newHp });
		}

		// Give 2 action for active dinoz
		const leaderWithVeilleuse = playerCommonData.dinoz.filter(d => d.skills.some(s => s.skillId === Skill.VEILLEUSE));
		for (const dinoz of playerCommonData.dinoz) {
			let remaning = 2;
			if (playerCommonData.matelasseur) remaning++;
			if (dinoz.skills.some(s => s.skillId === Skill.GROS_DORMEUR)) remaning++;
			if (leaderWithVeilleuse.some(d => d.followers.some(di => di.id === dinoz.id))) remaning++;
			await updateDinoz(dinoz.id, { remaining: remaning });
		}
	}

	const commonData: PlayerCommonData = {
		money: playerCommonData.money,
		dinozCount: await getDinozTotalCount(),
		dinoz: playerCommonData.dinoz.map(dinoz => {
			return toDinozFiche({
				...dinoz,
				player: {
					engineer: playerCommonData.engineer,
					rewards: playerCommonData.rewards,
					items: playerCommonData.items
				}
			});
		}),
		id: playerCommonData.id,
		name: playerCommonData.name,
		playerOptions: {
			hasPDA: playerCommonData.rewards.some(reward => reward.rewardId === rewardList.PDA),
			hasPMI: playerCommonData.rewards.some(reward => reward.rewardId === rewardList.PMI)
		},
		admin: req.auth.isAdmin || false
	};

	// Order dinoz
	commonData.dinoz = orderDinozList(commonData.dinoz);

	return commonData;
}

/**
 * @summary Get data from an account
 * @param req
 * @param req.params.id {string} PlayerId
 * @return PlayerInfo
 */
export async function getAccountData(req: Request) {
	const playerId = +req.params.id;
	const playerInfo = await getPlayerDataRequest(playerId);
	if (!playerInfo) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	// Subscription date
	const date = playerInfo.createdDate.toLocaleString().split(',')[0].split('/');
	const formatter = new Intl.DateTimeFormat('fr', { month: 'long' });
	const month = formatter.format(new Date(parseInt(date[2]), parseInt(date[0]) - 1, parseInt(date[1])));
	const subscribe = `${date[1]} ${month} ${date[2]}`;

	// Clan TODO
	const clan: string | undefined = undefined;

	if (!playerInfo.ranking) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't have a ranking.`);
	}

	const infoToSend: PlayerInfo = {
		dinozCount: playerInfo.ranking.dinozCount,
		pointCount: playerInfo.ranking.points,
		subscribeAt: subscribe,
		clan: clan,
		playerName: playerInfo.name,
		epicRewards: playerInfo.rewards.map(reward => reward.rewardId).sort((a, b) => a - b),
		dinoz: playerInfo.dinoz.map(dinoz => {
			return toDinozPublicFiche({
				...dinoz
			});
		}),
		customText: playerInfo.customText,
		completion: playerInfo.ranking.completion
		// twinoid: playerInfo.twinosite.map(i => {return {siteId: i.siteId, points: i.points, npoints: i.npoints}})
	};

	return infoToSend;
}

/**
 * @summary Set custom text for a player
 * @param req
 * @param req.body.message {string} Message to set as custom text
 * @return void
 */
export async function setCustomText(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}

	const playerId: number = req.auth.playerId;
	const playerProfile = await getPlayerRewardsRequest(playerId);
	if (!playerProfile) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}
	//Check if user can edit
	if (!playerProfile.rewards.some(reward => reward.rewardId === rewardList.PLUME)) {
		throw new ErrorFormator(500, `Player ${playerId} cannot edit this field`);
	}

	await setPlayer(playerId, { customText: req.body.message });
}

/**
 * @summary Fetch a list of player based on a string
 * @param req
 * @param req.params.id {string}
 * @return Array<Player>
 */
export async function searchPlayers(req: Request) {
	const playerList = await searchPlayersByName(req.params.name);

	return playerList;
}

export async function getDinozList(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}

	const playerId: number = req.auth.playerId;
	const dinozActive = await getAllDinozFicheLite(playerId);
	if (!dinozActive) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	return dinozActive.map(dinoz => toDinozFicheLite(dinoz))
}
