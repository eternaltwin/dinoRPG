import axios from 'axios';
import { ToastPluginApi } from 'vue-toast-notification';
import { errorHandler } from './errorHandler.js';

/**
 * Refusals the forum backend reports in clear text.
 *
 * `sendError` puts the message of an `ExpectedError` straight into the body, and `errorHandler`
 * shows that body as-is — so without this the player would be handed `eternaltwinForbidden` in a
 * toast. The codes come from `eternaltwinForumClient.ts`, which is the single place they are
 * produced.
 */
export enum ForumErrorCode {
	/** The stored token no longer authenticates and there is no refresh flow: authorize again. */
	Reauthorize = 'eternaltwinReauthorize',
	/**
	 * 403. Three causes are indistinguishable from here — a token without `forum:write`, a missing
	 * role, a muted player — and none of them is repaired by trying again.
	 */
	Forbidden = 'eternaltwinForbidden',
	NotFound = 'eternaltwinNotFound',
	/** The resource moved under us; re-read it before writing again. */
	Conflict = 'eternaltwinConflict',
	/** No revision id to edit against, so there is nothing safe to replace. */
	RevisionUnavailable = 'eternaltwinPostRevisionUnavailable'
}

const MESSAGES: Record<ForumErrorCode, string> = {
	[ForumErrorCode.Reauthorize]: 'forum.error.reauthorize',
	[ForumErrorCode.Forbidden]: 'forum.error.forbidden',
	[ForumErrorCode.NotFound]: 'forum.error.notFound',
	[ForumErrorCode.Conflict]: 'forum.error.conflict',
	[ForumErrorCode.RevisionUnavailable]: 'forum.error.revisionUnavailable'
};

/**
 * The code a forum failure carries, or `null` when it is not one of ours.
 *
 * Matched on a prefix: the client appends the server's own body after the code, and that detail is
 * for the logs, not for the player.
 */
export function forumErrorCode(err: unknown): ForumErrorCode | null {
	if (!axios.isAxiosError(err) || typeof err.response?.data !== 'string') {
		return null;
	}
	const body: string = err.response.data;

	return Object.values(ForumErrorCode).find(code => body.startsWith(code)) ?? null;
}

/**
 * Show a forum failure, translated when we know it, and report the rest the usual way.
 *
 * Returns the code so a caller that wants to react to one — offering to sign in again, say — can
 * do so without parsing the error a second time.
 */
export function handleForumError(
	err: unknown,
	t: (key: string) => string,
	toast: ToastPluginApi
): ForumErrorCode | null {
	const code = forumErrorCode(err);

	if (code === null) {
		errorHandler.handle(err, toast);
		return null;
	}

	toast.open({ message: t(MESSAGES[code]), type: 'error' });
	return code;
}
