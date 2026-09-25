import { Player, Lang } from '@drpg/prisma';
import { t } from 'i18next';
import i18next from '../../i18n.js';

const translate = (key: string, user?: Pick<Player, 'lang'> | null, options?: Record<string, unknown>) =>
	i18next.t(key, { lng: user?.lang, ...options });

const FLAG_EMOJI_BY_LANG: Record<string, string> = {
	fr: '🇫🇷',
	en: '🇬🇧',
	es: '🇪🇸',
	de: '🇩🇪'
};

function getFlagEmoji(lang: string): string {
	return FLAG_EMOJI_BY_LANG[lang] ?? '🏳️';
}

export function translateAll(key: string, options?: Record<string, unknown>) {
	const allLang = Object.values(Lang);

	const texts = allLang.map(lang => {
		const flag = getFlagEmoji(lang);
		const text = t(key, { lng: lang, ...options });
		return `${flag} ${text}`;
	});

	return texts.join('\n\n');
}

export default translate;

/**
 * Pluralizes a translation using the same rules as vue.
 *
 * @param translation The translation string to pluralize.
 * @param count The number of items to pluralize.
 * @returns The pluralized translation string.
 * @example
 * pluralize('You have no items | You have {count} item | You have {count} items', 0) // 'You have no items'
 * pluralize('You have no items | You have {count} item | You have {count} items', 1) // 'You have 1 item'
 * pluralize('You have no items | You have {count} item | You have {count} items', 2) // 'You have 2 items'
 */
export function pluralize(translation: string, count: number): string {
	const parts = translation.split('|').map(part => part.trim());
	if (parts.length === 1 || parts.length > 3) {
		return translation;
	}
	if (parts.length === 2) {
		if (count === 1) return parts[0];
		else return parts[1];
	} else {
		if (count <= 1) return parts[count];
		else return parts[2];
	}
}

export function translateTarget(key: string, lang: Lang, options?: Record<string, unknown>, count?: number) {
	const translation = i18next.t(key, { lng: lang, ...options });
	if (count !== undefined) {
		return pluralize(translation, count);
	}
	return translation;
}
