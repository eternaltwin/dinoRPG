import { Request } from 'express';
import { auth } from '../dao/playerDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { ForumType, Thread } from '@drpg/core/models/forum/Forum';
import { GLOBAL } from '../context.js';
import urlJoin from 'url-join';

export async function getAllThreadsFromPage(req: Request) {
	const config = GLOBAL.config;
	const page = +req.params.page;
	const eternaltwin = new URL(
		urlJoin(
			config.eternaltwin.url,
			`api/v1/forum/sections/${config.eternaltwin.section}?offset=${(page - 1) * 20}&limit=20`
		)
	);

	const fofo = await fetch(eternaltwin);
	const data = (await fofo.json()) as ForumType;

	return data.threads;
}

export async function getThread(req: Request) {
	const config = GLOBAL.config;

	const threadId = req.params.threadId;
	const page = +req.params.page;
	const eternaltwin = new URL(
		urlJoin(config.eternaltwin.url, `api/v1/forum/threads/${threadId}?offset=${(page - 1) * 20}&limit=20`)
	);

	const fofo = await fetch(eternaltwin);
	const data = (await fofo.json()) as Thread;

	return { thread: data.posts, title: data.title };
}

export async function createThread(req: Request) {
	const config = GLOBAL.config;

	const title = req.body.title;
	const message = req.body.message;
	const body = JSON.stringify({ title: title, body: message });
	const eternaltwin = new URL(urlJoin(config.eternaltwin.url, `api/v1/forum/sections/${config.eternaltwin.section}`));

	try {
		const response = await fetch(eternaltwin, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: 'sid=xxxxx-ffff-aaaa-zzzz-ghghgfhfg'
			},
			body: body
		});
		if (!response.ok) {
			console.error(`Request failed with status ${response.status}`);
			throw new Error(`Failed to create thread: ${response.statusText}`);
		}
		const data = (await response.json()) as Thread;
		return { thread: data.posts, title: data.title };
	} catch (error) {
		// Gérer les erreurs et afficher un log
		console.error('Error creating thread:', error);
		throw error;
	}
}
