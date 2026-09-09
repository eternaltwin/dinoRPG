import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

/**
 * The `state` parameter of an Eternaltwin authorization request.
 *
 * Eternaltwin echoes `state` back untouched and never inspects it, so the unpredictable part is
 * ours to add and ours to check on the way back. The convention is a signed JWT carrying an `rfp`
 * ("request forgery protection") claim.
 *
 * Only the hash of the `rfp` travels through Eternaltwin. The clear value is handed to the browser
 * that started the flow and replayed on the callback: that binding is what makes this anti-CSRF
 * rather than merely anti-forgery. A signature alone stops an attacker from minting a `state`, but
 * not from walking a victim through a callback carrying the attacker's own code.
 */
export interface OauthState {
	/** The signed JWT to hand to Eternaltwin. */
	readonly state: string;
	/** The clear request-forgery-protection value, for the initiating browser to keep. */
	readonly rfp: string;
}

interface StatePayload {
	/** SHA-256 of the clear `rfp`. */
	rfp_hash: string;
}

/**
 * Authorization codes live 10 minutes, so a `state` outliving them buys nothing.
 */
const STATE_TTL_SECONDS = 600;

function hashRfp(rfp: string): string {
	return createHash('sha256').update(rfp).digest('hex');
}

/**
 * Build a fresh `state` and the `rfp` that opens it.
 */
export function createState(secret: string): OauthState {
	const rfp = randomUUID();
	const payload: StatePayload = { rfp_hash: hashRfp(rfp) };
	const state = jwt.sign(payload, secret, { expiresIn: STATE_TTL_SECONDS });
	return { state, rfp };
}

/**
 * Check a `state` coming back from Eternaltwin against the `rfp` held by the browser.
 *
 * @throws ExpectedError if the signature, the expiry or the `rfp` does not match.
 */
export function verifyState(state: unknown, rfp: unknown, secret: string): void {
	if (typeof state !== 'string' || state.length === 0) {
		throw new ExpectedError('Missing OAuth state');
	}
	if (typeof rfp !== 'string' || rfp.length === 0) {
		throw new ExpectedError('Missing OAuth request forgery protection');
	}

	let payload: StatePayload;
	try {
		payload = jwt.verify(state, secret) as StatePayload;
	} catch {
		// Covers a forged signature and an expired token alike: neither is worth telling apart
		// to the caller, and both mean the same thing here.
		throw new ExpectedError('Invalid or expired OAuth state');
	}

	if (typeof payload.rfp_hash !== 'string' || payload.rfp_hash !== hashRfp(rfp)) {
		throw new ExpectedError('Invalid or expired OAuth state');
	}
}
