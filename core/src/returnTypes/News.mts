import { PollPublic } from '../models/news/Polls.mjs';
import { NewsType } from '@drpg/prisma';

export type NewsGetResponse = {
	id: number;
	type: NewsType;
	title: string;
	text: string;
	createdDate: string;
	hide: boolean;
	poll?: PollPublic;
	totalVote: number;
	likes: number;
	likedByMe: boolean;
};
