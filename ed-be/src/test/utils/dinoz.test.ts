import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { skillList, Skill } from '@drpg/core/models/dinoz/SkillList';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { GatherData } from '@drpg/core/models/gather/gatherData';
import { SkillTreeType } from '@drpg/core/models/enums/SkillTreeType';
import { SkillType } from '@drpg/core/models/enums/SkillType';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

// `dinoz.ts` reaches for the global server context (which would boot config/Discord/logger),
// the dinoz DAO and the i18n translate helper. Stub all three so the pure game logic can run
// without a database or a real runtime context. The core data lists (skills, races, enums)
// are used for real since they are deterministic, dependency-free fixtures.
vi.mock('../../context.js', () => ({
	GLOBAL: { config: { salt: 'test-salt' } }
}));
vi.mock('../../dao/dinozDao.js', () => ({
	updateDinoz: vi.fn(),
	getActiveDinoz: vi.fn()
}));
vi.mock('../../utils/server/translate.js', () => ({
	default: vi.fn((key: string) => key)
}));

import {
	getTreeType,
	getLearnableSkills,
	getUnlockableSkills,
	getElementUpChance,
	getDinozUpChance,
	getRandomUpElement,
	getNumberOfGatheringTries,
	initializeDinoz,
	reincarnateDinoz,
	learnNextSphereSkill,
	sanitizeGatherBoxes,
	isAtMaxActiveDinoz
} from '../../utils/dinoz.js';
import { getActiveDinoz } from '../../dao/dinozDao.js';

// A race whose up-chance is entirely on fire, so every random element draw is deterministic
// (always FIRE) regardless of the seed/salt that feeds seedrandom.
const fireOnlyRace: DinozRace = {
	raceId: raceList[1].raceId,
	name: 'test',
	nbrFire: 2,
	nbrWood: 0,
	nbrWater: 0,
	nbrLightning: 0,
	nbrAir: 0,
	upChance: { fire: 10, wood: 0, water: 0, lightning: 0, air: 0 },
	price: 0,
	swfLetter: '00'
};

const grid = (type: GatherType, minimumClick: number) => ({ type, minimumClick }) as unknown as GatherData;

beforeEach(() => {
	vi.clearAllMocks();
});

describe('getTreeType', () => {
	it('returns ETHER when the dinoz carries the ether drop status', () => {
		expect(getTreeType([{ statusId: DinozStatusId.ETHER_DROP }])).toBe(SkillTreeType.ETHER);
	});

	it('returns VANILLA when no ether drop status is present', () => {
		expect(getTreeType([])).toBe(SkillTreeType.VANILLA);
		expect(getTreeType([{ statusId: DinozStatusId.BUOY }])).toBe(SkillTreeType.VANILLA);
	});
});

describe('getRandomUpElement', () => {
	it('always returns the only weighted element', () => {
		// fire-only up-chance -> index 1 (FIRE), seeded or not.
		expect(getRandomUpElement({ fire: 10, wood: 0, water: 0, lightning: 0, air: 0 }, 'whatever')).toBe(1);
		expect(getRandomUpElement({ fire: 10, wood: 0, water: 0, lightning: 0, air: 0 })).toBe(1);
	});

	it('is deterministic for a given seed', () => {
		const upChance = { fire: 5, wood: 4, water: 3, lightning: 2, air: 1 };
		const first = getRandomUpElement(upChance, 'fixed-seed');
		expect(getRandomUpElement(upChance, 'fixed-seed')).toBe(first);
		expect(first).toBeGreaterThanOrEqual(1);
		expect(first).toBeLessThanOrEqual(5);
	});
});

