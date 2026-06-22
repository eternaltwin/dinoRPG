import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { UnavailableReason } from '@drpg/prisma';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { Skill } from '@drpg/core/models/dinoz/SkillList';

vi.mock('../../dao/dinozDao.js', () =>
	Object.fromEntries(
		[
			'checkFrozenDinoz', 'checkRestDinoz', 'createDinoz', 'getActiveDinoz', 'getAvailableDinozToFollow',
			'getCanDinozChangeName', 'getDinozFicheLiteRequest', 'getDinozFicheRequest', 'getDinozFightDataRequest',
			'getDinozGatherData', 'getDinozSkillAndStatusRequest', 'getDinozSkillRequest', 'getFollowingDinoz',
			'getIrmaUsageInfo', 'getLeaderWithFollowers', 'getManageData', 'isDinozInTournament', 'updateDinoz',
			'updateMultipleDinoz', 'updateOrderData'
		].map(m => [m, vi.fn()])
	)
);
vi.mock('../../dao/dinozSkillDao.js', () => ({ addMultipleSkillToDinoz: vi.fn(), setSkillStateRequest: vi.fn() }));
vi.mock('../../dao/dinozStatusDao.js', () => ({ addStatusToDinoz: vi.fn(), removeStatusFromDinoz: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn(), createLogForMultipleDinoz: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({
	addMoney: vi.fn(), auth: vi.fn(), getPlayerCompletion: vi.fn(), ownsDinoz: vi.fn(),
	removeDailyGridRewards: vi.fn(), removeMoney: vi.fn()
}));
vi.mock('../../dao/playerDinozShopDao.js', () => ({ deleteDinozInShopRequest: vi.fn(), getDinozShopDetailsRequest: vi.fn() }));
vi.mock('../../dao/playerGatherDao.js', () => ({ createGrid: vi.fn(), getCommonGatherInfo: vi.fn(), updateGrid: vi.fn() }));
vi.mock('../../dao/playerIngredientDao.js', () => ({ increaseIngredientQuantity: vi.fn(), setIngredient: vi.fn() }));
vi.mock('../../dao/playerItemDao.js', () => ({ decreaseItemQuantity: vi.fn(), increaseItemQuantity: vi.fn(), insertItem: vi.fn() }));
vi.mock('../../dao/playerRewardsDao.js', () => ({ getPlayerRewards: vi.fn() }));
vi.mock('../../dao/questsDao.js', () => ({ upsertQuest: vi.fn() }));
vi.mock('../../dao/rankingDao.js', () => ({ updateDinozCount: vi.fn(), updatePoints: vi.fn() }));
vi.mock('../../dao/secretDao.js', () => ({ getSpecificSecret: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../prisma.js', () => ({
	prisma: { clanEvent: { findFirst: vi.fn() }, dinoz: { updateMany: vi.fn() } }
}));
vi.mock('../../utils/rewarder.js', () => ({ rewarder: vi.fn() }));
vi.mock('../../utils/tournamentManager.js', () => ({ default: { getCurrentTournamentState: vi.fn() } }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../business/fightService.js', () => ({
	calculateFightVsMonsters: vi.fn(), fightMonstersAtPlace: vi.fn(), rewardFightVsMonsters: vi.fn()
}));
vi.mock('../../business/missionsService.js', () => ({ getMissionAction: vi.fn() }));
vi.mock('../../business/specialService.js', () => ({ movementListener: vi.fn() }));
vi.mock('../../business/clanWar.js', () => ({ currentWar: vi.fn() }));
vi.mock('@drpg/core/utils/checkCondition', () => ({ checkCondition: vi.fn().mockReturnValue(false) }));
vi.mock('../../utils/dinoz.js', () => ({
	getNumberOfGatheringTries: vi.fn().mockReturnValue(3),
	initializeDinoz: vi.fn().mockReturnValue({ name: 'new' }),
	sanitizeGatherBoxes: vi.fn().mockReturnValue([0])
}));
vi.mock('@drpg/core/utils/DinozUtils', async orig => {
	const actual = (await orig()) as Record<string, unknown>;
	return {
		...actual,
		actualPlace: vi.fn().mockReturnValue({ placeId: 1, gather: undefined, specialGather: undefined, borderPlace: [2], name: 'P' }),
		isAlive: vi.fn().mockReturnValue(true),
		canLevelUp: vi.fn().mockReturnValue(false),
		getFollowableDinoz: vi.fn().mockReturnValue([]),
		getMaxFollowers: vi.fn().mockReturnValue(4),
		toDinozFiche: vi.fn().mockReturnValue({ id: 1, actions: [] }),
		toSkillDetails: vi.fn().mockReturnValue([{ id: 1 }]),
		getRace: vi.fn().mockReturnValue({ raceId: 1, price: 100 }),
		knowSkillId: vi.fn().mockReturnValue(true),
		canChangeSkillState: vi.fn().mockReturnValue(true),
		canGoToThisPlace: vi.fn().mockReturnValue(true)
	};
});

import * as dinozDao from '../../dao/dinozDao.js';
import { setSkillStateRequest } from '../../dao/dinozSkillDao.js';
import * as playerDao from '../../dao/playerDao.js';
import { getDinozShopDetailsRequest } from '../../dao/playerDinozShopDao.js';
import { getPlayerRewards } from '../../dao/playerRewardsDao.js';
import { getSpecificSecret } from '../../dao/secretDao.js';
import { prisma } from '../../prisma.js';
import TournamentManager from '../../utils/tournamentManager.js';
import { getMissionAction } from '../../business/missionsService.js';
import { movementListener } from '../../business/specialService.js';
import * as fightService from '../../business/fightService.js';
import { rewarder } from '../../utils/rewarder.js';
import * as DinozUtils from '@drpg/core/utils/DinozUtils';
import { Reward } from '@drpg/core/models/reward/RewardList';
import {
	getAvailableActions,
	getDinozFiche,
	getDinozSkill,
	buyDinoz,
	betaMove,
	digWithDinoz,
	setDinozName,
	setSkillState,
	resurrectDinoz,
	getDinozToManage,
	updateOrders,
	followDinoz,
	unfollowDinoz,
	changeLeaderDinoz,
	disband,
	useIrma,
	frozeDinoz,
	unfrozeDinoz,
	restDinoz
} from '../../business/dinozService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

const baseDinoz = (overrides = {}) => ({
	id: 1, level: 10, experience: 0, leaderId: null, fight: true, gather: true, remaining: 3,
	maxLife: 100, unavailableReason: null, placeId: 1, life: 100,
	missions: [], concentration: null, followers: [], status: [], skills: [],
	...overrides
});
const player = (overrides = {}) => ({ id: 'p1', clan: null, ...overrides }) as never;

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1' } as never);
	vi.mocked(prisma.clanEvent.findFirst).mockResolvedValue(null as never);
	vi.mocked(getSpecificSecret).mockResolvedValue({ value: '999' } as never);
	vi.mocked(dinozDao.getAvailableDinozToFollow).mockResolvedValue([] as never);
	vi.mocked(dinozDao.isDinozInTournament).mockResolvedValue(false as never);
	vi.mocked(getMissionAction).mockReturnValue(undefined as never);
	vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue(null as never);
	vi.mocked(DinozUtils.isAlive).mockReturnValue(true as never);
	vi.mocked(DinozUtils.canLevelUp).mockReturnValue(false as never);
});

