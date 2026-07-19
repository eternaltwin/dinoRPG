import { createRouter, createWebHistory } from 'vue-router';
import { getCookie } from '../utils/cookies.js';
import { useMenuStore } from '../store';

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
					path: '/replay/:archive',
					name: 'ReplayFight',
					component: () => import('../pages/ReplayFight.vue')
				},
				{
					path: '/dungeon/:id',
					name: 'Dungeon',
					component: () => import('../pages/DungeonPage.vue')
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
					component: () => import('../pages/NPC.vue'),
					props: route => ({
						dialog: route.query.dialog
					})
				},
				{
					path: '/dino/:id/missions/:npc',
					name: 'Missions',
					component: () => import('../pages/Missions.vue')
				},
				{
					path: '/dino/:id/skills',
					name: 'DinozSkills',
					component: () => import('../pages/SkillTrees.vue')
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
					name: 'Account',
					component: () => import('../pages/Account.vue')
				},
				{
					path: '/levelup/:id',
					name: 'Leveling',
					component: () => import('../pages/LevelUp.vue'),
					props: route => ({
						id: route.params.id,
						event: route.query.event,
						eventId: route.query.eventId
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
							path: 'player',
							name: 'RankingPlayers',
							component: () => import('../components/rankings/PlayerRanking.vue'),
							props: route => {
								const page = Number(route.query.page);
								return {
									sort: 'classic',
									page: isNaN(page) || page < 1 ? 1 : page
								};
							}
						},
						{
							path: 'average',
							name: 'RankingAverage',
							component: () => import('../components/rankings/PlayerRanking.vue'),
							props: route => {
								const page = Number(route.query.page);
								return {
									sort: 'average',
									page: isNaN(page) || page < 1 ? 1 : page
								};
							}
						},
						{
							path: 'completion',
							name: 'RankingCompletion',
							component: () => import('../components/rankings/CompletionRanking.vue'),
							props: route => {
								const page = Number(route.query.page);
								return {
									page: isNaN(page) || page < 1 ? 1 : page
								};
							}
						},
						{
							path: 'clans',
							name: 'RankingClans',
							component: () => import('../components/rankings/ClansRanking.vue'),
							props: route => {
								const page = Number(route.query.page);
								return {
									page: isNaN(page) || page < 1 ? 1 : page,
									type: route.query.type
								};
							}
						},
						{
							path: 'pantheon',
							name: 'RankingPantheon',
							component: () => import('../components/rankings/Pantheon.vue')
						},
						{
							path: 'stats',
							name: 'StatRanking',
							component: () => import('../components/rankings/StatRanking.vue')
						},
						{
							path: 'wars',
							name: 'RankingWars',
							component: () => import('../components/rankings/WarHistory.vue'),
							props: route => {
								const page = Number(route.query.page);
								return { page: isNaN(page) || page < 1 ? 1 : page };
							}
						}
					]
				},
				{
					path: '/admin',
					name: 'Admin',
					component: () => import('../pages/AdminDashBoard.vue'),
					children: [
						{
							path: 'player',
							name: 'Player',
							component: () => import('../components/admin/PlayerEdit.vue'),
							props: route => ({
								id: route.query.id
							})
						},
						{
							path: 'clan',
							name: 'AdminClan',
							component: () => import('../components/admin/ClanEdit.vue'),
							props: route => ({
								id: route.query.id
							})
						},
						{
							path: 'dinoz',
							name: 'Dinoz',
							component: () => import('../components/admin/DinozEdit.vue'),
							props: route => ({
								playerId: route.query.playerId,
								dinozId: route.query.dinozId
							})
						},
						{
							path: 'secret',
							name: 'Secret',
							component: () => import('../components/admin/SecretEdit.vue')
						},
						{
							path: 'event',
							name: 'EventCreation',
							component: () => import('../components/admin/EventCreation.vue')
						},
						{
							path: 'dungeon',
							name: 'DungeonEdit',
							component: () => import('../components/admin/DungeonEdit.vue')
						},
						{
							path: 'dungeon-builder',
							name: 'DungeonBuilder',
							component: () => import('../components/admin/DungeonBuilder.vue')
						},
						{
							path: 'logs',
							name: 'Logs',
							component: () => import('../components/admin/LogsView.vue')
						},
						{
							path: 'war-logs',
							name: 'WarLogs',
							component: () => import('../components/admin/WarLogsView.vue')
						},
						{
							path: 'gamestat',
							name: 'GameStats',
							component: () => import('../components/admin/GameStats.vue')
						},
						{
							path: 'moderation',
							name: 'Moderation',
							component: () => import('../components/admin/Moderation.vue')
						},
						{
							path: 'bans',
							name: 'Bans',
							component: () => import('../components/admin/Banned.vue')
						},
						{
							path: 'game',
							name: 'Game',
							component: () => import('../components/admin/GameControl.vue')
						},
						{
							path: 'debug',
							name: 'Debug',
							component: () => import('../components/admin/DebugFight.vue')
						},
						{
							path: 'jobs',
							name: 'Jobs',
							component: () => import('../components/admin/ScheduledJobs.vue')
						},
						{
							path: 'poll',
							name: 'Polls',
							component: () => import('../components/admin/PollEdit.vue')
						},
						{
							path: 'multi',
							name: 'Multi',
							component: () => import('../components/admin/MultiMonitoring.vue')
						},
						{
							path: 'news',
							name: 'NewsAdmin',
							component: () => import('../components/admin/NewsEdit.vue')
						}
					]
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
					path: '/skill-trees',
					name: 'SkillTrees',
					component: () => import('../pages/SkillTrees.vue')
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
					name: 'EventPage',
					component: () => import('../pages/EventPage.vue'),
					children: [
						{
							path: 'tournament',
							name: 'FBTournament',
							component: () => import('../components/events/FBTournament.vue'),
							props: route => ({
								id: route.query.id,
								group: route.query.group
							})
						}
					]
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
					component: () => import('../pages/Clan/ClansList.vue')
				},
				{
					path: '/forcebrute',
					name: 'Forcebrute',
					component: () => import('../pages/ForceBrute.vue'),
					props: route => ({
						dinozId: route.query.dinozId
					})
				},
				{
					path: '/clan/:id',
					component: () => import('../pages/Clan/Clan.vue'),
					children: [
						{
							path: '',
							name: 'Clan',
							component: () => import('../components/clans/ClanPages.vue')
						},
						{
							path: 'page',
							name: 'ClanPages',
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
							path: 'builds',
							name: 'ClanBuilds',
							component: () => import('../components/clans/ClanBuilds.vue')
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
	const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
	const isLogged = getCookie(`x-drpg-${channel}-token`) !== null;
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
	useMenuStore().setTwinoMenuOpened(false);
	useMenuStore().setDinozMenuOpened(false);
});

export default router;
