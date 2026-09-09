import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';

vi.mock('../../utils/gameConfig.js', () => ({
	gameConfig: vi.fn()
}));
vi.mock('../../dao/dinozStatusDao.js', () => ({ addStatusToDinoz: vi.fn(), removeStatusFromDinoz: vi.fn() }));
vi.mock('../../dao/dinozSkillDao.js', () => ({ addSkillToDinoz: vi.fn() }));
vi.mock('../../business/skillService.js', () => ({ unlockDoubleSkills: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({
	addMoney: vi.fn(),
	getPlayerRewardsRequest: vi.fn(),
	getPlayerShopOneItemDataRequest: vi.fn()
}));
vi.mock('../../dao/playerItemDao.js', () => ({
	decreaseItemQuantity: vi.fn(),
	increaseItemQuantity: vi.fn(),
	insertItem: vi.fn()
}));
vi.mock('../../dao/playerRewardsDao.js', () => ({ addRewardToPlayer: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ updateDinoz: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/questsDao.js', () => ({ upsertQuest: vi.fn() }));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../utils/server/announcer.js', () => ({ checkAnnounce: vi.fn() }));
vi.mock('../../context.js', () => ({ LOGGER: { log: vi.fn(), error: vi.fn() } }));
vi.mock('../../business/inventoryService.js', () => ({ getItemMaxQuantity: vi.fn().mockReturnValue(10) }));

import * as statusDao from '../../dao/dinozStatusDao.js';
import { addSkillToDinoz } from '../../dao/dinozSkillDao.js';
import { unlockDoubleSkills } from '../../business/skillService.js';
import * as playerDao from '../../dao/playerDao.js';
import * as playerItemDao from '../../dao/playerItemDao.js';
import { addRewardToPlayer } from '../../dao/playerRewardsDao.js';
import { updateDinoz } from '../../dao/dinozDao.js';
import { upsertQuest } from '../../dao/questsDao.js';
import { createNotification } from '../../dao/notificationDao.js';
import { createLog } from '../../dao/logDao.js';
import { LogType } from '@drpg/prisma';
import { rewarder } from '../../utils/rewarder.js';
import { gameConfig } from '../../utils/gameConfig.js';

const team = (status: number[] = [], level = 1) => [{ id: 1, level, status: status.map(statusId => ({ statusId })) }];

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue({ items: [] } as never);
	vi.mocked(playerDao.getPlayerRewardsRequest).mockResolvedValue({ rewards: [] } as never);
});

describe('rewarder', () => {
	it('throws when team is empty', async () => {
		await expect(rewarder([], [], 'p1')).rejects.toThrow('No player found');
	});

	it('adds and removes status', async () => {
		await rewarder([{ rewardType: RewardEnum.STATUS, value: 5 } as never], team(), 'p1');
		expect(statusDao.addStatusToDinoz).toHaveBeenCalledWith(1, 5);
		await rewarder([{ rewardType: RewardEnum.STATUS, value: 5, reverse: true } as never], team(), 'p1');
		expect(statusDao.removeStatusFromDinoz).toHaveBeenCalledWith(1, 5);
	});

	it('skips status already present', async () => {
		await rewarder([{ rewardType: RewardEnum.STATUS, value: 5 } as never], team([5]), 'p1');
		expect(statusDao.addStatusToDinoz).not.toHaveBeenCalled();
	});

	it('changes element', async () => {
		await rewarder([{ rewardType: RewardEnum.CHANGE_ELEMENT, value: 2 } as never], team(), 'p1');
		expect(updateDinoz).toHaveBeenCalledWith(1, { nextUpElementId: 2 });
	});

	it('sets max experience', async () => {
		vi.mocked(gameConfig).mockReturnValue({
			dinoz: {
				maxLevel: 50,
				maxQuantity: 100, // Here increase max active dinoz
				leaderMessieBonus: 3,
				initialMaxLevel: 50
			},
			shop: {
				dinozNumber: 10,
				buyableQuetzu: 6
			},
			demonShop: {
				dinozNumber: 5
			},
			general: {
				initialMoney: 1000000,
				dailyGridRewards: 10
			}
		});
		await rewarder([{ rewardType: RewardEnum.MAXEXPERIENCE } as never], team(), 'p1');
		expect(updateDinoz).toHaveBeenCalledWith(1, { experience: 100 });
	});

	it('adds a skill and unlocks double skills', async () => {
		await rewarder(
			[{ rewardType: RewardEnum.SKILL, value: skillList[Skill.COMPETENCE_DOUBLE].id } as never],
			team(),
			'p1'
		);
		expect(addSkillToDinoz).toHaveBeenCalled();
		expect(unlockDoubleSkills).toHaveBeenCalledWith(1);
	});

	it('grants experience', async () => {
		await rewarder([{ rewardType: RewardEnum.EXPERIENCE, value: 50 } as never], team(), 'p1');
		expect(updateDinoz).toHaveBeenCalledWith(1, { experience: { increment: 50 } });
	});

	it('grants gold with notification', async () => {
		await rewarder([{ rewardType: RewardEnum.GOLD, value: 100 } as never], team(), 'p1');
		expect(playerDao.addMoney).toHaveBeenCalledWith('p1', 100);
		expect(createNotification).toHaveBeenCalled();
	});

	it('grants max item to a new and an existing item', async () => {
		await rewarder([{ rewardType: RewardEnum.MAX_ITEM, value: 3 } as never], team(), 'p1');
		expect(playerItemDao.insertItem).toHaveBeenCalled();
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue({
			items: [{ itemId: 3, quantity: 2 }]
		} as never);
		await rewarder([{ rewardType: RewardEnum.MAX_ITEM, value: 3 } as never], team(), 'p1');
		expect(playerItemDao.increaseItemQuantity).toHaveBeenCalled();
	});

	it('grants an item (new, increase, and decrease)', async () => {
		await rewarder([{ rewardType: RewardEnum.ITEM, value: 3, quantity: 2 } as never], team(), 'p1');
		expect(playerItemDao.insertItem).toHaveBeenCalled();
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue({
			items: [{ itemId: 3, quantity: 1 }]
		} as never);
		await rewarder([{ rewardType: RewardEnum.ITEM, value: 3, quantity: 2 } as never], team(), 'p1');
		expect(playerItemDao.increaseItemQuantity).toHaveBeenCalled();
		await rewarder([{ rewardType: RewardEnum.ITEM, value: 3, quantity: 1, reverse: true } as never], team(), 'p1');
		expect(playerItemDao.decreaseItemQuantity).toHaveBeenCalled();
	});

	it('grants an epic reward', async () => {
		await rewarder([{ rewardType: RewardEnum.EPIC, value: 1 } as never], team(), 'p1');
		expect(addRewardToPlayer).toHaveBeenCalled();
	});

	it('skips epic reward already owned', async () => {
		vi.mocked(playerDao.getPlayerRewardsRequest).mockResolvedValue({ rewards: [{ rewardId: 1 }] } as never);
		await rewarder([{ rewardType: RewardEnum.EPIC, value: 1 } as never], team(), 'p1');
		expect(addRewardToPlayer).not.toHaveBeenCalled();
	});

	it('progresses a scenario', async () => {
		await rewarder([{ rewardType: RewardEnum.SCENARIO, value: 2, step: 1 } as never], team(), 'p1');
		expect(upsertQuest).toHaveBeenCalledWith('p1', 2, 1);
	});

	it('teleports the dinoz', async () => {
		await rewarder([{ rewardType: RewardEnum.TELEPORT, place: { placeId: 7 } } as never], team(), 'p1');
		expect(updateDinoz).toHaveBeenCalledWith(1, { placeId: 7 });
	});

	it('handles redirect and unknown rewards without error', async () => {
		await expect(rewarder([{ rewardType: RewardEnum.REDIRECT } as never], team(), 'p1')).resolves.toBeDefined();
		await expect(rewarder([{ rewardType: 'unknown' } as never], team(), 'p1')).resolves.toBeDefined();
	});
});

describe('percentage experience', () => {
	// xp needed to leave a level: floor(100 * 1.075^(level - 1))
	const maxXp = (level: number) => Math.floor(100 * Math.pow(1.075, level - 1));
	const grantedXp = () => vi.mocked(updateDinoz).mock.calls[0][1].experience as { increment: number };

	beforeEach(() => {
		vi.mocked(gameConfig).mockReturnValue({
			dinoz: { maxLevel: 50, maxQuantity: 100, leaderMessieBonus: 3, initialMaxLevel: 50 },
			shop: { dinozNumber: 10, buyableQuetzu: 6 },
			demonShop: { dinozNumber: 5 },
			general: { initialMoney: 1000000, dailyGridRewards: 10 }
		});
	});

	const grant = (percent: number, dinozLevel: number, missionLevel?: number) =>
		rewarder(
			[{ rewardType: RewardEnum.EXPERIENCE_PERCENT, value: percent } as never],
			team([], dinozLevel),
			'p1',
			false,
			missionLevel
		);

	it('grants the plain percentage when the dinoz is at the mission level', async () => {
		await grant(20, 10, 10);
		expect(grantedXp().increment).toBe(Math.round(maxXp(10) * 0.2));
	});

	it('bonuses an under-levelled dinoz by 5% per level', async () => {
		await grant(20, 10, 15);
		expect(grantedXp().increment).toBe(Math.round(maxXp(10) * 0.2 * 1.25));
	});

	it('maluses an over-levelled dinoz by 5% per level', async () => {
		await grant(20, 15, 10);
		expect(grantedXp().increment).toBe(Math.round(maxXp(15) * 0.2 * 0.75));
	});

	it('caps the bonus at 150% beyond a 10-level gap', async () => {
		await grant(20, 10, 22);
		expect(grantedXp().increment).toBe(Math.round(maxXp(10) * 0.2 * 1.5));
	});

	it('floors the malus at 10% beyond an 18-level gap', async () => {
		await grant(20, 30, 10);
		expect(grantedXp().increment).toBe(Math.round(maxXp(30) * 0.2 * 0.1));
	});

	it('applies no modifier when no mission level is given', async () => {
		await grant(20, 15);
		expect(grantedXp().increment).toBe(Math.round(maxXp(15) * 0.2));
	});

	it('grants nothing to a dinoz at max level', async () => {
		await grant(20, 50, 50);
		expect(grantedXp().increment).toBe(0);
	});

	it('logs the xp actually granted against the dinoz', async () => {
		await grant(20, 10, 10);
		expect(createLog).toHaveBeenCalledWith(LogType.XPEarned, 'p1', 1, Math.round(maxXp(10) * 0.2));
	});
});