describe('getElementUpChance', () => {
	const learnable = [{ skillId: Skill.GRIFFES_ENFLAMMEES, type: SkillType.P, element: [ElementType.FIRE] }];
	const unlockable = [{ skillId: Skill.NEMO, element: [ElementType.WATER] }];

	it('returns the element value when a learnable skill carries the element', () => {
		expect(getElementUpChance(learnable, unlockable, ElementType.FIRE, 7)).toBe(7);
	});

	it('returns the element value when only an unlockable skill carries the element', () => {
		expect(getElementUpChance(learnable, unlockable, ElementType.WATER, 4)).toBe(4);
	});

	it('returns 0 when no skill carries the element', () => {
		expect(getElementUpChance(learnable, unlockable, ElementType.AIR, 9)).toBe(0);
	});
});

describe('getDinozUpChance', () => {
	it('keeps the race up-chance for covered elements and zeroes the rest', () => {
		const race = { upChance: { fire: 5, wood: 4, water: 3, lightning: 2, air: 1 } } as DinozRace;
		const learnable = [{ skillId: Skill.GRIFFES_ENFLAMMEES, type: SkillType.P, element: [ElementType.FIRE] }];
		const unlockable = [{ skillId: Skill.NEMO, element: [ElementType.WATER] }];

		expect(getDinozUpChance(learnable, unlockable, race)).toEqual({
			fire: 5,
			wood: 0,
			water: 3,
			lightning: 0,
			air: 0
		});
	});
});

describe('getNumberOfGatheringTries', () => {
	it('grants an extra try when fishing with Nemo', () => {
		expect(
			getNumberOfGatheringTries({ skills: [{ skillId: skillList[Skill.NEMO].id }] }, grid(GatherType.FISH, 2))
		).toBe(3);
	});

	it('grants no extra try when fishing without Nemo', () => {
		expect(getNumberOfGatheringTries({ skills: [] }, grid(GatherType.FISH, 2))).toBe(2);
	});

	it('stacks every seek bonus skill', () => {
		const skills = [
			{ skillId: skillList[Skill.EXPERT_EN_FOUILLE].id },
			{ skillId: skillList[Skill.PLANIFICATEUR].id },
			{ skillId: skillList[Skill.CHAMPOLLION].id },
			{ skillId: skillList[Skill.GRATTEUR].id }
		];
		expect(getNumberOfGatheringTries({ skills }, grid(GatherType.SEEK, 1))).toBe(5);
	});

	it('returns the minimum click for gather types with no skill bonus', () => {
		expect(
			getNumberOfGatheringTries({ skills: [{ skillId: skillList[Skill.NEMO].id }] }, grid(GatherType.LABO, 4))
		).toBe(4);
	});
});

describe('getLearnableSkills', () => {
	const baseDinoz = {
		raceId: raceList[1].raceId,
		status: [] as { statusId: number }[],
		skills: [] as { skillId: number }[],
		unlockableSkills: [] as { skillId: number }[]
	};

	it('includes a base vanilla skill and excludes sphere skills for a fresh dinoz', () => {
		const result = getLearnableSkills(baseDinoz);
		expect(result.some(s => s.skillId === Skill.GRIFFES_ENFLAMMEES)).toBe(true);
		expect(result.some(s => s.skillId === Skill.BRASERO)).toBe(false); // BRASERO is a sphere skill
	});

	it('restricts results to the requested element', () => {
		const result = getLearnableSkills(baseDinoz, ElementType.WOOD);
		expect(result.length).toBeGreaterThan(0);
		expect(result.every(s => s.element.includes(ElementType.WOOD))).toBe(true);
	});

	it('drops a skill the dinoz already knows', () => {
		const result = getLearnableSkills({ ...baseDinoz, skills: [{ skillId: Skill.GRIFFES_ENFLAMMEES }] });
		expect(result.some(s => s.skillId === Skill.GRIFFES_ENFLAMMEES)).toBe(false);
	});
});

