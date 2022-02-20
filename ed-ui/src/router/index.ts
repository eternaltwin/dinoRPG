import { createRouter, createWebHistory } from 'vue-router';
import Accueil from '@/pages/Accueil.vue';
import DinozPage from '@/pages/DinozPage.vue';
import DinozShopPage from '@/pages/DinozShopPage.vue';
import ItemShopPage from '@/pages/shop/ItemShopPage.vue';
import AuthenticationPage from '@/pages/AuthenticationPage.vue';
import DinozGenerator from '@/pages/DinozGenerator.vue';
import MyAccount from '@/pages/MyAccount.vue';
import Ranking from '@/pages/Ranking.vue';
import Fight from '@/pages/Fight.vue';

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
			path: '/shop',
			name: 'ItemShopPage',
			component: ItemShopPage
		},
		{
			path: '/shop/dinoz',
			name: 'DinozShopPage',
			component: DinozShopPage
		},
		{
			path: '/authentication',
			name: 'AuthenticationPage',
			component: AuthenticationPage
		},
		{
			path: '/player/:id',
			name: 'MyAccount',
			component: MyAccount
		},
		{
			path: '/fight',
			name: 'Fight',
			component: Fight
		},
		{
			path: '/generator',
			name: 'DinozGenerator',
			component: DinozGenerator,
			props: route => ({ chk: route.query.chk, chk2: route.query.chk2 })
		},
		{
			path: '/ranking',
			name: 'Ranking',
			component: Ranking
		},
		{
			path: '/:pathMatch(.*)',
			redirect: '/'
		}
	]
});

export default router;
