import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';

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

const team = (status: number[] = []) => [{ id: 1, level: 1, status: status.map(statusId => ({ statusId })) }];

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
		await rewarder([{ rewardType: RewardEnum.MAXEXPERIENCE } as never], team(), 'p1');
		expect(updateDinoz).toHaveBeenCalledWith(1, { experience: 100 });
	});

	it('throws when level missing for max experience', async () => {
		await expect(rewarder([{ rewardType: RewardEnum.MAXEXPERIENCE } as never], [{ id: 1, level: 9999, status: [] }], 'p1')).rejects.toThrow(
			"doesn't exist"
		);
	});

	it('adds a skill and unlocks double skills', async () => {
		await rewarder([{ rewardType: RewardEnum.SKILL, value: skillList[Skill.COMPETENCE_DOUBLE].id } as never], team(), 'p1');
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
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue({ items: [{ itemId: 3, quantity: 2 }] } as never);
		await rewarder([{ rewardType: RewardEnum.MAX_ITEM, value: 3 } as never], team(), 'p1');
		expect(playerItemDao.increaseItemQuantity).toHaveBeenCalled();
	});

	it('grants an item (new, increase, and decrease)', async () => {
		await rewarder([{ rewardType: RewardEnum.ITEM, value: 3, quantity: 2 } as never], team(), 'p1');
		expect(playerItemDao.insertItem).toHaveBeenCalled();
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue({ items: [{ itemId: 3, quantity: 1 }] } as never);
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
