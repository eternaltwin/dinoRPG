import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import ServerState from '../../utils/server/ServerState.js';

beforeEach(() => {
	// `setReady` logs the transition; silence it so the test output stays clean.
	vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
	// Restore the module-level singleton to its default for any later suites.
	ServerState.setReady(true);
});

describe('ServerState', () => {
	it('is ready by default', () => {
		expect(ServerState.isReady()).toBe(true);
	});

	it('holds traffic when set to not ready', () => {
		ServerState.setReady(false);
		expect(ServerState.isReady()).toBe(false);
	});

	it('resumes traffic when set ready again', () => {
		ServerState.setReady(false);
		ServerState.setReady(true);
		expect(ServerState.isReady()).toBe(true);
	});
});