describe('getAvailableActions', () => {
	it('returns [] when unfreezing', async () => {
		expect(await getAvailableActions(baseDinoz({ unavailableReason: UnavailableReason.unfreezing }) as never, player())).toEqual([]);
	});
	it('returns [] when resting attack', async () => {
		expect(await getAvailableActions(baseDinoz({ unavailableReason: UnavailableReason.restingAttack }) as never, player())).toEqual([]);
	});
	it('returns market when selling', async () => {
		const result = await getAvailableActions(baseDinoz({ unavailableReason: UnavailableReason.selling }) as never, player());
		expect(result.length).toBe(1);
	});
	it('returns stop-congel when frozen', async () => {
		const result = await getAvailableActions(baseDinoz({ unavailableReason: UnavailableReason.frozen }) as never, player());
		expect(result.length).toBe(1);
	});
	it('returns stop-rest when resting', async () => {
		const result = await getAvailableActions(baseDinoz({ unavailableReason: UnavailableReason.resting }) as never, player());
		expect(result.length).toBe(1);
	});
	it('returns resurrect when dead', async () => {
		vi.mocked(DinozUtils.isAlive).mockReturnValue(false as never);
		const result = await getAvailableActions(baseDinoz({ life: 0 }) as never, player());
		expect(result.length).toBeGreaterThanOrEqual(1);
	});
	it('adds reincarnation for a high-level dead reincarnating dinoz', async () => {
		vi.mocked(DinozUtils.isAlive).mockReturnValue(false as never);
		const result = await getAvailableActions(
			baseDinoz({ life: 0, level: 45, skills: [{ skillId: Skill.REINCARNATION }] }) as never,
			player()
		);
		expect(result.length).toBe(2);
	});
	it('builds actions for an alive free dinoz', async () => {
		const result = await getAvailableActions(baseDinoz({ fight: true, gather: false, remaining: 3 }) as never, player());
		expect(result.length).toBeGreaterThan(0);
	});
	it('adds unfollow & change-leader for a follower', async () => {
		const result = await getAvailableActions(baseDinoz({ leaderId: 5 }) as never, player());
		expect(result.length).toBeGreaterThanOrEqual(2);
	});
	it('adds disband for a leader', async () => {
		const result = await getAvailableActions(baseDinoz({ followers: [{ id: 2, fight: true, remaining: 1, gather: true }] }) as never, player());
		expect(result.length).toBeGreaterThan(0);
	});
	it('returns concentrate when concentrating', async () => {
		const result = await getAvailableActions(baseDinoz({ concentration: { id: 1 } }) as never, player());
		expect(result.some(a => a.name)).toBe(true);
	});
	it('adds irma when no remaining actions', async () => {
		const result = await getAvailableActions(baseDinoz({ fight: false, remaining: 0 }) as never, player());
		expect(result.length).toBeGreaterThan(0);
	});
	it('adds level-up when allowed', async () => {
		vi.mocked(DinozUtils.canLevelUp).mockReturnValue(true as never);
		const result = await getAvailableActions(baseDinoz() as never, player());
		expect(result.length).toBeGreaterThan(0);
	});
	it('adds market when at the market place', async () => {
		const result = await getAvailableActions(baseDinoz({ placeId: PlaceEnum.PLACE_DU_MARCHE }) as never, player());
		expect(result.length).toBeGreaterThan(0);
	});
	it('adds dig when holding a shovel', async () => {
		const result = await getAvailableActions(baseDinoz({ status: [{ statusId: DinozStatusId.SHOVEL }] }) as never, player());
		expect(result.length).toBeGreaterThan(0);
	});
});

