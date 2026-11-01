/**
 * The Marktwin a parser accepts.
 *
 * Structurally identical to `Grammar` from `@eternaltwin/marktwin` (and to Eternaltwin's
 * `ForumGrammar`), so either can be handed to the renderer; core does not depend on the package.
 */
export interface MarktwinGrammar {
	admin: boolean;
	animation: boolean;
	announcement: boolean;
	bad: boolean;
	big: boolean;
	code: boolean;
	collapse: boolean;
	/** Maximum block nesting depth; `null` for no limit. */
	depth: null | number;
	emphasis: boolean;
	icons: string[];
	links: string[];
	list: boolean;
	mod: boolean;
	quote: boolean;
	rp: boolean;
	sidenote: boolean;
	spoiler: boolean;
	strong: boolean;
	strikethrough: boolean;
	underline: boolean;
	user: boolean;
}

/**
 * What a player may write in a clan discussion or a private message.
 *
 * The backend renders with this very grammar, so the editor offers exactly what is kept.
 * `[mod]`, `[admin]`, `[animation]` and `[announcement]` say who is speaking and stay off;
 * `@{userId}` and icons need a renderer of their own that the game does not have yet.
 */
export const PLAYER_MARKTWIN_GRAMMAR: MarktwinGrammar = {
	admin: false,
	animation: false,
	announcement: false,
	bad: true,
	big: true,
	code: true,
	collapse: true,
	depth: 5,
	emphasis: true,
	icons: [],
	links: ['http', 'https'],
	list: true,
	mod: false,
	quote: true,
	rp: true,
	sidenote: true,
	spoiler: true,
	strong: true,
	strikethrough: true,
	underline: true,
	user: false
};

/** Longest Marktwin source accepted for a clan message or a private message. */
export const PLAYER_MESSAGE_MAX_LENGTH = 5000;
