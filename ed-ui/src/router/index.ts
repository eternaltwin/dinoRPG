import { createRouter, createWebHistory } from 'vue-router';
import { localStore } from '../store/index.js';

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
					path: '/itinerantshop/:itinerantId',
					name: 'ItinerantMerchantPage',
					component: () => import('../pages/ItinerantMerchantPage.vue')
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
					component: () => import('../pages/DinozMissions.vue')
				},
				{
					path: '/market',
					name: 'MarketPage',
					component: () => import('../pages/MarketPage.vue')
				},
				{
					path: '/help',
					name: 'Help',
					component: () => import('../pages/HelpPage.vue')
				},
				{
					path: '/faq',
					name: 'FAQ',
					component: () => import('../pages/FAQPage.vue')
				},
				{
					path: '/dojo/qual/select-dinoz',
					name: 'SelectDinoz',
					component: () => import('../pages/dojo/SelectDinoz.vue')
				},
				{
					path: '/dojo',
					name: 'DojoHome',
					component: () => import('../pages/dojo/DojoHome.vue')
				},
				{
					path: '/dojo/tournament/:id?',
					name: 'DojoTournament',
					component: () => import('../pages/dojo/DojoTournament.vue')
				},
				{
					path: '/clans',
					name: 'ClansList',
					component: () => import('../pages/ClansList.vue')
				},
				{
					path: '/clan/:id',
					component: () => import('../pages/Clan.vue'),
					children: [
						{
							path: '',
							name: 'Clan',
							component: () => import('../components/clans/ClanPages.vue')
						},
						{
							path: 'page',
							component: () => import('../components/clans/ClanPages.vue'),
							children: [
								{
									path: '',
									name: 'ClanHomePage',
									component: () => import('../components/clans/ClanPage.vue')
								},
								{
									path: ':pageId',
									name: 'ClanPage',
									component: () => import('../components/clans/ClanPage.vue')
								}
							]
						},
						{
							path: 'createPage',
							name: 'ClanCreatePage',
							component: () => import('../components/clans/ClanCreatePage.vue')
						},
						{
							path: 'editPage/:pageId',
							name: 'ClanEditPage',
							component: () => import('../components/clans/ClanCreatePage.vue')
						},
						{
							path: 'members',
							name: 'ClanMembers',
							component: () => import('../components/clans/ClanMembers.vue')
						},
						{
							path: 'member/:memberId',
							name: 'ClanMemberEdit',
							component: () => import('../components/clans/ClanMemberEdit.vue')
						},
						{
							path: 'treasure',
							name: 'ClanTreasure',
							component: () => import('../components/clans/ClanTreasure.vue')
						},
						{
							path: 'war',
							name: 'ClanWar',
							component: () => import('../components/clans/ClanWar.vue')
						},
						{
							path: 'discussion',
							name: 'ClanDiscussion',
							component: () => import('../components/clans/ClanDiscussion.vue')
						},
						{
							path: 'history',
							name: 'ClanHistory',
							component: () => import('../components/clans/ClanHistory.vue')
						},
						{
							path: 'parameters',
							name: 'ClanParameters',
							component: () => import('../components/clans/ClanParameters.vue')
						}
					]
				},
				{
					path: '/createclan',
					name: 'CreateClan',
					component: () => import('../pages/Clan/CreateClan.vue')
				}
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
	] /*,
	scrollBehavior(to, from, savedPosition) {
		console.log(savedPosition)
		if (savedPosition) {
			return savedPosition;
		} else {
			return { left: 0, top: 0 };
		}
	}*/
});

router.beforeEach(to => {
	const jwt = localStore().getJwt;
	const displayAuth = jwt === undefined;
	// route to AuthPage if not logged and going to any page
	if (displayAuth && to.name !== 'AuthenticationPage') {
		return { name: 'AuthenticationPage' };
	}
	if (!displayAuth) {
		const expiry = JSON.parse(atob(jwt.split('.')[1])).exp;
		if (Math.floor(new Date().getTime() / 1000) >= expiry) {
			localStore().setJwt(undefined);
			return { name: 'AuthenticationPage' };
		}
		// route to MainPage if looged and trying to go to AuthPage (it's the case when user just login)
		if (to.name == 'AuthenticationPage') {
			return { name: 'MainPage' };
		}
	}
});

export default router;