describe('getDinozFiche', () => {
	it('returns the fiche with actions', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest).mockResolvedValue({ dinoz: [baseDinoz()] } as never);
		const result = await getDinozFiche(req({ id: '1' }));
		expect(result).toBeDefined();
	});
	it('throws when player not found', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest).mockResolvedValue(null as never);
		await expect(getDinozFiche(req({ id: '1' }))).rejects.toThrow('playerNotFound');
	});
	it('throws when no dinoz', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest).mockResolvedValue({ dinoz: [] } as never);
		await expect(getDinozFiche(req({ id: '1' }))).rejects.toThrow('dinozNotFound');
	});
	it('throws when dinoz not owned', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest).mockResolvedValue({ dinoz: [baseDinoz({ id: 2 })] } as never);
		await expect(getDinozFiche(req({ id: '1' }))).rejects.toThrow("doesn't belong");
	});
});

describe('getDinozSkill', () => {
	it('returns skill details', async () => {
		vi.mocked(dinozDao.getDinozSkillRequest).mockResolvedValue({ id: 1, player: { id: 'p1' }, skills: [] } as never);
		expect(await getDinozSkill(req({ id: '1' }))).toEqual([{ id: 1 }]);
	});
	it('throws when not found', async () => {
		vi.mocked(dinozDao.getDinozSkillRequest).mockResolvedValue(null as never);
		await expect(getDinozSkill(req({ id: '1' }))).rejects.toThrow('dinozNotFound');
	});
	it('throws when not owned', async () => {
		vi.mocked(dinozDao.getDinozSkillRequest).mockResolvedValue({ id: 1, player: { id: 'x' }, skills: [] } as never);
		await expect(getDinozSkill(req({ id: '1' }))).rejects.toThrow("doesn't belong");
	});
});

