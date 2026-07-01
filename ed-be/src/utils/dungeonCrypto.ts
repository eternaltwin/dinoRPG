/**
 * Dungeon layout encryption — AES-256-GCM at rest.
 *
 * The maze layout is stored in the database as ciphertext; only "pixy" (this
 * backend) holds the key, so a stolen database dump never yields a solvable map.
 * The key lives solely in `process.env.DUNGEON_KEY` (64 hex chars = 32 bytes).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface Sealed {
	cipher: Buffer;
	iv: Buffer;
	tag: Buffer;
}

function key(): Buffer {
	const hex = process.env.DUNGEON_KEY;
	if (!hex || hex.length !== 64) {
		throw new Error('DUNGEON_KEY must be set to a 32-byte (64 hex char) value');
	}
	return Buffer.from(hex, 'hex');
}

/** Encrypt a UTF-8 string (the encoded DungeonStruct) for storage. */
export function seal(plain: string): Sealed {
	const iv = randomBytes(12);
	const c = createCipheriv('aes-256-gcm', key(), iv);
	const cipher = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
	return { cipher, iv, tag: c.getAuthTag() };
}

/** Decrypt a stored blob back to the encoded DungeonStruct string. */
export function unseal({ cipher, iv, tag }: Sealed): string {
	const d = createDecipheriv('aes-256-gcm', key(), iv);
	d.setAuthTag(tag);
	return Buffer.concat([d.update(cipher), d.final()]).toString('utf8');
}
