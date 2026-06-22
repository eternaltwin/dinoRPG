import { describe, it, expect } from 'vitest';
import { applySkillToDinoz, applyUSkillEffect, computeUSkillEffects } from '../../utils/skillParser.js';
import { PassiveEffects, SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { Stat } from '@drpg/core/models/enums/SkillStat';
import { MathOperator } from '@drpg/core/models/enums/Parser';
import { Skill } from '@drpg/core/models/dinoz/SkillList';

const baseDinoz = () => ({
	id: 1,
	maxLife: 100,
	nbrUpFire: 0,
	nbrUpAir: 0,
	nbrUpLightning: 0,
	nbrUpWater: 0,
	nbrUpWood: 0
});

// All nine "universal" player flags start disabled.
const basePlayer = () => ({
	leader: false,
	engineer: false,
	shopKeeper: false,
	cooker: false,
	merchant: false,
	priest: false,
	teacher: false,
	messie: false,
	matelasseur: false
});

describe('applySkillToDinoz', () => {
	it('adds to the max life', () => {
		const result = applySkillToDinoz({ [Stat.MAX_HP]: { operator: MathOperator.ADD, value: 20 } }, baseDinoz());
		expect(result.maxLife).toBe(120);
	});

	it('adds element ups for the matching stats', () => {
		const effects = {
			[Stat.FIRE_ELEMENT]: { operator: MathOperator.ADD, value: 3 },
			[Stat.WATER_ELEMENT]: { operator: MathOperator.ADD, value: 1 }
		} as PassiveEffects;
		const result = applySkillToDinoz(effects, baseDinoz());
		expect(result.nbrUpFire).toBe(3);
		expect(result.nbrUpWater).toBe(1);
		expect(result.nbrUpWood).toBe(0);
	});

	it('supports multiply and equal operators', () => {
		expect(
			applySkillToDinoz({ [Stat.MAX_HP]: { operator: MathOperator.MULTIPLY, value: 2 } }, baseDinoz()).maxLife
		).toBe(200);
		expect(applySkillToDinoz({ [Stat.MAX_HP]: { operator: MathOperator.EQUAL, value: 50 } }, baseDinoz()).maxLife).toBe(
			50
		);
	});

	it('ignores stats it does not handle', () => {
		const result = applySkillToDinoz({ [Stat.INITIATIVE]: { operator: MathOperator.ADD, value: 5 } }, baseDinoz());
		expect(result.maxLife).toBe(100);
	});
});

describe('applyUSkillEffect', () => {
	it('enables the player flag tied to a universal skill', () => {
		const player = basePlayer();
		applyUSkillEffect(player, { id: Skill.LEADER } as SkillDetails);
		expect(player.leader).toBe(true);
	});

	it('leaves the player untouched for a non-universal skill', () => {
		const player = basePlayer();
		applyUSkillEffect(player, { id: Skill.GRIFFES_ENFLAMMEES } as SkillDetails);
		expect(player).toEqual(basePlayer());
	});
});

describe('computeUSkillEffects', () => {
	it('enables only the flags matching the provided skills', () => {
		const player = basePlayer();
		computeUSkillEffects(player, [Skill.LEADER, Skill.CUISINIER]);
		expect(player.leader).toBe(true);
		expect(player.cooker).toBe(true);
		expect(player.engineer).toBe(false);
		expect(player.matelasseur).toBe(false);
	});

	it('disables a flag when its skill is no longer present', () => {
		const player = { ...basePlayer(), leader: true };
		computeUSkillEffects(player, []);
		expect(player.leader).toBe(false);
	});
});
