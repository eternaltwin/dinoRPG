import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../pages/MainPage.vue';
import DinozPage from '../pages/DinozPage.vue';
import DinozShopPage from '../pages/DinozShopPage.vue';
import ItemShopPage from '../pages/ItemShopPage.vue';
import HomePage from '../pages/HomePage.vue';
import DinozGenerator from '../pages/DinozGenerator.vue';
import MyAccount from '../pages/MyAccount.vue';
import Ranking from '../pages/Ranking.vue';
import Fight from '../pages/Fight.vue';
import LevelUp from '../pages/LevelUp.vue';
import { sessionStore } from '../store/index.js';
import DinozWithoutFlash from '../components/dinoz/dinozWithoutFlash.vue';
import AdminDashBoard from '../pages/AdminDashBoard.vue';
import Ingredients from '../pages/Ingredients.vue';
import News from '../components/common/News.vue';
import NPC from '../pages/NPC.vue';
import Missions from '../pages/Missions.vue';
import GatherPage from '../pages/GatherPage.vue';
import ImportPage from '../pages/ImportPage.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'MainPage',
			component: MainPage,
			children: [
				{
					path: '/',
					name: 'News',
					component: News
				},
				{
					path: '/dino/:id',
					name: 'DinozPage',
					component: DinozPage
				},
				{
					path: '/dino/:id/:npc',
					name: 'NPC',
					component: NPC
				},
				{
					path: '/dino/:id/missions/:npc',
					name: 'Missions',
					component: Missions
				},
				{
					path: '/shop/:name',
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
					path: '/levelup/:id',
					name: 'Leveling',
					component: LevelUp
				},
				{
					path: '/fight/:dinozId',
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
					props: { display: '3000010000000000', flip: -1, life: 100 }
				},
				{
					path: '/admin',
					name: 'Admin',
					component: AdminDashBoard
				},
				{
					path: '/ingredients',
					name: 'Ingredients',
					component: Ingredients
				},
				{
					path: '/gather/:dinozId/:type',
					name: 'Gather',
					component: GatherPage
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
			component: HomePage
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
