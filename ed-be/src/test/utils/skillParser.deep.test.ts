import { describe, it, expect } from 'vitest';
import { Stat } from '@drpg/core/models/enums/SkillStat';
import { MathOperator } from '@drpg/core/models/enums/Parser';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { applyUSkillEffect, applySkillToDinoz, computeUSkillEffects, deApplySkillFromDinoz } from '../../utils/skillParser.js';

const baseDinoz = () => ({ id: 1, maxLife: 100, nbrUpFire: 1, nbrUpAir: 1, nbrUpLightning: 1, nbrUpWater: 1, nbrUpWood: 1 });

describe('applySkillToDinoz', () => {
	it('applies stat effects across every element and max hp', () => {
		const add = (value: number) => ({ operator: MathOperator.ADD, value });
		const effects = {
			[Stat.MAX_HP]: add(10),
			[Stat.FIRE_ELEMENT]: add(2),
			[Stat.WATER_ELEMENT]: add(2),
			[Stat.WOOD_ELEMENT]: add(2),
			[Stat.AIR_ELEMENT]: add(2),
			[Stat.LIGHTNING_ELEMENT]: add(2),
			[Stat.SPEED]: add(5) // hits the default branch
		};
		const result = applySkillToDinoz(effects as never, baseDinoz());
		expect(result.maxLife).toBe(110);
		expect(result.nbrUpFire).toBe(3);
		expect(result.nbrUpAir).toBe(3);
	});
});

describe('deApplySkillFromDinoz', () => {
	it('reverses numeric stat effects', () => {
		const effects = {
			[Stat.MAX_HP]: 10,
			[Stat.FIRE_ELEMENT]: 1,
			[Stat.WATER_ELEMENT]: 1,
			[Stat.WOOD_ELEMENT]: 1,
			[Stat.AIR_ELEMENT]: 1,
			[Stat.LIGHTNING_ELEMENT]: 1,
			[Stat.SPEED]: 5
		};
		const result = deApplySkillFromDinoz(effects as never, baseDinoz());
		expect(result.maxLife).toBe(90);
		expect(result.nbrUpFire).toBe(0);
	});
});

describe('applyUSkillEffect', () => {
	it.each([
		[Skill.LEADER, 'leader'],
		[Skill.INGENIEUR, 'engineer'],
		[Skill.MAGASINIER, 'shopKeeper'],
		[Skill.CUISINIER, 'cooker'],
		[Skill.MARCHAND, 'merchant'],
		[Skill.PRETRE, 'priest'],
		[Skill.PROFESSEUR, 'teacher'],
		[Skill.MESSIE, 'messie'],
		[Skill.MATELASSEUR, 'matelasseur']
	])('sets the %s player flag', (skillId, field) => {
		const player = {
			leader: false, engineer: false, shopKeeper: false, cooker: false, merchant: false,
			priest: false, teacher: false, messie: false, matelasseur: false
		};
		applyUSkillEffect(player as never, { id: skillId } as never);
		expect((player as Record<string, boolean>)[field]).toBe(true);
	});
	it('ignores non-U skills', () => {
		const player = { leader: false } as never;
		applyUSkillEffect(player, { id: 999999 } as never);
		expect((player as { leader: boolean }).leader).toBe(false);
	});
});

describe('computeUSkillEffects', () => {
	it('recomputes player flags from a skill list', () => {
		const player = {
			leader: true, engineer: false, shopKeeper: false, cooker: false, merchant: false,
			priest: false, teacher: false, messie: false, matelasseur: false
		};
		computeUSkillEffects(player as never, [Skill.INGENIEUR] as never);
		expect(player.engineer).toBe(true);
		expect(player.leader).toBe(false);
	});
});
