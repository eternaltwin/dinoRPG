import { localStore } from '../store';

function format(d: string, options: object) {
	const date = new Date(d);
	const lang = localStore().getLanguage ?? 'fr';

	// Formatter pour la date (jour, mois, année)
	const dateFormatter = new Intl.DateTimeFormat(lang, options);
	return dateFormatter.format(date);
}

export function formatDateTime(d: string) {
	return format(d, {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
}

export function formatDate(d: string) {
	return format(d, {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}
