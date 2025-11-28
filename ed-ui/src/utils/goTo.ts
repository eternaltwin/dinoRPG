import { RouteLocationNamedRaw, Router } from 'vue-router';

export const CINEMA_LINK = 'https://gerardufoin.github.io/DinoRPG-Legacy-Paradino/';

export const goTo = (router: Router, page: string, props?: RouteLocationNamedRaw) => {
	router.push({ name: page, ...props });
};
