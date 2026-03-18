<template>
	<div id="topBar">
		<div class="boxRoot">
			<a v-if="playerStore.getPlayerId" class="connectLink" @click="openDinoz">
				<svg class="svgIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="AddIcon">
					<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"></path>
				</svg>
			</a>
			<Tippy
				tag="a"
				theme="normal"
				v-for="game in eternaltwinGames"
				:key="game.key"
				:href="game.link"
				target="_blank"
				rel="noopener noreferrer"
				class="eternaltwinGame"
			>
				<img :src="game.icon" :alt="$t(`topBar.gamesMenu.eternaltwinGames.${game.key}.name`)" class="logo" />
				<template #content>
					<h1>{{ $t(`topBar.gamesMenu.eternaltwinGames.${game.key}.name`) }}</h1>
					<p>{{ $t(`topBar.gamesMenu.eternaltwinGames.${game.key}.description`) }}</p>
				</template>
			</Tippy>
		</div>
		<div class="boxRoot">
			<span
				class="time"
				v-tippy="{
					content: $t('topBar.serverTime'),
					theme: 'small'
				}"
				>{{ time }}</span
			>
		</div>
		<div class="boxRoot">
			<LocaleChange />
			<hr class="separator" />
			<a v-if="!playerStore.getPlayerId" class="connectLink" @click="getRedirectUri()">
				<button class="connectBadge">{{ $t('topBar.connexion') }}</button>
			</a>
			<span v-else class="playerLogged">
				<button @click="openMenu" class="playerBadge">{{ $t('topBar.menu') }}</button>
				<span class="notifications" v-if="notification > 0">{{ notification }}</span>
			</span>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { localStore, playerStore, sessionStore, useMenuStore } from '../../store';
import { OauthService } from '../../services';
import LocaleChange from '../utils/LocaleChange.vue';
import { getEternaltwinGames } from '@drpg/core/models/games/eternaltwinGames';
import { ServerEventsService } from '../../services/ServerEventsService';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { SseData, SseDataEnum } from '@drpg/core/models/serverEvents/SseData';
import { errorHandler } from '../../utils';

