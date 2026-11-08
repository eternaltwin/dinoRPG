import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'node:stream';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../utils/server/sendErrors.js', () => ({ default: vi.fn() }));

import { auth } from '../../dao/playerDao.js';
import sendError from '../../utils/server/sendErrors.js';
import { imageUpload, isImageContent, requireAuth } from '../../utils/server/upload.js';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);

const res = () => {
	const r = { status: vi.fn(), send: vi.fn() };
	r.status.mockReturnValue(r);
	return r;
};

/** A multipart request with one `file` part, as multer reads it from the stream. */
function multipartRequest(content: Buffer, mimeType: string) {
	const boundary = 'XBOUNDARY';
	const body = Buffer.concat([
		Buffer.from(
			`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="a"\r\nContent-Type: ${mimeType}\r\n\r\n`
		),
		content,
		Buffer.from(`\r\n--${boundary}--\r\n`)
	]);
	const req = Readable.from([body]) as Readable & Record<string, unknown>;
	req.headers = {
		'content-type': `multipart/form-data; boundary=${boundary}`,
		'content-length': String(body.length),
		'transfer-encoding': undefined
	};
	return req;
}

async function run(content: Buffer, mimeType: string, maxBytes: number) {
	const [parse, check] = imageUpload(maxBytes);
	const req = multipartRequest(content, mimeType);
	const response = res();
	const next = vi.fn();
	await new Promise<void>(resolve => {
		response.send.mockImplementation(() => resolve());
		parse(req as never, response as never, () => {
			check(req as never, response as never, () => {
				next();
				resolve();
			});
		});
	});
	return { req, response, next };
}

describe('isImageContent', () => {
	it('recognises PNG, JPEG, GIF and WebP by their first bytes', () => {
		expect(isImageContent(PNG)).toBe(true);
		expect(isImageContent(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
		expect(isImageContent(Buffer.from('GIF89a...'))).toBe(true);
		expect(isImageContent(Buffer.from('RIFF\0\0\0\0WEBPVP8 '))).toBe(true);
	});

	it('refuses anything else, whatever its declared type', () => {
		expect(isImageContent(Buffer.from('<svg onload="alert(1)">'))).toBe(false);
		expect(isImageContent(Buffer.from('<html>'))).toBe(false);
		expect(isImageContent(Buffer.alloc(0))).toBe(false);
	});
});

describe('requireAuth', () => {
	beforeEach(() => vi.clearAllMocks());

	it('stops an anonymous request before the body is read', async () => {
		vi.mocked(auth).mockRejectedValue(new Error('Missing authorization header'));
		const next = vi.fn();
		await requireAuth({} as never, {} as never, next);
		expect(next).not.toHaveBeenCalled();
		expect(sendError).toHaveBeenCalled();
	});

	it('lets a logged-in player through', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
		const next = vi.fn();
		await requireAuth({} as never, {} as never, next);
		expect(next).toHaveBeenCalled();
	});
});

describe('imageUpload', () => {
	it('accepts a real image within the limit', async () => {
		const { req, next } = await run(PNG, 'image/png', 1024);
		expect(next).toHaveBeenCalled();
		expect((req.file as { buffer: Buffer }).buffer.equals(PNG)).toBe(true);
	});

	it('refuses a file over the limit with 413', async () => {
		const { response, next } = await run(Buffer.concat([PNG, Buffer.alloc(2048)]), 'image/png', 1024);
		expect(response.status).toHaveBeenCalledWith(413);
		expect(next).not.toHaveBeenCalled();
	});

	it('refuses a file declared as an image whose content is not one', async () => {
		const { response, next } = await run(Buffer.from('<svg onload="alert(1)">'), 'image/png', 1024);
		expect(response.status).toHaveBeenCalledWith(415);
		expect(next).not.toHaveBeenCalled();
	});

	it('drops a file whose declared type is not an image', async () => {
		const { req, next } = await run(PNG, 'text/html', 1024);
		expect(next).toHaveBeenCalled();
		expect(req.file).toBeUndefined();
	});
});
