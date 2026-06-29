/**
 * BitCodec — faithful port of Motion Twin's `mt.BitCodec`.
 * ------------------------------------------------------
 * MSB-first bit reader/writer that packs 6 bits per character over the base64
 * alphabet `a-z A-Z 0-9 - _`, with mt's running CRC.
 *
 * The original DinoRPG `DungeonCodec.hx` relies on `mt.BitCodec`, which was
 * never shipped in the WebGamesArchives source dump. This port follows the
 * reverse-engineered JS implementation published as the npm package
 * `mtypes-bitcodec` (MIT, © 2023), so that strings produced by the historical
 * game decode bit-for-bit:
 *
 *   - `new BitCodec(null)`        -> write mode
 *   - `new BitCodec(payload)`     -> read mode
 *   - `write(nbits, value)`       -> append `value` using `nbits` bits
 *   - `read(nbits): number`       -> consume `nbits` bits
 *   - `toString(): string`        -> flush + serialise written bits to text
 *   - `crcStr(): string`          -> 4-char integrity checksum
 *
 * Note on the CRC: `mt.BitCodec`'s checksum (`crc ^= c; crc &= 0xffffff;
 * crc *= c`) is self-consistent — strings written here read back with a
 * matching CRC. It does NOT necessarily reproduce the exact 4-char tail of
 * every historical server string (the live game used a slightly different CRC
 * variant), so importers treat a CRC mismatch on a pasted string as advisory:
 * the dungeon itself still decodes and renders correctly.
 */

export class BitCodec {
	private errorFlag = false;
	private inPos = 0;
	private nbits = 0;
	private data: string;
	private bits = 0;
	private crc = 0;

	constructor(data: string | null) {
		this.data = data ?? '';
	}

	hasError(): boolean {
		return this.errorFlag;
	}

	/** 4-character checksum of the symbols processed so far. */
	crcStr(): string {
		return (
			this.c64(this.crc & 63) +
			this.c64((this.crc >> 6) & 63) +
			this.c64((this.crc >> 12) & 63) +
			this.c64((this.crc >> 18) & 63)
		);
	}

	/** Consume `n` bits and return them as an unsigned integer (-1 on overrun). */
	read(n: number): number {
		while (this.nbits < n) {
			const c = this.d64(this.data.charAt(this.inPos++));
			if (this.inPos > this.data.length || c == null) {
				this.errorFlag = true;
				return -1;
			}
			this.crc ^= c;
			this.crc &= 0xffffff;
			this.crc *= c;
			this.nbits += 6;
			this.bits <<= 6;
			this.bits |= c;
		}
		this.nbits -= n;
		return (this.bits >> this.nbits) & ((1 << n) - 1);
	}

	/** Flush any partial group (zero-padded) and return the payload string. */
	toString(): string {
		if (this.nbits > 0) this.write(6 - this.nbits, 0);
		return this.data;
	}

	/** Append the low `n` bits of `b`, most-significant bit first. */
	write(n: number, b: number): void {
		this.nbits += n;
		this.bits <<= n;
		this.bits |= b;
		while (this.nbits >= 6) {
			this.nbits -= 6;
			const k = (this.bits >> this.nbits) & 63;
			this.crc ^= k;
			this.crc &= 0xffffff;
			this.crc *= k;
			this.data += this.c64(k);
		}
	}

	/** Decode one base64 symbol to its 6-bit value, or null if not in the alphabet. */
	private d64(code: string): number | null {
		if (code >= 'a' && code <= 'z') return code.charCodeAt(0) - 97; // 'a'
		if (code >= 'A' && code <= 'Z') return code.charCodeAt(0) - 65 + 26; // 'A'
		if (code >= '0' && code <= '9') return code.charCodeAt(0) - 48 + 52; // '0'
		if (code === '-') return 62;
		if (code === '_') return 63;
		return null;
	}

	/** Encode a 6-bit value (0..63) to its base64 symbol. */
	private c64(code: number): string {
		if (code < 0) return '?';
		if (code < 26) return String.fromCharCode(code + 97); // 'a'
		if (code < 52) return String.fromCharCode(code - 26 + 65); // 'A'
		if (code < 62) return String.fromCharCode(code - 52 + 48); // '0'
		if (code === 62) return '-';
		if (code === 63) return '_';
		return '?';
	}
}
