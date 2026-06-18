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
	updateDinoz: vi.fn()
}));
vi.mock('../../utils/translate.js', () => ({
	default: vi.fn((key: string) => key)
}));

import { updateDinoz } from '../../dao/dinozDao.js';
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
	useRice,
	learnNextSphereSkill
} from '../../utils/dinoz.js';

const mockUpdateDinoz = vi.mocked(updateDinoz);

// A race whose up-chance is entirely on fire, so every random element draw is deterministic
// (always FIRE) regardless of the seed/salt that feeds seedrandom.
const fireOnlyRace: DinozRace = {
	raceId: raceList[1].raceId,
	isDemon: false,
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

describe('useRice', () => {
	const freshDinoz = (level: number, raceId: number) => ({
		id: 'dinoz-1',
		level,
		raceId,
		status: [] as { statusId: number }[],
		skills: [] as { skillId: number }[],
		unlockableSkills: [] as { skillId: number }[]
	});

	it('only resets name and experience for a dinoz above level 1', async () => {
		await useRice(freshDinoz(2, raceList[1].raceId));
		expect(mockUpdateDinoz).toHaveBeenCalledWith('dinoz-1', {
			name: '?',
			experience: 0,
			canChangeName: true
		});
	});

	it('rerolls the seed and next-up elements for a level 1 dinoz', async () => {
		await useRice(freshDinoz(1, raceList[1].raceId));
		const update = mockUpdateDinoz.mock.calls[0][1];
		expect(update.name).toBe('?');
		expect(update.experience).toBe(0);
		expect(typeof update.seed).toBe('string');
		expect(update.nextUpElementId).toBeGreaterThanOrEqual(1);
		expect(update.nextUpElementId).toBeLessThanOrEqual(5);
		expect(update.nextUpAltElementId).toBeGreaterThanOrEqual(1);
		expect(update.nextUpAltElementId).toBeLessThanOrEqual(5);
	});

	it('throws when a level 1 dinoz references an unknown race', async () => {
		await expect(useRice(freshDinoz(1, -1))).rejects.toThrow(ExpectedError);
		expect(mockUpdateDinoz).not.toHaveBeenCalled();
	});
});
