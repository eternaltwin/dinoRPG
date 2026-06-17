import type { Request } from 'express';

/**
 * Builds a minimal Express `Request` for business-layer tests. Only the fields a handler
 * reads (`params`, `body`, `query`, `headers`) are populated; `auth()` is expected to be
 * mocked in the test, so no real authorization header is required.
 */
export function makeRequest(overrides: Partial<Request> = {}): Request {
	return {
		params: {},
		body: {},
		query: {},
		headers: {},
		...overrides
	} as unknown as Request;
}
