import { Request } from 'express';
import { DISCORD } from '../context.js';
import {
	createNews,
	getBatchOfNews,
	getNewsIllus,
	updateAnyNews,
	getNewsDate,
	hasPlayerLikedNews,
	likeNews,
	unlikeNews,
	getAllNewsFromDB,
	deleteAnyNews,
	getNewsDetails
} from '../dao/newsDao.js';
import { auth, noStrictAuth } from '../dao/playerDao.js';
import { CreatePollOption } from '@drpg/core/models/news/Polls';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { prisma } from '../prisma.js';
import dayjs from 'dayjs';
import { scheduleJob } from 'node-schedule';
import { LOGGER } from '../context.js';
import { returnCode } from '@drpg/core/models/enums/returnCode';

/**
 * @summary Create a news
 * @param req
 * @param req.params.title {string} Title of the new
 * @param req.file.buffer {blob} Image of the new
 * @param req.body.frenchTitle {string} French title
 * @param req.body.englishTitle {string} English title
 * @param req.body.spanishTitle {string} Spanish title
 * @param req.body.germanTitle {string} German title
 * @param req.body.frenchText {string} French text
 * @param req.body.englishText {string} English text
 * @param req.body.spanishText {string} Spanish text
 * @param req.body.germanText {string} German text
 *  */
export async function postNews(req: Request) {
	const news = await createNews({
		title: req.params.title,
		image: req.file?.buffer,
		frenchTitle: req.body.frenchTitle,
		englishTitle: req.body.englishTitle,
		spanishTitle: req.body.spanishTitle,
		germanTitle: req.body.germanTitle,
		frenchText: req.body.frenchText,
		englishText: req.body.englishText,
		spanishText: req.body.spanishText,
		germanText: req.body.germanText
	});
	DISCORD.sendNewsNotification(req.body.frenchTitle, req.body.frenchText, req.file?.buffer);
	return news;
}

export async function createPoll(req: Request) {
	const news = await createNews({
		title: req.params.title,
		image: req.file?.buffer,
		frenchTitle: req.body.frenchTitle,
		englishTitle: req.body.englishTitle,
		spanishTitle: req.body.spanishTitle,
		germanTitle: req.body.germanTitle,
		frenchText: req.body.frenchText,
		englishText: req.body.englishText,
		spanishText: req.body.spanishText,
		germanText: req.body.germanText
	});
	DISCORD.sendNewsNotification(req.body.frenchTitle, req.body.frenchText, req.file?.buffer);

	const options: CreatePollOption[] = JSON.parse(req.body.options);

	if (!options || options.length < 2) {
		throw new ExpectedError('No enough options');
	}

	const pollOptions = options.map((option, index) => ({
		optionText: option.optionText.trim(),
		orderIndex: option.orderIndex ?? index
	}));

	if (pollOptions.some(option => !option.optionText)) {
		throw new ExpectedError('Some options are empty');
	}

	let endDate = req.body.endDate;
	if (!endDate || !dayjs(endDate).isValid()) {
		endDate = dayjs().add(1, 'week').startOf('day').toDate();
	} else {
		endDate = dayjs(endDate).startOf('day').toDate();
	}
	const poll = await prisma.$transaction(async tx => {
		const createdPoll = await tx.poll.create({
			data: {
				newsId: news.id,
				endDate
			}
		});

		const createdOptions = await Promise.all(
			pollOptions.map(option =>
				tx.pollOption.create({
					data: {
						pollId: createdPoll.id,
						optionText: option.optionText,
						orderIndex: option.orderIndex
					}
				})
			)
		);

		return {
			...createdPoll,
			options: createdOptions
		};
	});

	scheduleJob(`poll_${poll.id}`, poll.endDate, () => expirePoll(poll.id));
}

export async function expirePoll(pollId: number) {
	await prisma.poll.update({
		where: {
			id: pollId
		},
		data: {
			isActive: false
		}
	});
}

export async function schedulePollExpiration() {
	const ongoingPolls = await prisma.poll.findMany({
		where: {
			isActive: true
		},
		select: {
			endDate: true,
			id: true
		}
	});

	const outDatedPolls = ongoingPolls.filter(poll => poll.endDate <= new Date());
	const promises = outDatedPolls.map(poll => expirePoll(poll.id));

	await Promise.all(promises);

	const remainingPolls = ongoingPolls.filter(poll => poll.endDate > new Date());
	remainingPolls.forEach(poll => {
		LOGGER.log(`Scheduling poll ${poll.id} expiration at ${poll.endDate}`);

		scheduleJob(`poll_${poll.id}`, poll.endDate, () => expirePoll(poll.id));
	});
}