describe('buyDinoz', () => {
	beforeEach(() => {
		vi.mocked(dinozDao.getActiveDinoz).mockResolvedValue([] as never);
		vi.mocked(getDinozShopDetailsRequest).mockResolvedValue({ player: { id: 'p1', money: 1000 }, display: 'd' } as never);
		vi.mocked(dinozDao.createDinoz).mockResolvedValue({ id: 9 } as never);
	});
	it('buys a dinoz', async () => {
		const result = await buyDinoz(req({ id: '5' }));
		expect(playerDao.removeMoney).toHaveBeenCalled();
		expect(result).toBeDefined();
	});
	it('throws when dinoz shop missing', async () => {
		vi.mocked(getDinozShopDetailsRequest).mockResolvedValue(null as never);
		await expect(buyDinoz(req({ id: '5' }))).rejects.toThrow('dinozNotFound');
	});
	it('throws when not enough money', async () => {
		vi.mocked(getDinozShopDetailsRequest).mockResolvedValue({ player: { id: 'p1', money: 0 }, display: 'd' } as never);
		await expect(buyDinoz(req({ id: '5' }))).rejects.toThrow('notEnoughMoney');
	});
});

describe('setDinozName', () => {
	it('renames a dinoz with a valid name', async () => {
		vi.mocked(dinozDao.getCanDinozChangeName).mockResolvedValue({ id: 1, player: { id: 'p1' }, canChangeName: true } as never);
		await setDinozName(req({ id: '1' }, { newName: 'Rex' }));
		expect(dinozDao.updateDinoz).toHaveBeenCalled();
	});
	it('throws on invalid name', async () => {
		vi.mocked(dinozDao.getCanDinozChangeName).mockResolvedValue({ id: 1, player: { id: 'p1' }, canChangeName: true } as never);
		await expect(setDinozName(req({ id: '1' }, { newName: '@@' }))).rejects.toThrow('OnlyLettersAndNumbers');
	});
	it('throws when cannot change name', async () => {
		vi.mocked(dinozDao.getCanDinozChangeName).mockResolvedValue({ id: 1, player: { id: 'p1' }, canChangeName: false } as never);
		await expect(setDinozName(req({ id: '1' }, { newName: 'Rex' }))).rejects.toThrow("Can't update");
	});
});

describe('setSkillState', () => {
	it('toggles a skill state', async () => {
		vi.mocked(dinozDao.getDinozSkillAndStatusRequest).mockResolvedValue({ id: 1, player: { id: 'p1' } } as never);
		const result = await setSkillState(req({ id: '1' }, { skillId: '11102', skillState: true }));
		expect(setSkillStateRequest).toHaveBeenCalled();
		expect(result).toBe(false);
	});
	it('throws when dinoz missing', async () => {
		vi.mocked(dinozDao.getDinozSkillAndStatusRequest).mockResolvedValue(null as never);
		await expect(setSkillState(req({ id: '1' }, { skillId: '11102' }))).rejects.toThrow('dinozNotFound');
	});
	it('throws when skill does not exist', async () => {
		vi.mocked(dinozDao.getDinozSkillAndStatusRequest).mockResolvedValue({ id: 1, player: { id: 'p1' } } as never);
		await expect(setSkillState(req({ id: '1' }, { skillId: '999999999' }))).rejects.toThrow("doesn't know exist");
	});
});

describe('resurrectDinoz', () => {
	it('revives a dead dinoz', async () => {
		vi.mocked(dinozDao.getDinozFicheLiteRequest).mockResolvedValue({
			life: 0, experience: 10, placeId: PlaceEnum.DINOVILLE, name: 'd', followers: [],
			player: { id: 'p1', quests: [] }
		} as never);
		await resurrectDinoz(req({ id: '1' }));
		expect(dinozDao.updateDinoz).toHaveBeenCalled();
	});
	it('throws when alive', async () => {
		vi.mocked(dinozDao.getDinozFicheLiteRequest).mockResolvedValue({
			life: 10, name: 'd', followers: [], player: { id: 'p1', quests: [] }
		} as never);
		await expect(resurrectDinoz(req({ id: '1' }))).rejects.toThrow('not dead');
	});
});