export default defineComponent({
	name: 'TopBar',
	components: { LocaleChange },
	data() {
		return {
			localStore: localStore(),
			playerStore: playerStore(),
			sessionStore: sessionStore(),
			time: '' as string,
			notification: 0 as number,
			eventSource: null as EventSource | null,
			sseWatchdog: null as ReturnType<typeof setTimeout> | null,
			SSE_TIMEOUT_MS: 45_000
		};
	},
	computed: {
		eternaltwinGames() {
			return getEternaltwinGames().sort(() => Math.random() - 0.5);
		}
	},
	methods: {
		async getRedirectUri(): Promise<void> {
			const urlToRedirect = await OauthService.getRedirectUri();

			window.location.href = urlToRedirect.url;
		},
		getTime(): void {
			const day = new Date();
			this.time = day.toLocaleTimeString('fr-FR', { timeZone: 'GMT' });
		},
		openMenu() {
			useMenuStore().setTwinoMenuOpened(true);
		},
		openDinoz() {
			useMenuStore().setDinozMenuOpened(true);
		},
		async startSseForNotification(retryCount = 0): Promise<void> {
			if (!this.playerStore.getPlayerId) {
				this.eventSource?.close();
				if (this.sseWatchdog) clearTimeout(this.sseWatchdog);
				return;
			}

			const MAX_RETRIES = 5;
			const BASE_DELAY_MS = 1000;

			try {
				const ticket = await ServerEventsService.getSseTicket(SseChannel.NOTIFICATION);
				this.eventSource = await ServerEventsService.connectToSse(ticket);
				this.resetWatchdog();
				this.eventSource.onmessage = (message: MessageEvent<string>) => {
					this.resetWatchdog();
					retryCount = 0;
					const data = JSON.parse(message.data) as SseData;
					switch (data.type) {
						case SseDataEnum.LIVE_STATS:
							this.sessionStore.setLiveStats(data.live_stats);
							break;
						case SseDataEnum.NOTIFICATIONS:
							this.playerStore.addNotification(data.notifications);
							break;
						default:
							console.log(data);
							console.error('Not handled SSE data type');
							break;
					}
				};
				this.eventSource.onerror = () => {
					this.eventSource?.close();
					if (this.sseWatchdog) clearTimeout(this.sseWatchdog);
					if (retryCount >= MAX_RETRIES) {
						console.error('SSE : nombre maximum de tentatives atteint');
						return;
					}
					const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
					setTimeout(() => {
						this.startSseForNotification(retryCount + 1);
					}, delay);
				};
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		resetWatchdog(): void {
			if (this.sseWatchdog) clearTimeout(this.sseWatchdog);

			this.sseWatchdog = setTimeout(() => {
				console.warn('SSE : timeout, reconnexion...');
				this.eventSource?.close();
				this.startSseForNotification();
			}, this.SSE_TIMEOUT_MS);
		}
	},
	watch: {
		'playerStore.getNotificationsCounter': function (notification: number) {
			this.notification = notification;
		},
		'playerStore.getPlayerId': function () {
			this.startSseForNotification();
		}
	},
	mounted() {
		this.notification = this.playerStore.getNotificationsCounter;
		setInterval(() => {
			this.getTime();
		}, 1000);
		this.startSseForNotification();
	},
	unmounted() {
		if (this.sseWatchdog) clearTimeout(this.sseWatchdog);
		this.eventSource?.close();
	}
});
</script>

<style scoped lang="scss">
$orange: #fe7d00;
.notifications {
	display: flex;
	flex-flow: wrap;
	-moz-box-pack: center;
	place-content: center;
	-moz-box-align: center;
	align-items: center;
	position: absolute;
	box-sizing: border-box;
	font-family: arial, sans-serif;
	font-weight: 500;
	font-size: 0.9rem;
	min-width: 20px;
	line-height: 1;
	padding: 0px 6px;
	height: 20px;
	border-radius: 10px;
	z-index: 1;
	transition: transform 225ms cubic-bezier(0.4, 0, 0.2, 1);
	background-color: rgb(46, 125, 50);
	color: rgb(255, 255, 255);
	top: 0px;
	right: 0px;
	transform: scale(1) translate(50%, -50%);
	transform-origin: 100% 0% 0px;
}
.connectBadge {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	outline: 0px;
	border: 0px;
	margin: 0px;
	cursor: pointer;
	user-select: none;
	vertical-align: middle;
	appearance: none;
	text-decoration: none;
	font-family: arial, sans-serif;
	font-weight: 500;
	font-size: 1rem;
	line-height: 1.75;
	text-transform: uppercase;
	border-radius: 4px;
	transition:
		background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
		border-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		color 250ms cubic-bezier(0.4, 0, 0.2, 1);
	color: rgb(255, 255, 255);
	background-color: rgb(46, 125, 50);
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 3px 1px -2px,
		rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
	padding: 2px 8px;
	min-width: auto;
}
.separator {
	flex-shrink: 0;
	border-width: 0px thin 0px 0px;
	border-style: solid;
	height: auto;
	align-self: stretch;
	border-color: rgb(59, 65, 81);
	margin: 4px 0px 4px 0px;
}
.boxRoot {
	height: 32px;
	background-color: rgb(17, 19, 23);
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,
		rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;
	color: rgb(183, 185, 198);
	//padding: 4px 8px;
	display: flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: justify;
	justify-content: space-between;
	gap: 8px;
	//overflow: hidden;
	@media (max-width: 768px) {
		gap: 4px;
		flex: 0 1 auto;
		padding-right: 6px;

		// Hide games from the 5th onwards on mobile
		.eternaltwinGame:nth-child(n + 5) {
			display: none;
		}
	}

	.eternaltwinGame {
		display: flex;
		padding: 1px;
		border-radius: 4px;
		transition: background-color 0.2s ease;
		flex-shrink: 0;

		&:hover {
			background-color: $orange;
		}

		@media (max-width: 768px) {
			padding: 0;
		}
	}
	.logo {
		height: 16px;
		width: auto;

		@media (max-width: 768px) {
			height: 14px;
		}
	}
}
.connectLink {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	background-color: transparent;
	outline: 0px;
	border: 0px;
	margin: 0px;
	cursor: pointer;
	user-select: none;
	vertical-align: middle;
	appearance: none;
	text-decoration: none;
	text-align: center;
	flex: 0 0 auto;
	font-size: 1.23214rem;
	padding: 8px;
	border-radius: 50%;
	overflow: visible;
	transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
	color: rgb(254, 125, 0);
}
.svgIcon {
	user-select: none;
	width: 1em;
	height: 1em;
	display: inline-block;
	fill: currentcolor;
	flex-shrink: 0;
	transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 2rem;
}
.games {
	width: 1.6em;
	height: 1.6em;
	display: inline-block;
	flex-shrink: 0;
}
.playerLogged {
	position: relative;
	display: inline-flex;
	vertical-align: middle;
	flex-shrink: 0;
}
.playerBadge {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	background-color: transparent;
	outline: 0px;
	margin: 0px;
	cursor: pointer;
	user-select: none;
	vertical-align: middle;
	appearance: none;
	text-decoration: none;
	font-family: arial, sans-serif;
	font-weight: 500;
	font-size: 1rem;
	line-height: 1.75;
	text-transform: uppercase;
	min-width: 64px;
	padding: 3px 9px;
	border-radius: 4px;
	transition:
		background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
		border-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		color 250ms cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid rgba(2, 136, 209, 0.5);
	color: rgb(2, 136, 209);
	&:hover {
		text-decoration: none;
		background-color: rgba(2, 136, 209, 0.04);
		border: 1px solid rgb(2, 136, 209);
	}
}
.time {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	font-size: 1rem;
	color: rgb(2, 136, 209);
	&:hover {
		text-decoration: none;
		background-color: rgba(2, 136, 209, 0.04);
		border: 1px solid rgb(2, 136, 209);
	}
}
#topBar {
	position: sticky;
	top: 0px;
	left: 0px;
	right: 0px;
	z-index: 100;
	height: 32px;
	background-color: rgb(17, 19, 23);
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,
		rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;
	color: rgb(183, 185, 198);
	padding: 4px 8px;
	display: flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: justify;
	justify-content: space-between;
	gap: 8px;
	overflow: hidden;
}
</style>
