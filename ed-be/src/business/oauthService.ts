import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { currentEvents, GameEvent } from '@drpg/core/models/event/Events';
import { Item } from '@drpg/core/models/item/ItemList';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { orderDinozList, toDinozFiche } from '@drpg/core/utils/DinozUtils';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { LogType } from '@drpg/prisma';
import { EternaltwinNodeClient } from '@eternaltwin/client-node';
import { ErrorCode } from '@eternaltwin/client-node/error';
import { AuthType } from '@eternaltwin/core/auth/auth-type';
import { GetAccessTokenError, RfcOauthClient } from '@eternaltwin/oauth-client-http/rfc-oauth-client';
import { trace } from '@opentelemetry/api';
import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { Config } from 'release-it';
import urlJoin from 'url-join';
import gameConfig from '../config/game.config.js';
import { LOGGER } from '../context.js';
import { getDinozTotalCount, updateDinoz } from '../dao/dinozDao.js';
import { createLog } from '../dao/logDao.js';
import { archiveOldUsername, createPlayer, getCommonDataRequest, setPlayer } from '../dao/playerDao.js';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { addPlayerInRanking, updateCompletion } from '../dao/rankingDao.js';
import { setSpecificStat } from '../dao/trackingDao.js';
import { PismaClientLocal } from '../prisma.js';
import { calculatePlayerCompletion } from '../utils/boxesLogic.js';
import sendError from '../utils/sendErrors.js';
import { getAvailableActions } from './dinozService.js';

export class OAuth {
	#oauthClient: RfcOauthClient;

	#eternaltwinClient: EternaltwinNodeClient;

	#prisma: PismaClientLocal;

