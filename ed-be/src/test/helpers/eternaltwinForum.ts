/**
 * Eternaltwin forum replies in their wire format (snake_case JSON), complete enough for the
 * `@eternaltwin/core` codecs to accept them.
 */

const USER_ID = '4b858afb-bd25-4b34-88ef-72ff80cda848';
const SECTION_ID = '3e4f043e-dfb8-405c-9e13-24f3a5d7fd9b';
const THREAD_ID = 'b1f0c5a4-2d7e-4c39-9a86-0f5e6d3c2b1a';
const POST_ID = '422c47d7-da45-4aaf-98b2-edff96ee772b';
const APP_ID = '7c3e9a21-5b4d-4f86-a0e2-9d1b6c8f3a57';
const CTIME = '2026-09-16T20:48:24.264Z';

const user = { type: 'User', id: USER_ID, display_name: { current: { value: 'Alice' } } };
const author = { type: 'UserForumActor', user };

const grammarWire = {
	admin: false,
	animation: false,
	announcement: false,
	bad: true,
	big: true,
	code: true,
	collapse: true,
	depth: 4,
	emphasis: true,
	icons: [],
	links: ['https'],
	list: true,
	mod: false,
	quote: true,
	rp: true,
	sidenote: true,
	spoiler: true,
	strong: true,
	strikethrough: true,
	underline: true,
	user: true
};

const sectionSelf = { roles: [], grammar: grammarWire, unread_threads: 0, can_create_thread: true, can_manage: false };

const sectionMeta = {
	type: 'ForumSection',
	id: SECTION_ID,
	key: 'drpg_main',
	display_name: 'DinoRPG',
	ctime: CTIME,
	locale: 'fr-FR',
	parent: null,
	app: { type: 'App', id: APP_ID },
	order: 0,
	threads: { count: 0 },
	self: sectionSelf
};

export const sectionWire = {
	...sectionMeta,
	threads: { offset: 0, limit: 20, count: 0, items: [] },
	children: [],
	role_grants: []
};

export function revisionWire(id: string, marktwin?: string) {
	return {
		type: 'ForumPostRevision',
		id,
		time: CTIME,
		author,
		content: { ...(marktwin === undefined ? {} : { marktwin }), html: '<p>corps</p>' },
		moderation: null,
		comment: null
	};
}

export const threadWire = {
	type: 'ForumThread',
	id: THREAD_ID,
	key: null,
	title: 'Titre',
	ctime: CTIME,
	section: sectionMeta,
	posts: {
		offset: 0,
		limit: 10,
		count: 1,
		items: [
			{
				type: 'ForumPost',
				id: POST_ID,
				ctime: CTIME,
				author,
				revisions: { count: 1, last: revisionWire('5f2b3c4d-6e7f-4a8b-9c0d-1e2f3a4b5c6d') },
				self: { can_edit: true, can_delete: false, can_report: false }
			}
		]
	},
	is_pinned: false,
	is_locked: false,
	self: { can_post: true, can_lock: false, can_pin: false, can_move: false, can_delete: false, can_report: false }
};

/** A post whose revision listing is one page of `items` out of `count`. */
export function postWire(count: number, offset: number, items: ReturnType<typeof revisionWire>[]) {
	return {
		type: 'ForumPost',
		id: POST_ID,
		ctime: CTIME,
		author,
		revisions: { offset, limit: items.length, count, items },
		thread: {
			type: 'ForumThread',
			id: THREAD_ID,
			key: null,
			title: 'Titre',
			ctime: CTIME,
			is_pinned: false,
			is_locked: false,
			posts: { count: 1 },
			section: sectionMeta
		}
	};
}
