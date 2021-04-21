import { createRouter, createWebHistory } from 'vue-router';
import Accueil from '@/pages/Accueil.vue';
import DinozPage from '@/pages/dinoz/DinozPage.vue';
import DinozShopPage from '@/pages/shop/DinozShopPage.vue';

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Accueil',
			component: Accueil
		},
		{
			path: '/dino/:id',
			name: 'DinozPage',
			component: DinozPage
		},
		{
			path: '/shop/dinoz',
			name: 'DinozShopPage',
			component: DinozShopPage
		},
		{
			path: '/:pathMatch(.*)',
			redirect: '/'
		}
	]
});

export default router;
