export type ForumType = {
	type: 'ForumSection';
	id: string;
	key: 'drpg_main';
	display_name: '[DinoRPG] Jurassic Park';
	ctime: string;
	locale: forumLocale;
	threads: forumThreads;
	role_grants: [];
	self: { roles: [] };
};

export interface forumThreads {
	offset: number;
	limit: number;
	count: number;
	items: Thread[];
}

export interface Thread {
	type: 'ForumThread';
	id: string;
	key: null;
	title: string;
	ctime: string;
	is_pinned: boolean;
	is_locked: boolean;
	posts: posts;
}

export interface posts {
	offset?: number;
	limit?: number;
	count: number;
	items?: forumPost[];
}

export interface forumPost {
	type: 'ForumPost';
	id: string;
	ctime: string;
	author: Author;
	revisions: Revision;
}

export interface Author {
	type: 'UserForumActor';
	user: {
		type: 'User';
		id: string;
		display_name: {
			current: {
				value: string;
			};
		};
	};
}

export interface Revision {
	count: number;
	last: forumMessage;
}

export interface forumMessage {
	type: 'ForumPostRevision';
	id: string;
	time: string;
	author: Author;
	content: {
		marktwin: string;
		html: string;
	};
	moderation: null;
	comment: null;
}

export enum forumLocale {
	FR = 'fr-FR',
	EN = 'en-EN'
}

export interface DatedThread {
	date: Date;
	threads: Thread[];
}
