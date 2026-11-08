import { describe, it, expect, vi } from 'vitest';
import { UnavailableReason } from '@drpg/prisma';

vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));

import { assertDinozCanAct } from '../../utils/dinozGuards.js';

const authed = { id: 'p1', lang: 'fr' } as never;
const dinoz = (o: Record<string, unknown> = {}) => ({ id: 1, life: 10, unavailableReason: null, ...o }) as never;

describe('assertDinozCanAct', () => {
	it('lets an available living dinoz of the player act', () => {
		expect(() => assertDinozCanAct(dinoz({ playerId: 'p1' }), authed)).not.toThrow();
	});

	it('refuses a missing dinoz or the dinoz of another player', () => {
		expect(() => assertDinozCanAct(null, authed)).toThrow('dinozNotFound');
		expect(() => assertDinozCanAct(dinoz({ playerId: 'p2' }), authed)).toThrow('error.notYourDinoz');
	});

	it.each(Object.values(UnavailableReason))('refuses a dinoz unavailable for %s', reason => {
		expect(() => assertDinozCanAct(dinoz({ unavailableReason: reason }), authed)).toThrow(
			`UnavailableReason.${reason}`
		);
	});

	it('accepts the reasons the action allows, and a dead dinoz only when allowed', () => {
		expect(() =>
			assertDinozCanAct(dinoz({ unavailableReason: UnavailableReason.dungeon }), authed, {
				allowedReasons: [UnavailableReason.dungeon]
			})
		).not.toThrow();
		expect(() => assertDinozCanAct(dinoz({ life: 0 }), authed)).toThrow('dead');
		expect(() => assertDinozCanAct(dinoz({ life: 0 }), authed, { allowDead: true })).not.toThrow();
	});
});
