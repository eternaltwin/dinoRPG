import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { Item } from '@drpg/core/models/item/ItemList';

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
import { rewarder } from '../../utils/rewarder.js';
import { gameConfig } from '../../utils/gameConfig.js';
import { Reward } from '../../../../core/src/models/reward/RewardList.mjs';

const team = (status: number[] = []) => [{ id: 1, level: 1, status: status.map(statusId => ({ statusId })) }];

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue({ items: [] } as never);
	vi.mocked(playerDao.getPlayerRewardsRequest).mockResolvedValue({ rewards: [] } as never);
});

describe('rewarder', () => {
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

	it.for([true, false])('grants gold with notification (withDinoz: %s)', async (withDinoz: boolean) => {
		await rewarder([{ rewardType: RewardEnum.GOLD, value: 100 } as never], withDinoz ? team() : [], 'p1', [
			RewardEnum.GOLD
		]);
		expect(playerDao.addMoney).toHaveBeenCalledWith('p1', 100);
		expect(createNotification).toHaveBeenCalled();
	});

	it.for([true, false])('grants max item to a new and an existing item (withDinoz: %s)', async (withDinoz: boolean) => {
		await rewarder([{ rewardType: RewardEnum.MAX_ITEM, value: 3 } as never], withDinoz ? team() : [], 'p1');
		expect(playerItemDao.insertItem).toHaveBeenCalled();
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue({
			items: [{ itemId: 3, quantity: 2 }]
		} as never);
		await rewarder([{ rewardType: RewardEnum.MAX_ITEM, value: 3 } as never], team(), 'p1');
		expect(playerItemDao.increaseItemQuantity).toHaveBeenCalled();
	});

	it.for([true, false])('grants an item (new, increase, and decrease) (withDinoz: %s)', async (withDinoz: boolean) => {
		await rewarder([{ rewardType: RewardEnum.ITEM, value: 3, quantity: 2 } as never], withDinoz ? team() : [], 'p1', [
			RewardEnum.ITEM
		]);
		expect(playerItemDao.insertItem).toHaveBeenCalled();
		expect(createNotification).toHaveBeenCalled();
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue({
			items: [{ itemId: 3, quantity: 1 }]
		} as never);
		await rewarder([{ rewardType: RewardEnum.ITEM, value: 3, quantity: 2 } as never], team(), 'p1');
		expect(playerItemDao.increaseItemQuantity).toHaveBeenCalled();
		await rewarder([{ rewardType: RewardEnum.ITEM, value: 3, quantity: 1, reverse: true } as never], team(), 'p1');
		expect(playerItemDao.decreaseItemQuantity).toHaveBeenCalled();
	});

	it.for([true, false])('grants an epic reward (withDinoz: %s)', async (withDinoz: boolean) => {
		await rewarder([{ rewardType: RewardEnum.EPIC, value: 1 } as never], withDinoz ? team() : [], 'p1', [
			RewardEnum.EPIC
		]);
		expect(addRewardToPlayer).toHaveBeenCalled();
		expect(createNotification).toHaveBeenCalled();
	});

	it('skips epic reward already owned', async () => {
		vi.mocked(playerDao.getPlayerRewardsRequest).mockResolvedValue({ rewards: [{ rewardId: 1 }] } as never);
		await rewarder([{ rewardType: RewardEnum.EPIC, value: 1 } as never], team(), 'p1');
		expect(addRewardToPlayer).not.toHaveBeenCalled();
	});

	it.for([true, false])('progresses a scenario (withDinoz: %s)', async (withDinoz: boolean) => {
		await rewarder([{ rewardType: RewardEnum.SCENARIO, value: 2, step: 1 } as never], withDinoz ? team() : [], 'p1');
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

	it('multiple rewards in single notification', async () => {
		await rewarder(
			[
				{ rewardType: RewardEnum.EPIC, value: 1 },
				{ rewardType: RewardEnum.GOLD, value: 100 },
				{ rewardType: RewardEnum.ITEM, value: 3, quantity: 2, notify: true }
			],
			team(),
			'p1'
		);
		expect(createNotification).toHaveBeenCalledOnce();
	});

	it('no notifications', async () => {
		await rewarder(
			[
				{ rewardType: RewardEnum.EPIC, value: 1 },
				{ rewardType: RewardEnum.GOLD, value: 100 },
				{ rewardType: RewardEnum.ITEM, value: 3, quantity: 2, notify: true }
			],
			team(),
			'p1',
			[]
		);
		await rewarder([{ rewardType: RewardEnum.EPIC, value: 1 }], team(), 'p1', [RewardEnum.GOLD, RewardEnum.ITEM]);
		await rewarder([{ rewardType: RewardEnum.GOLD, value: 100 }], team(), 'p1', [RewardEnum.EPIC, RewardEnum.ITEM]);
		await rewarder([{ rewardType: RewardEnum.ITEM, value: 3, quantity: 2, notify: true }], team(), 'p1', [
			RewardEnum.GOLD,
			RewardEnum.EPIC
		]);
		expect(createNotification).not.toHaveBeenCalledOnce();
	});

	it('non displayed epics should not be notified', async () => {
		await rewarder([{ rewardType: RewardEnum.EPIC, value: Reward.TIK }], team(), 'p1');
		expect(createNotification).not.toHaveBeenCalledOnce();
	});

	it('decreasing on items should not be notified', async () => {
		await rewarder([{ rewardType: RewardEnum.ITEM, value: Item.MAGIC_STAR, quantity: 7, reverse: true }], team(), 'p1');
		expect(createNotification).not.toHaveBeenCalledOnce();
	});
});