describe('getUnlockableSkills', () => {
	it('throws when an unlockable skill id does not exist', () => {
		expect(() => getUnlockableSkills({ status: [], unlockableSkills: [{ skillId: -1 }] })).toThrow(ExpectedError);
	});

	it('maps a known vanilla unlockable to its id and element', () => {
		const result = getUnlockableSkills({ status: [], unlockableSkills: [{ skillId: Skill.GRIFFES_ENFLAMMEES }] });
		expect(result).toEqual([{ skillId: Skill.GRIFFES_ENFLAMMEES, element: [ElementType.FIRE] }]);
	});

	it('filters out skills from the other tree', () => {
		// GRIFFES_ENFLAMMEES is a VANILLA skill, but the ether drop status switches the tree to ETHER.
		const result = getUnlockableSkills({
			status: [{ statusId: DinozStatusId.ETHER_DROP }],
			unlockableSkills: [{ skillId: Skill.GRIFFES_ENFLAMMEES }]
		});
		expect(result).toEqual([]);
	});
});

describe('learnNextSphereSkill', () => {
	const fireSpheres = Object.values(skillList).filter(s => s.isSphereSkill && s.element.includes(ElementType.FIRE));
	const root = fireSpheres.find(s => !s.unlockedFrom || s.unlockedFrom.length === 0)!;
	const second = fireSpheres.find(s => s.unlockedFrom?.includes(root.id))!;
	const authed = { id: 'player-1' } as never;

	it('returns the root sphere skill when the dinoz knows none', () => {
		expect(learnNextSphereSkill({ skills: [] }, ElementType.FIRE, authed)).toBe(root.id);
	});

	it('returns the next sphere skill once the root is known', () => {
		expect(learnNextSphereSkill({ skills: [{ skillId: root.id }] }, ElementType.FIRE, authed)).toBe(second.id);
	});

	it('throws when every sphere skill of the element is already known', () => {
		const skills = fireSpheres.map(s => ({ skillId: s.id }));
		expect(() => learnNextSphereSkill({ skills }, ElementType.FIRE, authed)).toThrow(ExpectedError);
	});
});

describe('initializeDinoz', () => {
	it('builds a level 1 dinoz in Dinoville with full life and the given seed', () => {
		const result = initializeDinoz(fireOnlyRace, 'player-1', 'display-string', 'seed');

		expect(result).toMatchObject({
			name: '?',
			level: 1,
			placeId: PlaceEnum.DINOVILLE,
			life: 100,
			maxLife: 100,
			experience: 0,
			canChangeName: true,
			display: 'display-string',
			nbrUpFire: 2,
			seed: 'seed',
			player: { connect: { id: 'player-1' } }
		});
		// fire-only race -> both next-up elements are deterministically FIRE.
		expect(result.nextUpElementId).toBe(ElementType.FIRE);
		expect(result.nextUpAltElementId).toBe(ElementType.FIRE);
	});

	it('falls back to a generated seed when none is provided', () => {
		const result = initializeDinoz(fireOnlyRace, 'player-1', 'display-string');
		expect(typeof result.seed).toBe('string');
		expect((result.seed as string).length).toBeGreaterThan(0);
	});
});

describe('reincarnateDinoz', () => {
	it('resets progression, distributes five element ups and blanks the second display slot', () => {
		const result = reincarnateDinoz(fireOnlyRace, 'ABCDEF', 'seed');

		expect(result).toMatchObject({
			experience: 0,
			level: 1,
			life: 1,
			maxLife: 100,
			placeId: PlaceEnum.DINOVILLE,
			FBTournamentStep: 0,
			display: 'A0CDEF'
		});
		// All five random ups land on fire for a fire-only race, on top of the base count.
		expect(result.nbrUpFire).toBe(fireOnlyRace.nbrFire + 5);
		expect(result.nbrUpWood).toBe(0);
		expect(result.nbrUpWater).toBe(0);
		expect(result.nbrUpLightning).toBe(0);
		expect(result.nbrUpAir).toBe(0);
		expect(result.nextUpElementId).toBe(ElementType.FIRE);
	});
});

