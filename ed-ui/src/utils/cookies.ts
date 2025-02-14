// Get current domain
import EventBus from '../events/index.js';

const mainDomain = window.location.hostname.split('.').slice(-2).join('.');

export const getCookie = (name: string) => {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(';').shift();
	return null;
};

export const setCookie = (name: string, value: string, days: number) => {
	if (name === 'token') EventBus.emit('connected', true);
	document.cookie = `${name}=${value}; path=/; domain=${mainDomain}; max-age=${days * 24 * 60 * 60}`;
};

export const deleteCookie = (name: string) => {
	if (name === 'token') EventBus.emit('connected', false);
	document.cookie = `${name}=; path=/; domain=${mainDomain}; max-age=0`;
};