	public constructor(config: Config, prisma: PismaClientLocal) {
		this.#oauthClient = new RfcOauthClient({
			authorizationEndpoint: new URL(urlJoin(config.eternaltwin.url, 'oauth/authorize')),
			tokenEndpoint: new URL(urlJoin(config.eternaltwin.url, 'oauth/token')),
			callbackEndpoint: new URL(urlJoin(config.selfUrl.toString(), 'authentication')),
			clientId: config.eternaltwin.clientRef,
			clientSecret: config.eternaltwin.secret
		});
		this.#eternaltwinClient = new EternaltwinNodeClient(new URL(config.eternaltwin.url));
		this.#prisma = prisma;
	}

	public redirect(_req: Request, res: Response) {
		// Disable CORS
		res.header('Access-Control-Allow-Origin', '*');

		try {
			res.send({
				url: this.#oauthClient.getAuthorizationUri('base', 'authenticate')
			});
		} catch (error) {
			sendError(res, error);
		}
	}

	public async token(req: Request, res: Response<PlayerCommonData>) {
		// Disable CORS
		res.header('Access-Control-Allow-Origin', '*');

		try {
			if (!req.query.code || typeof req.query.code !== 'string') {
				throw new ExpectedError('Invalid code');
			}

			// ETwin Token
			const token = await this.#oauthClient.getAccessToken(req.query.code);

			// ETWin User
			const self = await this.#eternaltwinClient.getAuthSelf({ auth: token.accessToken });

			if (self.type !== AuthType.AccessToken) {
				throw new Error('Invalid auth type');
			}
			trace.getActiveSpan()?.addEvent('getAuthSelf', { 'user.id': self.user.id });

			// Get user's IP
			const ip =
				req.headers['x-forwarded-for']?.toString().split(', ')[0] ||
				req.headers['x-real-ip']?.toString().split(', ')[0] ||
				req.socket.remoteAddress;

			/*			if (ip) {
				// Check if the IP is banned
				const bannedIp = await ServerState.isIpBanned(this.#prisma, ip);

				if (bannedIp) {
					throw new ForbiddenError(translate('ipBanned', null));
				}
			}*/

			const { user: etwinUser } = self;
			// Check if player already exists in database
			let player = await getCommonDataRequest(etwinUser.id);

			// If player isn't found in database, create a new one
			if (player === null) {
				// Create new player in database
				player = await createPlayer({
					id: etwinUser.id,
					name: etwinUser.displayName.current.value,
					money: gameConfig.general.initialMoney,
					quetzuBought: 0
				});
				// Create player at position 0 in ranking
				await addPlayerInRanking(player.id);

				await increaseItemQuantity(player.id, Item.DAILY_TICKET, 1);
				if (dayjs().month() === 11) {
					await increaseItemQuantity(player.id, Item.CHRISTMAS_TICKET, 1);
				}
				await createLog(LogType.PlayerCreated, player.id, undefined, player.name.toString(), player.id);
				return {
					money: player.money,
					dinozCount: await getDinozTotalCount(),
					dinoz: [],
					id: player.id,
					name: player.name,
					clanId: player.ClanMember?.clanId,
					playerOptions: {
						hasPDA: false,
						hasPMI: false,
						hasPAC: false,
					},
					admin: false,
					priest: false,
					shopkeeper: false,
					notifications: false
				};
			}

			// Update display name if changed on ET side
			if (player && player.name !== etwinUser.displayName.current.value) {
				await setPlayer(player.id, { name: etwinUser.displayName.current.value });
				await archiveOldUsername(player.id, player.name);
			}

			// Update ip address
			if (ip && !player.ips.includes(ip)) {
				await setPlayer(player.id, { ips: [...player.ips, ip] });
			}

			/*			// Check if user is banned
			if (user.bannedAt) {
				throw new Error(translate('bannedAccount', user, { reason: translate(`banReason.${user.banReason || ''}`, user) }));
			}*/

			if (!dayjs().isSame(player.lastLogin, 'day')) {
				// Add 1 daily ticket
				await increaseItemQuantity(player.id, Item.DAILY_TICKET, 1);

				// Update completion
				const completion = await calculatePlayerCompletion(player.id);
				try {
					await updateCompletion(player.id, completion);
				} catch (e) {
					LOGGER.error(`UpdateCompletion crash with id: ${player.id} and completion score of ${completion}`);
				}

				// Update last login: refresh Labrute flag and daily grid reward limit
				await setPlayer(player.id, {
					lastLogin: new Date(),
					labruteDone: false,
					dailyGridRewards: gameConfig.general.dailyGridRewards
				});

				// Tik bracelet regen (& alive)
				const dinozWithTikBracelet = player.dinoz.filter(
					dinoz => dinoz.items.some(item => item.itemId === Item.TIK_BRACELET) && dinoz.life > 0
				);

				for (const dinoz of dinozWithTikBracelet) {
					// Regen 10 HP
					const newHp = Math.min(dinoz.life + 10, dinoz.maxLife);
					await updateDinoz(dinoz.id, { life: newHp });
				}

				if (currentEvents()[0] === GameEvent.CHRISTMAS) {
					await increaseItemQuantity(player.id, Item.CHRISTMAS_TICKET, 1);
				}

				// Give 2 action for active dinoz
				const leaderWithVeilleuse = player.dinoz.filter(d => d.skills.some(s => s.skillId === Skill.VEILLEUSE));
				for (const dinoz of player.dinoz) {
					let remaning = 2;
					if (player.matelasseur) remaning++;
					if (dinoz.skills.some(s => s.skillId === Skill.GROS_DORMEUR)) remaning++;
					if (leaderWithVeilleuse.some(d => d.followers.some(di => di.id === dinoz.id))) remaning++;
					await updateDinoz(dinoz.id, { remaining: remaning });
				}

				// Update stat
				await setSpecificStat(StatTracking.P_DAYS, player.id, 1);
				await createLog(LogType.PlayerConnected, player.id, undefined, player.name.toString());
			}

			const dinoz = player.dinoz.map(d => {
				return { ...toDinozFiche(player, d.id) };
			});
			for (const d of dinoz) {
				d.actions = await getAvailableActions(d, player);
			}

			const commonData: PlayerCommonData = {
				money: player.money,
				dinozCount: await getDinozTotalCount(),
				dinoz: dinoz,
				id: player.id,
				name: player.name,
				connexionToken: player.connexionToken,
				clanId: player.ClanMember?.clanId,
				playerOptions: {
					hasPDA: player.rewards.some(reward => reward.rewardId === Reward.PDA),
					hasPMI: player.rewards.some(reward => reward.rewardId === Reward.PMI),
					hasPAC: player.rewards.some(reward => reward.rewardId === Reward.PAC),
					skipLevel: player.skipLevel,
					skipFight: player.skipFight
				},
				admin: req?.auth?.isAdmin || false,
				priest: player.priest,
				shopkeeper: player.shopKeeper,
				notifications: player.notifications,
				discoveredSkills: player.discoveredSkills
			};

			// Order dinoz
			commonData.dinoz = orderDinozList(commonData.dinoz);

			res.send(commonData);
		} catch (error: unknown) {
			if (error instanceof GetAccessTokenError) {
				switch (error?.eternaltwin?.code) {
					case ErrorCode.OauthCodeTimeError:
					case ErrorCode.OauthCodeFormatError:
						// Skip logging the error when the token is expired or the format
						// is invalid. This can happen if an old token is reused. This
						// usually happens when the JS redirects fails and the original
						// URL with the token remains in the browser history.
						break;
					default:
						sendError(res, error);
				}
			} else {
				sendError(res, error);
			}
		}
	}
}
