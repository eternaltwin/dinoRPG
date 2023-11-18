import { createRouter, createWebHistory } from 'vue-router';
import { sessionStore } from '../store/index.js';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'MainPage',
			component: () => import('../pages/MainPage.vue'),
			children: [
				{
					path: '/',
					name: 'News',
					component: () => import('../components/common/News.vue')
				},
				{
					path: '/dino/:id',
					name: 'DinozPage',
					component: () => import('../pages/DinozPage.vue')
				},
				{
					path: '/dino/:id/:npc',
					name: 'NPC',
					component: () => import('../pages/NPC.vue')
				},
				{
					path: '/dino/:id/missions/:npc',
					name: 'Missions',
					component: () => import('../pages/Missions.vue')
				},
				{
					path: '/shop/:name',
					name: 'ItemShopPage',
					component: () => import('../pages/ItemShopPage.vue')
				},
				{
					path: '/shop/dinoz',
					name: 'DinozShopPage',
					component: () => import('../pages/DinozShopPage.vue')
				},
				{
					path: '/player/:id',
					name: 'MyAccount',
					component: () => import('../pages/MyAccount.vue')
				},
				{
					path: '/levelup/:id',
					name: 'Leveling',
					component: () => import('../pages/LevelUp.vue')
				},
				{
					path: '/fight/:dinozId',
					name: 'Fight',
					component: () => import('../pages/Fight.vue')
				},
				{
					path: '/generator',
					name: 'DinozGenerator',
					component: () => import('../pages/DinozGenerator.vue'),
					props: route => ({ chk: route.query.chk, chk2: route.query.chk2 })
				},
				{
					path: '/ranking',
					name: 'Ranking',
					component: () => import('../pages/Ranking.vue')
				},
				{
					path: '/dinozwithoutflash',
					name: 'DinozWithoutFlash',
					component: () => import('../components/dinoz/DinozWithoutFlash.vue'),
					props: { display: '3000010000000000', flip: -1, life: 100 }
				},
				{
					path: '/admin',
					name: 'Admin',
					component: () => import('../pages/AdminDashBoard.vue')
				},
				{
					path: '/ingredients',
					name: 'Ingredients',
					component: () => import('../pages/Ingredients.vue')
				},
				{
					path: '/gather/:dinozId/:type',
					name: 'Gather',
					component: () => import('../pages/GatherPage.vue')
				},
				{
					path: '/manage',
					name: 'ManageDinoz',
					component: () => import('../pages/ManageDinoz.vue')
				},
				{
					path: '/missions',
					name: 'DinozMissions',
					component: import('../pages/DinozMissions.vue')
				},
				{
					path: '/market',
					name: 'MarketPage',
					component: import('../pages/MarketPage.vue')
				}
				// Import are not available
				/*{
					path: '/import',
					name: 'ImportPage',
					component: ImportPage
				}*/
			]
		},
		{
			path: '/authentication',
			name: 'AuthenticationPage',
			component: () => import('../pages/HomePage.vue')
		},
		{
			path: '/:pathMatch(.*)',
			redirect: '/'
		}
	]
});

router.beforeEach(to => {
	const displayAuth = sessionStore().getJwt === undefined;
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
