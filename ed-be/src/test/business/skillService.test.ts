import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { SkillType } from '@drpg/core/models/enums/SkillType';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';

vi.mock('../../config/game.config.js', () => ({ default: { dinoz: { maxQuantity: 5 } } }));
vi.mock('../../context.js', () => ({ GLOBAL: { config: {} } }));
vi.mock('../../dao/dinozDao.js', () => ({
	getAllDinozFromAccount: vi.fn(),
	getDinozForLevelUp: vi.fn(),
	getDinozSkillsLearnableAndUnlockable: vi.fn(),
	getDinozToReincarnate: vi.fn(),
	getEventDinozForLevelUp: vi.fn(),
	getFollowingDinoz: vi.fn(),
	isDinozInTournament: vi.fn(),
	tournamentDinoz: vi.fn(),
	updateDinoz: vi.fn(),
	updateEventDinoz: vi.fn()
}));
vi.mock('../../dao/dinozMissionDao.js', () => ({ removeAllMissionsFromDinoz: vi.fn() }));
vi.mock('../../dao/dinozSkillDao.js', () => ({ addSkillToDinoz: vi.fn(), removeAllSkillFromDinoz: vi.fn() }));
vi.mock('../../dao/dinozSkillUnlockableDao.js', () => ({
	addMultipleUnlockableSkills: vi.fn(),
	removeAllUnlockableSkillsFromDinoz: vi.fn(),
	removeUnlockableSkillsFromDinoz: vi.fn()
}));
vi.mock('../../dao/dinozStatusDao.js', () => ({ addStatusToDinoz: vi.fn(), removeAllStatusFromDinoz: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn(), getPlayerUSkills: vi.fn(), setPlayer: vi.fn() }));
vi.mock('../../dao/rankingDao.js', () => ({ updatePoints: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../utils/server/announcer.js', () => ({ checkAnnounce: vi.fn() }));
vi.mock('../../utils/dinoz.js', () => ({
	getDinozUpChance: vi.fn(),
	getLearnableSkills: vi.fn().mockReturnValue([]),
	getRandomUpElement: vi.fn(),
	getUnlockableSkills: vi.fn().mockReturnValue([]),
	reincarnateDinoz: vi.fn().mockReturnValue({ raceId: 1 })
}));
vi.mock('../../utils/index.js', () => ({
	applySkillToDinoz: vi.fn().mockReturnValue({ maxLife: 110 }),
	applyUSkillEffect: vi.fn(),
	computeUSkillEffects: vi.fn(),
	fromBase62: vi.fn()
}));
vi.mock('../../utils/tournamentManager.js', () => ({ default: { getCurrentTournamentState: vi.fn() } }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../business/forceBruteService.js', () => ({ checkFBCreation: vi.fn() }));
vi.mock('@drpg/core/utils/DinozUtils', async orig => {
	const actual = (await orig()) as Record<string, unknown>;
	return { ...actual, getRace: vi.fn().mockReturnValue({ raceId: 1, skillId: [11102] }) };
});

import * as dinozDao from '../../dao/dinozDao.js';
import { addMultipleUnlockableSkills } from '../../dao/dinozSkillUnlockableDao.js';
import * as playerDao from '../../dao/playerDao.js';
import { addStatusToDinoz } from '../../dao/dinozStatusDao.js';
import TournamentManager from '../../utils/tournamentManager.js';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import {
	getLearnableAndUnlockableSkills,
	learnSkill,
	unlockDoubleSkills,
	applySkillEffect,
	computeUSkillsForPlayer,
	reincarnate
} from '../../business/skillService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1' } as never);
	vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue(null as never);
	vi.mocked(dinozDao.isDinozInTournament).mockResolvedValue(false as never);
});

describe('getLearnableAndUnlockableSkills', () => {
	it('throws when dinoz not found', async () => {
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue(null as never);
		await expect(getLearnableAndUnlockableSkills(req({ id: '1', tryNumber: '1' }))).rejects.toThrow('dinozNotFound');
	});
	it('throws when dinoz cannot level up in tournament', async () => {
		vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue({ levelLimit: 5 } as never);
		vi.mocked(dinozDao.isDinozInTournament).mockResolvedValue(true as never);
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue({ level: 20, player: { id: 'p1' } } as never);
		await expect(getLearnableAndUnlockableSkills(req({ id: '1', tryNumber: '1' }))).rejects.toThrow('dinozCannotLvlUp');
	});
	it('throws when not owned', async () => {
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue({ level: 20, player: { id: 'x' } } as never);
		await expect(getLearnableAndUnlockableSkills(req({ id: '1', tryNumber: '1' }))).rejects.toThrow("doesn't belong");
	});
	it('throws when dinoz must be named', async () => {
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue({ level: 20, player: { id: 'p1' }, canChangeName: true } as never);
		await expect(getLearnableAndUnlockableSkills(req({ id: '1', tryNumber: '1' }))).rejects.toThrow('has to be named');
	});
	it('throws when race does not exist', async () => {
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue({ level: 20, player: { id: 'p1' }, canChangeName: false, raceId: 9999 } as never);
		await expect(getLearnableAndUnlockableSkills(req({ id: '1', tryNumber: '1' }))).rejects.toThrow("race");
	});
});

describe('learnSkill', () => {
	const levelUpDinoz = (overrides = {}) => ({
		id: 1,
		level: 1,
		experience: 100,
		raceId: 1,
		canChangeName: false,
		nextUpElementId: ElementType.FIRE,
		nextUpAltElementId: ElementType.WATER,
		nbrUpFire: 0,
		nbrUpWood: 0,
		nbrUpWater: 0,
		nbrUpLightning: 0,
		nbrUpAir: 0,
		display: 'AB000000000000',
		seed: 's',
		skills: [],
		items: [],
		status: [],
		unlockableSkills: [],
		player: { id: 'p1', discoveredSkills: [] },
		...overrides
	});

	it('levels up a dinoz via the unlockable (empty) path', async () => {
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue(levelUpDinoz() as never);
		const result = await learnSkill(req({ id: '1' }, { skillIdList: [], tryNumber: '1' }));
		expect(dinozDao.updateDinoz).toHaveBeenCalled();
		expect(result.newMaxExperience).toBeGreaterThanOrEqual(0);
	});

	it('throws when dinoz is not found', async () => {
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue(null as never);
		await expect(learnSkill(req({ id: '1' }, { skillIdList: [], tryNumber: '1' }))).rejects.toThrow('dinozNotFound');
	});

	it('throws when not owned', async () => {
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue(levelUpDinoz({ player: { id: 'x', discoveredSkills: [] } }) as never);
		await expect(learnSkill(req({ id: '1' }, { skillIdList: [], tryNumber: '1' }))).rejects.toThrow("doesn't belong");
	});

	it('throws when the skill cannot be learnt', async () => {
		vi.mocked(dinozDao.getDinozForLevelUp).mockResolvedValue(levelUpDinoz() as never);
		await expect(learnSkill(req({ id: '1' }, { skillIdList: [99999], tryNumber: '1' }))).rejects.toThrow("can't learn this");
	});
});

describe('unlockDoubleSkills', () => {
	it('throws when dinoz missing', async () => {
		vi.mocked(dinozDao.getDinozSkillsLearnableAndUnlockable).mockResolvedValue(null as never);
		await expect(unlockDoubleSkills(1)).rejects.toThrow("doesn't exist");
	});
	it('unlocks double skills', async () => {
		vi.mocked(dinozDao.getDinozSkillsLearnableAndUnlockable).mockResolvedValue({ id: 1, skills: [] } as never);
		await unlockDoubleSkills(1);
		expect(addMultipleUnlockableSkills).toHaveBeenCalled();
	});
});

describe('applySkillEffect', () => {
	const dinoz = { id: 1, maxLife: 100, nbrUpFire: 0, nbrUpAir: 0, nbrUpLightning: 0, nbrUpWater: 0, nbrUpWood: 0 };
	it('applies effects and updates the dinoz', async () => {
		await applySkillEffect(dinoz as never, { effects: [{}], type: SkillType.A } as never, 'p1');
		expect(dinozDao.updateDinoz).toHaveBeenCalled();
	});
	it('applies U skill effects to the player', async () => {
		vi.mocked(playerDao.getPlayerUSkills).mockResolvedValue({ id: 'p1' } as never);
		await applySkillEffect(dinoz as never, { effects: [{}], type: SkillType.U } as never, 'p1');
		expect(playerDao.setPlayer).toHaveBeenCalled();
	});
	it('uses event update path', async () => {
		await applySkillEffect(dinoz as never, { effects: [{}], type: SkillType.A } as never, 'p1', 'tournament' as never);
		expect(dinozDao.updateEventDinoz).toHaveBeenCalled();
	});
});

describe('computeUSkillsForPlayer', () => {
	it('recomputes the player U skills', async () => {
		vi.mocked(playerDao.getPlayerUSkills).mockResolvedValue({ id: 'p1' } as never);
		vi.mocked(dinozDao.getAllDinozFromAccount).mockResolvedValue([{ skills: [{ skillId: 1 }] }] as never);
		await computeUSkillsForPlayer('p1');
		expect(playerDao.setPlayer).toHaveBeenCalled();
	});
	it('throws when player missing', async () => {
		vi.mocked(playerDao.getPlayerUSkills).mockResolvedValue(null as never);
		await expect(computeUSkillsForPlayer('p1')).rejects.toThrow("doesn't exist");
	});
});

describe('reincarnate', () => {
	const reincarnatable = (overrides = {}) => ({
		id: 1, level: 45, display: 'd', seed: 's',
		skills: [{ skillId: Skill.REINCARNATION }], status: [], items: [],
		...overrides
	});
	it('reincarnates a qualifying dinoz', async () => {
		vi.mocked(dinozDao.getDinozToReincarnate).mockResolvedValue(reincarnatable() as never);
		vi.mocked(playerDao.getPlayerUSkills).mockResolvedValue({ id: 'p1' } as never);
		vi.mocked(dinozDao.getAllDinozFromAccount).mockResolvedValue([] as never);
		await reincarnate(req({ id: '1' }));
		expect(addStatusToDinoz).toHaveBeenCalledWith(1, DinozStatusId.REINCARNATION);
	});
	it('throws when dinoz not found', async () => {
		vi.mocked(dinozDao.getDinozToReincarnate).mockResolvedValue(null as never);
		await expect(reincarnate(req({ id: '1' }))).rejects.toThrow('dinozNotFound');
	});
	it('throws when not eligible', async () => {
		vi.mocked(dinozDao.getDinozToReincarnate).mockResolvedValue(reincarnatable({ level: 10 }) as never);
		await expect(reincarnate(req({ id: '1' }))).rejects.toThrow('reincarnationNotPossible');
	});
	it('throws when items are equipped', async () => {
		vi.mocked(dinozDao.getDinozToReincarnate).mockResolvedValue(reincarnatable({ items: [{ itemId: 3 }] }) as never);
		await expect(reincarnate(req({ id: '1' }))).rejects.toThrow('reincarnationWithEquippedItems');
	});
});
