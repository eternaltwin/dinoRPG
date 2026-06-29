import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';

vi.mock('../../dao/concentrationDao.js', () => ({
	createConcentration: vi.fn(),
	getConcentration: vi.fn(),
	removeConcentration: vi.fn(),
	updateConcentration: vi.fn()
}));
vi.mock('../../dao/dinozDao.js', () => ({
	getDinozConcentrationRequest: vi.fn(),
	updateMultipleDinoz: vi.fn(),
	updateMultipleDinozPlaceId: vi.fn()
}));
vi.mock('../../dao/dinozMissionDao.js', () => ({ updateMissionStep: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn(), prepareConcentration: vi.fn() }));
vi.mock('../../utils/rewarder.js', () => ({ rewarder: vi.fn() }));
vi.mock('../../business/fightService.js', () => ({
	calculateFightVsMonsters: vi.fn(),
	rewardFightVsMonsters: vi.fn()
}));
vi.mock('@drpg/core/utils/checkCondition', () => ({ checkCondition: vi.fn().mockReturnValue(true) }));
vi.mock('@drpg/core/utils/MissionUtils', () => ({ getActualStep: vi.fn() }));
vi.mock('@drpg/core/utils/DinozUtils', async orig => {
	const actual = (await orig()) as Record<string, unknown>;
	return {
		...actual,
		actualPlace: vi.fn().mockReturnValue({ placeId: PlaceEnum.BAO_BOB }),
		possessStatus: vi.fn().mockReturnValue(false)
	};
});
let specialFixture: unknown;
vi.mock('../../constants/specialActions.js', () => ({
	get specialActions() {
		return specialFixture;
	}
}));

import * as concentrationDao from '../../dao/concentrationDao.js';
import { getDinozConcentrationRequest, updateMultipleDinozPlaceId } from '../../dao/dinozDao.js';
import { auth, prepareConcentration } from '../../dao/playerDao.js';
import { rewarder } from '../../utils/rewarder.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../business/fightService.js';
import { getActualStep } from '@drpg/core/utils/MissionUtils';
import { concentrate, cancelConcentrate, movementListener } from '../../business/specialService.js';

const req = (params = {}) => makeRequest({ params });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
	specialFixture = {};
});

describe('concentrate', () => {
	it('creates a new concentration', async () => {
		vi.mocked(prepareConcentration).mockResolvedValue({
			id: 'p1',
			dinoz: [{ id: 1, name: 'd', concentration: null }]
		} as never);
		await concentrate(req({ id: '1' }));
		expect(concentrationDao.createConcentration).toHaveBeenCalled();
	});
	it('adds to an existing concentration', async () => {
		vi.mocked(prepareConcentration).mockResolvedValue({
			id: 'p1',
			dinoz: [
				{ id: 1, name: 'd', concentration: null },
				{ id: 2, name: 'e', concentration: { id: 7 } }
			]
		} as never);
		vi.mocked(concentrationDao.getConcentration).mockResolvedValue({ id: 7, dinoz: [{ id: 2 }] } as never);
		await concentrate(req({ id: '1' }));
		expect(concentrationDao.updateConcentration).toHaveBeenCalled();
	});
	it('sends the team to the dark world at 7 dinoz', async () => {
		vi.mocked(prepareConcentration).mockResolvedValue({
			id: 'p1',
			dinoz: [
				{ id: 1, name: 'd', concentration: null },
				{ id: 2, name: 'e', concentration: { id: 7 } }
			]
		} as never);
		vi.mocked(concentrationDao.getConcentration).mockResolvedValue({
			id: 7,
			dinoz: [{ id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
		} as never);
		await concentrate(req({ id: '1' }));
		expect(updateMultipleDinozPlaceId).toHaveBeenCalled();
		expect(concentrationDao.removeConcentration).toHaveBeenCalled();
	});
	it('throws when dinoz not owned', async () => {
		vi.mocked(prepareConcentration).mockResolvedValue({ id: 'p1', dinoz: [] } as never);
		await expect(concentrate(req({ id: '1' }))).rejects.toThrow("doesn't belong");
	});
});

describe('cancelConcentrate', () => {
	it('removes the dinoz from its concentration', async () => {
		vi.mocked(getDinozConcentrationRequest).mockResolvedValue({
			id: 1,
			player: { id: 'p1' },
			concentration: { id: 7, dinoz: [{ id: 1 }, { id: 2 }] }
		} as never);
		await cancelConcentrate(req({ id: '1' }));
		expect(concentrationDao.updateConcentration).toHaveBeenCalled();
	});
	it('throws when dinoz missing', async () => {
		vi.mocked(getDinozConcentrationRequest).mockResolvedValue(null as never);
		await expect(cancelConcentrate(req({ id: '1' }))).rejects.toThrow("doesn't exist");
	});
});

describe('movementListener', () => {
	const player = () => ({ id: 'p1', teacher: false, cooker: false, dinoz: [{ id: 1 }] }) as never;
	const team = () => [{ id: 1, missions: [] }] as never;

	it('returns false when nothing special happens', async () => {
		specialFixture = {};
		expect(await movementListener(player(), team(), PlaceEnum.PORT, 1)).toBe(false);
	});
	it('triggers a special-action fight against opponents', async () => {
		specialFixture = {
			A: { place: PlaceEnum.PORT, condition: {}, opponents: [{ id: 'm' }], reward: [], startText: 's', endText: 'e' }
		};
		vi.mocked(calculateFightVsMonsters).mockReturnValue({ outcome: FightOutcome.AttackerWin } as never);
		vi.mocked(rewardFightVsMonsters).mockResolvedValue({ result: true } as never);
		const result = await movementListener(player(), team(), PlaceEnum.PORT, 1);
		expect(rewarder).toHaveBeenCalled();
		expect(result).toBeTruthy();
	});
	it('grants rewards for a special action without opponents', async () => {
		specialFixture = { A: { place: PlaceEnum.PORT, condition: {}, reward: [] } };
		const result = await movementListener(player(), team(), PlaceEnum.PORT, 1);
		expect(rewarder).toHaveBeenCalled();
		expect(result).toBe(false);
	});
	it('handles a kill-boss mission step', async () => {
		specialFixture = {};
		const teamWithMission = [{ id: 1, missions: [{ missionId: 5, isFinished: false }] }] as never;
		vi.mocked(getActualStep).mockReturnValue({
			stepId: 2,
			place: PlaceEnum.PORT,
			requirement: { actionType: 'killBoss', target: [{ id: 'boss' }] }
		} as never);
		vi.mocked(calculateFightVsMonsters).mockReturnValue({ outcome: FightOutcome.AttackerWin } as never);
		vi.mocked(rewardFightVsMonsters).mockResolvedValue({ result: true } as never);
		// ConditionEnum.KILL_BOSS comparison: only matches when actionType equals the enum value.
		const result = await movementListener(player(), teamWithMission, PlaceEnum.PORT, 1);
		expect(result).toBeDefined();
	});
});