describe('management & group endpoints', () => {
	it('getDinozToManage returns list when player has PDA', async () => {
		vi.mocked(getPlayerRewards).mockResolvedValue([{ rewardId: Reward.PDA }] as never);
		vi.mocked(dinozDao.getManageData).mockResolvedValue(['d'] as never);
		expect(await getDinozToManage(req())).toEqual(['d']);
	});
	it('getDinozToManage throws without PDA', async () => {
		vi.mocked(getPlayerRewards).mockResolvedValue([] as never);
		await expect(getDinozToManage(req())).rejects.toThrow('no PDA');
	});
	it('updateOrders updates ordering', async () => {
		vi.mocked(getPlayerRewards).mockResolvedValue([{ rewardId: Reward.PDA }] as never);
		vi.mocked(dinozDao.updateOrderData).mockResolvedValue(['ordered'] as never);
		expect(await updateOrders(req({}, { order: [3, 1, 2] }))).toEqual(['ordered']);
	});
	it('updateOrders throws on non-array', async () => {
		await expect(updateOrders(req({}, { order: 'no' }))).rejects.toThrow('not an array');
	});

	it('followDinoz links a dinoz to a leader', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest)
			.mockResolvedValueOnce({ dinoz: [{ id: 1, canChangeName: false, leaderId: null, followers: [], skills: [], placeId: 1 }] } as never)
			.mockResolvedValueOnce({ dinoz: [{ id: 2, canChangeName: false, followers: [], skills: [], placeId: 1 }] } as never);
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		await followDinoz(req({ id: '1', targetId: '2' }));
		expect(dinozDao.updateDinoz).toHaveBeenCalledWith(1, { leader: { connect: { id: 2 } } });
	});
	it('followDinoz throws when following itself', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest).mockResolvedValue({ dinoz: [{ id: 1, canChangeName: false, leaderId: null, followers: [], skills: [], placeId: 1 }] } as never);
		await expect(followDinoz(req({ id: '1', targetId: '1' }))).rejects.toThrow('Cannot follow itself');
	});

	it('unfollowDinoz disconnects the leader', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		await unfollowDinoz(req({ id: '1' }));
		expect(dinozDao.updateDinoz).toHaveBeenCalledWith(1, { leader: { disconnect: true } });
	});
	it('unfollowDinoz throws when not owned', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(false as never);
		await expect(unfollowDinoz(req({ id: '1' }))).rejects.toThrow('does not own');
	});

	it('changeLeaderDinoz promotes a follower', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.getLeaderWithFollowers).mockResolvedValue({ id: 5, followers: [{ id: 1 }] } as never);
		await changeLeaderDinoz(req({ id: '1' }));
		expect(prisma.dinoz.updateMany).toHaveBeenCalled();
	});

	it('disband releases followers', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.getFollowingDinoz).mockResolvedValue({ followers: [{ id: 2 }, { id: 3 }] } as never);
		await disband(req({ id: '1' }));
		expect(dinozDao.updateDinoz).toHaveBeenCalledTimes(2);
	});
});

describe('useIrma', () => {
	it('refreshes actions and consumes potions', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.getIrmaUsageInfo).mockResolvedValue({
			id: 1, fight: false, gather: false, remaining: 0, followers: [],
			player: { id: 'p1', items: [{ itemId: 1, quantity: 5 }] }
		} as never);
		const result = await useIrma(req({ id: '1' }));
		expect(result.category).toBeDefined();
	});
	it('throws when not enough irma', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.getIrmaUsageInfo).mockResolvedValue({
			id: 1, fight: false, gather: false, remaining: 0, followers: [],
			player: { id: 'p1', items: [] }
		} as never);
		await expect(useIrma(req({ id: '1' }))).rejects.toThrow('notEnoughIrma');
	});
});

