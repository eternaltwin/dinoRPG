import { StatTracking } from '../enums/statTracking.mjs';

declare const Languages: readonly ["en", "fr", "de", "es"];
type Language = typeof Languages[number];
export interface Goal {
	id: StatTracking;
	name: Record<Language, string>;
	description?: Record<Language, string>;
	rare: number;
	hidden?: boolean;
	unlocks: Unlock[];
}
export interface Unlock {
	count: number;
	points: number;
	icon?: string;
	title?: Record<Language, string>;
	description?: Record<Language, string>;
	prefix?: boolean;
	suffix?: boolean;
}