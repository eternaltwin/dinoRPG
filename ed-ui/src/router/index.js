import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'Accueil',
			component: resolve => require(['@/pages/accueil/Accueil.vue'], resolve)
		}, {
			path: '/dino/:id',
			name: 'dinozFiche',
			component: resolve => require(['@/pages/dinoz/dinozFiche.vue'], resolve)
		}, {
			path: '/shop/dinoz',
			name: 'dinozShop',
			component: resolve => require(['@/pages/shop/dinozShop.vue'], resolve)
		}, {
			path: '/api',
			name: 'api',
			props: (route) => ({ code: route.query.code }),
			component: resolve => require(['@/pages/api.vue'], resolve)
		},
		{
			path: '*',
			redirect: '/'
		}
	]
});

export default router;
