import { PollPublic } from '../models/news/Polls.mjs';

export type NewsGetResponse = {
	id: number;
	title: string;
	text: string;
	createdDate: string;
	hide: boolean;
	poll?: PollPublic;
	totalVote: number;
}[];
