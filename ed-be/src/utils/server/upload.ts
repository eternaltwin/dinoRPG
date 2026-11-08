import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import { auth } from '../../dao/playerDao.js';
import sendError from './sendErrors.js';

/** Clan banners are 448 x 100 images. */
export const BANNER_MAX_BYTES = 1024 * 1024;
/** News illustrations, sent by administrators only. */
export const NEWS_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/** Whether the first bytes of a file are those of a PNG, JPEG, GIF or WebP image, whatever its declared type. */
export function isImageContent(buffer: Buffer): boolean {
	const starts = (bytes: number[], offset = 0) => bytes.every((byte, i) => buffer[offset + i] === byte);
	const ascii = (text: string, offset = 0) => buffer.toString('latin1', offset, offset + text.length) === text;
	return (
		starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) ||
		starts([0xff, 0xd8, 0xff]) ||
		ascii('GIF87a') ||
		ascii('GIF89a') ||
		(ascii('RIFF') && ascii('WEBP', 8))
	);
}

/**
 * Refuses an anonymous request before its body is read: a multipart body is parsed (and held in memory) by
 * multer, which must never run for a caller who is not logged in.
 */
export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await auth(req);
	} catch (err) {
		return sendError(res, err);
	}
	next();
};

/**
 * Reads the single `file` field of a multipart request into memory, within `maxBytes`, and only if it really
 * is an image (declared type and content). Place it after the authentication of the route.
 */
export function imageUpload(maxBytes: number): RequestHandler[] {
	const parse = multer({
		storage: multer.memoryStorage(),
		limits: { fileSize: maxBytes, files: 1, fields: 30, fieldSize: 1024 * 1024, parts: 40 },
		fileFilter: (_req, file, accept) => accept(null, IMAGE_MIME_TYPES.includes(file.mimetype))
	}).single('file');

	const parseOrRefuse: RequestHandler = (req, res, next) => {
		parse(req, res, err => {
			if (err instanceof multer.MulterError) {
				return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).send(err.message);
			}
			if (err) {
				return res.status(400).send('Invalid upload');
			}
			next();
		});
	};

	const checkContent: RequestHandler = (req, res, next) => {
		if (req.file && !isImageContent(req.file.buffer)) {
			return res.status(415).send('The file is not a PNG, JPEG, GIF or WebP image');
		}
		next();
	};

	return [parseOrRefuse, checkContent];
}
