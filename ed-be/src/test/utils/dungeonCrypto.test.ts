import { describe, it, expect, beforeEach } from 'vitest';
import { randomBytes } from 'crypto';
import { seal, unseal } from '../../utils/dungeonCrypto.js';

describe('dungeonCrypto', () => {
	beforeEach(() => {
		process.env.DUNGEON_KEY = randomBytes(32).toString('hex');
	});

	it('round-trips the encoded layout string', () => {
		const plain = '[[24x24x3 12R 4M 1S 2K]]someEncodedPayload_-abc123XYZ';
		const sealed = seal(plain);
		expect(unseal(sealed)).toBe(plain);
		// ciphertext must not contain the plaintext
		expect(sealed.cipher.toString('utf8')).not.toContain('24x24x3');
	});

	it('rejects tampered ciphertext (GCM auth)', () => {
		const sealed = seal('the maze layout');
		sealed.cipher[0] ^= 0xff;
		expect(() => unseal(sealed)).toThrow();
	});

	it('refuses to run without a proper key', () => {
		delete process.env.DUNGEON_KEY;
		expect(() => seal('x')).toThrow(/DUNGEON_KEY/);
	});
});
