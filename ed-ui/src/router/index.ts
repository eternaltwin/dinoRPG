import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '@/pages/MainPage.vue';
import DinozPage from '@/pages/DinozPage.vue';
import DinozShopPage from '@/pages/DinozShopPage.vue';
import ItemShopPage from '@/pages/ItemShopPage.vue';
import HomePage from '@/pages/HomePage.vue';
import DinozGenerator from '@/pages/DinozGenerator.vue';
import MyAccount from '@/pages/MyAccount.vue';
import Ranking from '@/pages/Ranking.vue';
import Fight from '@/pages/Fight.vue';
import { isNil } from 'lodash';
import { sessionStore } from '@/store';
import DinozWithoutFlash from '@/components/dinoz/dinozWithoutFlash.vue';
import AdminDashBoard from '@/pages/AdminDashBoard.vue';

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'MainPage',
			component: MainPage,
			children: [
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
					path: '/dinozwithoutflash',
					name: 'DinozWithoutFlash',
					component: DinozWithoutFlash,
					props: { display: '1910731007000', flip: -1, life: 60 }
				},
				{
					path: '/admin',
					name: 'Admin',
					component: AdminDashBoard
				}
			]
		},
		{
			path: '/authentication',
			name: 'AuthenticationPage',
			component: HomePage
		},
		{
			path: '/:pathMatch(.*)',
			redirect: '/'
		}
	]
});

const displayAuth = isNil(sessionStore.getters.getJwt);
router.beforeEach(to => {
	// route to AuthPage if not logged and going to any page
	if (displayAuth && to.name !== 'AuthenticationPage') {
		return { name: 'AuthenticationPage' };
	}
	// route to MainPage if looged and trying to go to AuthPage (it's the case when user just login)
	if (!displayAuth && to.name == 'AuthenticationPage') {
		return { name: 'MainPage' };
	}
});
export default router;
