import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { isAlive } from '@drpg/core/utils/DinozUtils';
import type { Dinoz, Player, UnavailableReason } from '@drpg/prisma';
import translate from './server/translate.js';

type GuardedDinoz = Pick<Dinoz, 'id' | 'life' | 'unavailableReason'> & { playerId?: string | null };

type GuardOptions = {
	/** The action is open to a dead dinoz (resurrection, reincarnation). */
	allowDead?: boolean;
	/** Unavailability reasons that do not prevent this action. Any other one does. */
	allowedReasons?: UnavailableReason[];
};

/**
 * Single policy for the actions a player starts with one of their dinoz: the dinoz must be theirs, available
 * (not on sale, frozen, resting, in a dungeon, on a championship board…) and alive, unless the action says
 * otherwise. Routes that skipped one of these checks let a dinoz act from a state the interface never offers.
 * `playerId` is checked only when the caller loaded it: DAOs already scoped by player may leave it out.
 */
export function assertDinozCanAct(
	dinoz: GuardedDinoz | null | undefined,
	authed: Pick<Player, 'id' | 'lang'>,
	options: GuardOptions = {}
): asserts dinoz is GuardedDinoz {
	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: '' }));
	}
	if (dinoz.playerId !== undefined && dinoz.playerId !== authed.id) {
		throw new ExpectedError(translate('error.notYourDinoz', authed, { id: dinoz.id }));
	}
	if (dinoz.unavailableReason !== null && !(options.allowedReasons ?? []).includes(dinoz.unavailableReason)) {
		throw new ExpectedError(translate(`UnavailableReason.${dinoz.unavailableReason}`, authed));
	}
	if (!options.allowDead && !isAlive(dinoz)) {
		throw new ExpectedError(translate('dead', authed));
	}
}
