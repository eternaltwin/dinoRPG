import { createRouter, createWebHistory } from 'vue-router';
import EventBus from '../events/index.js';
import { getCookie } from '../utils/cookies.js';

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
					path: '/forum',
					name: 'Forum',
					component: () => import('../pages/ForumPage.vue')
				},
				{
					path: '/forum/:threadId/:page',
					name: 'ForumThread',
					component: () => import('../components/forum/ForumThread.vue')
				},
				// Disable for now
				/*{
					path: '/forum/newThread',
					name: 'ForumNewMessage',
					component: () => import('../components/forum/ForumNewMessage.vue')
				},*/
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
					component: () => import('../pages/LevelUp.vue'),
					props: route => ({
						id: route.params.id,
						event: route.query.event // Récupéré depuis l'URL query
					})
				},
				{
					path: '/fight/:dinozId',
					name: 'Fight',
					component: () => import('../pages/Fight.vue')
				},
				{
					path: '/ranking',
					name: 'Ranking',
					component: () => import('../pages/Ranking.vue'),
					children: [
						{
							path: 'player/:pageLoaded',
							name: 'RankingPlayers',
							component: () => import('../components/rankings/PlayerRanking.vue'),
							props: { sort: 'classic' }
						},
						{
							path: 'average/:pageLoaded',
							name: 'RankingAverage',
							component: () => import('../components/rankings/PlayerRanking.vue'),
							props: { sort: 'average' }
						},
						{
							path: 'completion/:pageLoaded',
							name: 'RankingCompletion',
							component: () => import('../components/rankings/CompletionRanking.vue')
						},
						{
							path: 'clans/:pageLoaded',
							name: 'RankingClans',
							component: () => import('../components/rankings/ClansRanking.vue')
						},
						{
							path: 'pantheon',
							name: 'RankingPantheon',
							component: () => import('../components/rankings/Pantheon.vue')
						}
					]
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
					path: '/market/:tab',
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
					path: '/events',
					name: 'FBTournament',
					component: () => import('../pages/FBTournament.vue')
				},
				{
					path: '/dojo',
					name: 'DojoHome',
					component: () => import('../pages/DojoHome.vue'),
					children: [
						{
							path: '/dojo/tournament/:id/:group',
							name: 'DojoTournament',
							component: () => import('../components/dojo/DojoTournament.vue')
						},
						{
							path: '/dojo/tournament/info',
							name: 'TournamentInfo',
							component: () => import('../components/dojo/TournamentInfo.vue')
						},
						{
							path: '/dojo/friends/',
							name: 'ChallengeFriend',
							component: () => import('../components/dojo/ChallengeFriend.vue')
						},
						{
							path: '/dojo/share/:archive',
							name: 'ShareFight',
							component: () => import('../components/dojo/ShareFight.vue')
						},
						{
							path: '/dojo/history',
							name: 'DojoHistory',
							component: () => import('../components/dojo/DojoHistory.vue')
						},
						{
							path: '/dojo/challenge',
							name: 'DojoChallenge',
							component: () => import('../components/dojo/DojoChallenge.vue')
						},
						{
							path: '/dojo/ranking',
							name: 'DojoRanking',
							component: () => import('../components/dojo/DojoRanking.vue')
						},
						{
							path: '/dojo/tournaments',
							name: 'TournamentHistory',
							component: () => import('../components/dojo/TournamentHistory.vue')
						}
					]
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
	]
});

router.beforeEach(to => {
	const isLogged = getCookie('token') !== null;
	// route to AuthPage if not logged and going to any page
	if (!isLogged && to.name !== 'AuthenticationPage') {
		return { name: 'AuthenticationPage' };
	}
	if (isLogged) {
		// route to MainPage if logged and trying to go to AuthPage (it's the case when user just login)
		if (to.name == 'AuthenticationPage') {
			return { name: 'MainPage' };
		}
	}
	EventBus.emit('twinoMenu', false);
	EventBus.emit('dinozMenu', false);
});

export default router;