describe('sanitizeGatherBoxes', () => {
	it('returns the in-bounds coordinates as [row, col] tuples', () => {
		expect(
			sanitizeGatherBoxes(
				[
					[0, 0],
					[2, 4]
				],
				5
			)
		).toEqual([
			[0, 0],
			[2, 4]
		]);
	});

	it('deduplicates repeated coordinates so a cell is only opened once', () => {
		expect(
			sanitizeGatherBoxes(
				[
					[2, 2],
					[2, 2],
					[2, 2]
				],
				5
			)
		).toEqual([[2, 2]]);
	});

	it('rejects a coordinate equal to the grid size (off-by-one upper bound)', () => {
		// For a size-5 grid the valid indices are 0..4, so 5 is out of bounds.
		expect(() => sanitizeGatherBoxes([[0, 5]], 5)).toThrow(ExpectedError);
	});

	it('rejects negative coordinates', () => {
		expect(() => sanitizeGatherBoxes([[-1, 0]], 5)).toThrow(ExpectedError);
	});

	it('rejects non-numeric coordinates', () => {
		expect(() => sanitizeGatherBoxes([['1', 2] as unknown as number[]], 5)).toThrow(ExpectedError);
	});
});

const mockGetActiveDinoz = vi.mocked(getActiveDinoz);
const authed = { id: 'player-1', lang: 'en' } as const;
const regularPlayer = { id: 'player-1', leader: false, messie: false };
const leaderPlayer = { id: 'player-1', leader: true, messie: false };
const messiePlayer = { id: 'player-1', leader: false, messie: true };
const bothBonusPlayer = { id: 'player-1', leader: true, messie: true };

type ActiveDinoz = Awaited<ReturnType<typeof getActiveDinoz>>[number];
function makeDinozList(count: number, player: ActiveDinoz['player'] | null): ActiveDinoz[] {
	return Array.from({ length: count }, () => ({
		unavailableReason: null,
		// Cast to satisfy TS while still letting us test the null-guard branch.
		player: player as ActiveDinoz['player']
	}));
}

describe('isAtMaxActiveDinoz', () => {
	beforeEach(() => {
		mockGetActiveDinoz.mockReset();
	});

	it('calls getActiveDinoz with the authed player id', async () => {
		mockGetActiveDinoz.mockResolvedValue([]);
		await isAtMaxActiveDinoz(authed);
		expect(mockGetActiveDinoz).toHaveBeenCalledWith(authed.id);
	});

	it('no active dinoz, returns false', async () => {
		mockGetActiveDinoz.mockResolvedValue([]);
		expect(await isAtMaxActiveDinoz(authed)).toBe(false);
	});

	it('throws an error when player data is missing on the first dinoz', async () => {
		mockGetActiveDinoz.mockResolvedValue(makeDinozList(1, null));
		await expect(isAtMaxActiveDinoz(authed)).rejects.toBeInstanceOf(ExpectedError);
	});

	describe('regular player (no leader, no messie) — cap 18', () => {
		it('returns false when below the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(17, regularPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(false);
		});

		it('returns true when exactly at the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(18, regularPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(true);
		});

		it('returns true when above the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(19, regularPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(true);
		});
	});

	describe('leader player (+3 leader bonus) — cap 21', () => {
		it('returns false when below the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(20, leaderPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(false);
		});

		it('returns true when exactly at the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(21, leaderPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(true);
		});

		it('returns true when above the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(22, leaderPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(true);
		});
	});

	describe('messie player (+3 messie bonus) — cap 21', () => {
		it('returns false when below the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(20, messiePlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(false);
		});

		it('returns true when exactly at the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(21, messiePlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(true);
		});

		it('returns true when above at the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(22, messiePlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(true);
		});
	});

	describe('leader + messie player (both bonuses) — cap 24', () => {
		it('returns false when below the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(23, bothBonusPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(false);
		});

		it('returns true when exactly at the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(24, bothBonusPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(true);
		});

		it('returns true when above the cap', async () => {
			mockGetActiveDinoz.mockResolvedValue(makeDinozList(25, bothBonusPlayer));
			expect(await isAtMaxActiveDinoz(authed)).toBe(true);
		});
	});
});
