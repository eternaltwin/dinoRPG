export interface Unlock {
	count: number;
	points: number;
	icon?: string;
	title?: Record<Language, string>;
	description?: Record<Language, string>;
	prefix?: boolean;
	suffix?: boolean;
}

export const Languages = ['en', 'fr', 'de', 'es'] as const;

export type Language = (typeof Languages)[number];
