/**
 * BitCodec
 * --------
 * MSB-first bit reader/writer with a base64-ish payload and a short CRC.
 *
 * The original DinoRPG `DungeonCodec.hx` relied on Motion Twin's proprietary
 * `mt.BitCodec`, which was never open-sourced (it is not present anywhere in the
 * WebGamesArchives repository). This is a faithful re-implementation of the
 * surface that `DungeonCodec` actually uses:
 *
 *   - `new BitCodec(null)`        -> write mode
 *   - `new BitCodec(payload)`     -> read mode
 *   - `write(nbits, value)`       -> append `value` using `nbits` bits
 *   - `read(nbits): number`       -> consume `nbits` bits
 *   - `toString(): string`        -> serialise written bits to text
 *   - `crcStr(): string`          -> 4-char integrity checksum of the payload
 *
 * It is self-consistent: a value written with `write(n, v)` reads back
 * identically with `read(n)`, and `encode()` / `decode()` round-trip. It is NOT
 * binary-compatible with the historical server strings (that would require the
 * exact `mt.BitCodec` bit-packing and CRC polynomial, which are lost).
 */

// 64-symbol, URL-safe alphabet. Index 0..63 maps to a 6-bit group.
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const INV: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) INV[ALPHABET[i]] = i;

export class BitCodec {
	private readonly writeBits: number[] = [];
	private readonly readBits: number[] = [];
	private readPos = 0;
	private readonly source: string;

	constructor(data: string | null) {
		this.source = data ?? '';
		if (data != null) {
			for (const ch of data) {
				const v = INV[ch];
				if (v === undefined) continue; // ignore signature / stray characters
				for (let b = 5; b >= 0; b--) this.readBits.push((v >> b) & 1);
			}
		}
	}

	/** Append the low `nbits` bits of `value`, most-significant bit first. */
	write(nbits: number, value: number): void {
		for (let b = nbits - 1; b >= 0; b--) this.writeBits.push((value >>> b) & 1);
	}

	/** Consume `nbits` bits and return them as an unsigned integer. */
	read(nbits: number): number {
		let v = 0;
		for (let i = 0; i < nbits; i++) v = (v << 1) | (this.readBits[this.readPos++] ?? 0);
		return v >>> 0;
	}

	/** Serialise the written bit-stream into a base64-ish payload string. */
	toString(): string {
		let out = '';
		for (let i = 0; i < this.writeBits.length; i += 6) {
			let v = 0;
			for (let b = 0; b < 6; b++) v = (v << 1) | (this.writeBits[i + b] ?? 0);
			out += ALPHABET[v];
		}
		return out;
	}

	/**
	 * 4-character checksum of the payload.
	 *  - in write mode: CRC of the just-serialised payload (`toString()`).
	 *  - in read mode:  CRC of the source minus its trailing 4 CRC chars,
	 *    matching how `DungeonCodec.decode` validates `s.substr(len - 4, 4)`.
	 */
	crcStr(): string {
		const payload =
			this.writeBits.length > 0 ? this.toString() : this.source.slice(0, Math.max(0, this.source.length - 4));
		return crc24(payload);
	}
}

/** Deterministic 24-bit hash of a string, emitted as 4 alphabet chars. */
function crc24(s: string): string {
	let h = 0x5bd1e9; // arbitrary non-zero seed
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		// FNV-style avalanche, kept inside 32 bits via Math.imul.
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	h &= 0xffffff;
	return ALPHABET[(h >>> 18) & 63] + ALPHABET[(h >>> 12) & 63] + ALPHABET[(h >>> 6) & 63] + ALPHABET[h & 63];
}