describe('betaMove', () => {
	const fightablePlayer = (dinozOverrides = {}) => ({
		id: 'p1',
		items: [],
		rewards: [],
		quests: [],
		ranking: null,
		dinoz: [
			{
				id: 1,
				life: 100,
				fight: true,
				gather: true,
				leaderId: null,
				unavailableReason: null,
				canChangeName: false,
				concentration: null,
				status: [],
				...dinozOverrides
			}
		]
	});

	it('moves the dinoz and fights monsters at the destination', async () => {
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue(fightablePlayer() as never);
		vi.mocked(movementListener).mockResolvedValue(false as never);
		vi.mocked(fightService.fightMonstersAtPlace).mockResolvedValue({ result: true, fighters: [] } as never);
		const result = await betaMove(req({}, { dinozId: 1, placeId: 2 }));
		expect(result).toBeDefined();
		expect(dinozDao.updateMultipleDinoz).toHaveBeenCalled();
	});

	it('throws when the dinoz is unavailable', async () => {
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue(
			fightablePlayer({ unavailableReason: 'frozen' }) as never
		);
		await expect(betaMove(req({}, { dinozId: 1, placeId: 2 }))).rejects.toThrow('not able to move');
	});

	it('throws when the destination does not exist', async () => {
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue(fightablePlayer() as never);
		await expect(betaMove(req({}, { dinozId: 1, placeId: 999999 }))).rejects.toThrow('the void');
	});
});

describe('digWithDinoz', () => {
	it('digs and rewards gold when no treasure matches', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest).mockResolvedValue({
			dinoz: [{ id: 1, placeId: 1, status: [{ statusId: DinozStatusId.SHOVEL }] }]
		} as never);
		const result = await digWithDinoz(req({ id: '1' }));
		expect(rewarder).toHaveBeenCalled();
		expect(result.rewards.length).toBeGreaterThan(0);
	});

	it('throws when the dinoz cannot dig', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest).mockResolvedValue({
			dinoz: [{ id: 1, placeId: 1, status: [] }]
		} as never);
		await expect(digWithDinoz(req({ id: '1' }))).rejects.toThrow('cannot dig');
	});

	it('throws when the player is not found', async () => {
		vi.mocked(dinozDao.getDinozFicheRequest).mockResolvedValue(null as never);
		await expect(digWithDinoz(req({ id: '1' }))).rejects.toThrow('playerNotFound');
	});
});

describe('froze/unfroze/rest', () => {
	it('frozeDinoz freezes a dinoz at the gorges', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.checkFrozenDinoz).mockResolvedValue({
			placeId: PlaceEnum.GORGES_PROFONDES, leaderId: null, followers: [], unavailableReason: null
		} as never);
		await frozeDinoz(req({ id: '1' }));
		expect(dinozDao.updateDinoz).toHaveBeenCalledWith(1, expect.objectContaining({ unavailableReason: UnavailableReason.frozen }));
	});
	it('frozeDinoz throws when not at the right place', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.checkFrozenDinoz).mockResolvedValue({ placeId: 1, leaderId: null, followers: [], unavailableReason: null } as never);
		await expect(frozeDinoz(req({ id: '1' }))).rejects.toThrow('dinozWrongLocation');
	});
	it('unfrozeDinoz starts unfreezing', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.checkFrozenDinoz).mockResolvedValue({ unavailableReason: UnavailableReason.frozen } as never);
		vi.mocked(dinozDao.getActiveDinoz).mockResolvedValue([] as never);
		await unfrozeDinoz(req({ id: '1' }));
		expect(dinozDao.updateDinoz).toHaveBeenCalledWith(1, { unavailableReason: UnavailableReason.unfreezing });
	});
	it('unfrozeDinoz throws when not frozen', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.checkFrozenDinoz).mockResolvedValue({ unavailableReason: null } as never);
		await expect(unfrozeDinoz(req({ id: '1' }))).rejects.toThrow('not frozen');
	});
	it('restDinoz starts and stops resting', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.checkRestDinoz).mockResolvedValue({ unavailableReason: null } as never);
		await restDinoz(req({ id: '1' }, { start: true }));
		expect(dinozDao.updateDinoz).toHaveBeenCalledWith(1, { unavailableReason: UnavailableReason.resting });
	});
	it('restDinoz throws when already resting', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.checkRestDinoz).mockResolvedValue({ unavailableReason: UnavailableReason.resting } as never);
		await expect(restDinoz(req({ id: '1' }, { start: true }))).rejects.toThrow('already resting');
	});
});