/**
 * @summary Retrieve a batch of new
 * @param req
 * @param req.params.page {string} Number of the page
 * @param req.query.playerId {string} Player ID to check if the news is liked by the player
 * @param res
 */
export async function getNews(req: Request) {
	const authed = await noStrictAuth(req, false);
	const news = await getBatchOfNews(+req.params.page, authed);

	return news.map(b => {
		return {
			...b,
			hide: true,
			totalVote: b.poll?.votes.length ?? 0
		};
	});
}

/**
 * @summary Retrieve all news
 */
export async function getAllNews() {
	const news = await getAllNewsFromDB();

	return news;
}

/**
 * @summary Retrieve all info of a news
 * @param req.params.id {number} ID of the news
 */
export async function getNewsAdmin(req: Request) {
	const newsId = +req.params.id;
	const news = await getNewsDetails(newsId);

	return news;
}

/**
 * @summary Update a selected news
 * @param req
 * @param req.params.id {number} ID of the news
 * @param req.file.buffer {blob} Image of the news to update
 * @param req.body.frenchTitle {string} French title to update
 * @param req.body.englishTitle {string} English title to update
 * @param req.body.spanishTitle {string} Spanish title to update
 * @param req.body.germanTitle {string} German title to update
 * @param req.body.frenchText {string} French text to update
 * @param req.body.englishText {string} English text to update
 * @param req.body.spanishText {string} Spanish text to update
 * @param req.body.germanText {string} German text to update
 */
export async function updateNews(req: Request) {
	const newsId = +req.params.id;
	await updateAnyNews(newsId, {
		image: req.file?.buffer,
		frenchTitle: req.body.frenchTitle,
		englishTitle: req.body.englishTitle,
		spanishTitle: req.body.spanishTitle,
		germanTitle: req.body.germanTitle,
		frenchText: req.body.frenchText,
		englishText: req.body.englishText,
		spanishText: req.body.spanishText,
		germanText: req.body.germanText
	});
}

/**
 * @summary Update a selected news
 * @param req
 * @param req.params.title {string} Title of the new
 * @param req.file.buffer {blob} Image of the new to update
 * @param req.body.frenchTitle {string} French title to update
 * @param req.body.englishTitle {string} English title to update
 * @param req.body.spanishTitle {string} Spanish title to update
 * @param req.body.germanTitle {string} German title to update
 * @param req.body.frenchText {string} French text to update
 * @param req.body.englishText {string} English text to update
 * @param req.body.spanishText {string} Spanish text to update
 * @param req.body.germanText {string} German text to update
 */
export async function deleteNews(req: Request) {
	const newsId = +req.params.id;
	await deleteAnyNews(newsId);
}

export async function getNewsIllustration(req: Request<{ id: string }>) {
	const news = await getNewsIllus(+req.params.id);

	return news.image;
}

export async function getNewsCreatedDate(req: Request<{ id: string }>) {
	const news = await getNewsDate(+req.params.id);

	return news.createdDate;
}

export async function selectPollOption(req: Request) {
	const authed = await auth(req);
	const pollId = +req.params.id;
	const optionId = +req.params.option;

	const poll = await prisma.poll.findFirst({
		where: {
			id: pollId
		},
		select: {
			isActive: true,
			options: {
				select: {
					id: true
				}
			},
			votes: {
				select: {
					id: true,
					pollId: true,
					pollOptionId: true,
					playerId: true
				}
			}
		}
	});

	if (!poll) {
		throw new ExpectedError(`Selected poll didn't exist`);
	}
	if (!poll.isActive) {
		throw new ExpectedError(`Selected poll is over`);
	}
	if (!poll.options.some(o => o.id === optionId)) {
		throw new ExpectedError(`Selected option is not a possibility`);
	}
	const playerVote = poll.votes.find(v => v.playerId);
	if (playerVote && playerVote.pollOptionId === optionId) {
		return;
	}

	await prisma.pollVote.upsert({
		where: {
			unique_player_vote_per_poll: {
				pollId: pollId,
				playerId: authed.id
			}
		},
		update: {
			pollOptionId: optionId,
			votedAt: new Date()
		},
		create: {
			pollId: pollId,
			playerId: authed.id,
			pollOptionId: optionId
		}
	});
	return { code: returnCode.OK };
}

export async function toggleLikeNews(req: Request) {
	const authed = await auth(req);
	const hasLiked = await hasPlayerLikedNews(+req.params.id, authed.id);

	return hasLiked ? unlikeNews(+req.params.id, authed.id) : likeNews(+req.params.id, authed.id);
}
