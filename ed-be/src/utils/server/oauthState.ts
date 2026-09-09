import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

/**
 * The `state` parameter of an Eternaltwin authorization request.
 *
 * Eternaltwin echoes `state` back untouched and never inspects it, so the unpredictable part is
 * ours to add and ours to check on the way back. What we send is a payload carrying an `rfp`
 * ("request forgery protection") claim, signed with an HMAC only this server can compute.
 *
 * Only the hash of the `rfp` travels through Eternaltwin. The clear value is handed to the browser
 * that started the flow and replayed on the callback: that binding is what makes this anti-CSRF
 * rather than merely anti-forgery. A signature alone stops an attacker from minting a `state`, but
 * not from walking a victim through a callback carrying the attacker's own code.
 */
export interface OauthState {
	/** The signed token to hand to Eternaltwin. */
	readonly state: string;
	/** The clear request-forgery-protection value, for the initiating browser to keep. */
	readonly rfp: string;
}

interface StatePayload {
	/** SHA-256 of the clear `rfp`. */
	rfp_hash: string;
	/** Expiry, in seconds since the epoch. */
	exp: number;
}

/**
 * Authorization codes live 10 minutes, so a `state` outliving them buys nothing.
 */
const STATE_TTL_SECONDS = 600;

function hashRfp(rfp: string): string {
	return createHash('sha256').update(rfp).digest('hex');
}

function sign(body: string, secret: string): string {
	return createHmac('sha256', secret).update(body).digest('base64url');
}

/**
 * Build a fresh `state` and the `rfp` that opens it.
 */
export function createState(secret: string): OauthState {
	const rfp = randomUUID();
	const payload: StatePayload = {
		rfp_hash: hashRfp(rfp),
		exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS
	};
	const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
	return { state: `${body}.${sign(body, secret)}`, rfp };
}

/**
 * Read a `state` back, or throw if the signature or the expiry does not hold up.
 */
function openState(state: string, secret: string): StatePayload {
	const [body, signature, ...rest] = state.split('.');
	if (!body || !signature || rest.length > 0) {
		throw new ExpectedError('Invalid or expired OAuth state');
	}

	// Both sides are base64url of a SHA-256 HMAC, so a length mismatch alone means a forgery.
	const expected = Buffer.from(sign(body, secret));
	const given = Buffer.from(signature);
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
		throw new ExpectedError('Invalid or expired OAuth state');
	}

	let payload: StatePayload;
	try {
		payload = JSON.parse(Buffer.from(body, 'base64url').toString());
	} catch {
		throw new ExpectedError('Invalid or expired OAuth state');
	}

	if (typeof payload?.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
		throw new ExpectedError('Invalid or expired OAuth state');
	}
	return payload;
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

	// Covers a forged signature and an expired token alike: neither is worth telling apart
	// to the caller, and both mean the same thing here.
	const payload = openState(state, secret);

	if (typeof payload.rfp_hash !== 'string' || payload.rfp_hash !== hashRfp(rfp)) {
		throw new ExpectedError('Invalid or expired OAuth state');
	}
}
