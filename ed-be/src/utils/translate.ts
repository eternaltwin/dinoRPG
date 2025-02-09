import { Player, Lang } from '@drpg/prisma';
import { t } from 'i18next';
import i18next from '../i18n.js';

const translate = (key: string, user?: Pick<Player, 'lang'> | null, options?: Record<string, unknown>) =>
	i18next.t(key, { lng: user?.lang, ...options });

export function translateAll(key: string, options?: Record<string, unknown>) {
	let ret = '';
	const allLang = Object.values(Lang);
	for (const lang of allLang) {
		ret += t(key, { lng: lang, ...options }) + '\n';
	}
	return ret;
}
export default translate;

export function translateTarget(key: string, lang: Lang, options?: Record<string, unknown>) {
	return i18next.t(key, { lng: lang, ...options });
}
