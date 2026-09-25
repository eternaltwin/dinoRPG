/**
 * Wire types for the Eternaltwin forum API (`{origin}/api/v1/forum`).
 *
 * These mirror the server's own structures. Fields the server computes about the current actor
 * (`self`, `grammar`) are optional on purpose: scope enforcement and the `self` blocks are recent
 * additions, and an older instance omits them entirely. Treat a missing `self` as "no permission
 * known" and hide the write affordance, rather than guessing a value the server never sent.
 */

export enum forumLocale {
	FR = 'fr-FR',
	EN = 'en-EN'
}

export enum ForumRole {
	Administrator = 'Administrator',
	Moderator = 'Moderator'
}

/**
 * The Marktwin an actor may write in a section, as the server will parse it.
 *
 * Served rather than assumed: markup an editor offers but the server strips is lost silently on
 * save. `mod` and `admin` blocks are never granted to a token, whatever the scope.
 */
export interface ForumGrammar {
	admin: boolean;
	depth: number | null;
	emphasis: boolean;
	icons: string[];
	links: string[];
	mod: boolean;
	quote: boolean;
	spoiler: boolean;
	strong: boolean;
	strikethrough: boolean;
	/** The fields below are recent additions; an older instance omits them. */
	animation?: boolean;
	announcement?: boolean;
	bad?: boolean;
	big?: boolean;
	code?: boolean;
	collapse?: boolean;
	list?: boolean;
	rp?: boolean;
	sidenote?: boolean;
	underline?: boolean;
	user?: boolean;
}

export interface ForumSectionSelf {
	roles: ForumRole[];
	/** Absent on instances that predate served grammars. */
	grammar?: ForumGrammar;
	/** Threads of this section holding posts the actor has not been shown. */
	unread_threads?: number;
	/** Whether the actor may open a thread here. Absent on instances that predate it. */
	can_create_thread?: boolean;
}

/**
 * Per-thread permissions, computed by the server with the same predicates its write paths apply.
 * Show a control if and only if the matching flag is true; never re-derive these.
 *
 * A thread read on its own carries the `can_*` flags; a thread listed in a section only carries
 * `is_unread`.
 */
export interface ForumThreadSelf {
	can_post?: boolean;
	can_lock?: boolean;
	can_pin?: boolean;
	can_move?: boolean;
	can_delete?: boolean;
	can_report?: boolean;
	is_unread?: boolean;
}

/**
 * Per-post permissions. `can_edit` already accounts for the rules an author is bound by — among
 * them that they may only rewrite the last post of a thread, and never one a moderator has
 * rewritten.
 */
export interface ForumPostSelf {
	can_edit: boolean;
	can_delete: boolean;
	can_report: boolean;
}

/** How a section names its parent. */
export interface ForumSectionRef {
	id: string;
	key: string | null;
	display_name: string;
}

/**
 * A section as it appears inside another resource — a child in a listing, the section of a thread:
 * its threads are only counted, not listed.
 */
export interface ForumSectionSummary {
	type: 'ForumSection';
	id: string;
	key: string | null;
	display_name: string;
	ctime: string;
	locale: forumLocale | null;
	/** `null` for a top-level section. Absent on instances that predate nested sections. */
	parent?: ForumSectionRef | null;
	threads: { count: number };
	self?: ForumSectionSelf;
}

/** A section read on its own: one page of its threads, and its sub-sections. */
export type ForumType = Omit<ForumSectionSummary, 'threads'> & {
	threads: forumThreads;
	/** Absent on instances that predate nested sections. */
	children?: ForumSectionSummary[];
	role_grants?: RoleGrant[];
};

export interface RoleGrant {
	role: ForumRole;
	user: ShortUser;
	start_time: string;
	granted_by: ShortUser;
}

export interface ShortUser {
	type: 'User';
	id: string;
	display_name: {
		current: {
			value: string;
		};
	};
}

export interface ForumSectionListing {
	offset: number;
	limit: number;
	count: number;
	items: ForumSectionSummary[];
}

export interface forumThreads {
	offset: number;
	limit: number;
	count: number;
	items: Thread[];
}

export interface Thread {
	type: 'ForumThread';
	id: string;
	key: string | null;
	title: string;
	ctime: string;
	is_pinned: boolean;
	is_locked: boolean;
	posts: posts;
	section?: ForumSectionSummary;
	/** Listing only: the most recent post, without its content. */
	last_post?: ForumLastPost;
	has_admin_announcement?: boolean;
	self?: ForumThreadSelf;
}

export interface ForumLastPost {
	type: 'ForumPost';
	id: string;
	ctime: string;
	author: Author;
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
	self?: ForumPostSelf;
}

export interface Author {
	type: 'UserForumActor';
	user: ShortUser;
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
	} | null;
	moderation: unknown | null;
	comment: string | null;
}

/**
 * The Marktwin source of a post, as returned by `GET /posts/:post_ref/source`.
 *
 * Ordinary reads do not carry it, and an edit needs the `id` of the revision it replaces:
 * that is how the server detects two concurrent edits.
 */
export interface ForumPostSource {
	type: 'ForumPost';
	id: string;
	revisions: Revision;
	self?: ForumPostSelf;
}

/**
 * Page sizes the Eternaltwin site itself uses, from `GET /api/v1/config`.
 */
export interface EternaltwinForumConfig {
	forum: {
		threads_per_page: number;
		posts_per_page: number;
	};
}

export interface DatedThread {
	date: Date;
	threads: Thread[];
}
