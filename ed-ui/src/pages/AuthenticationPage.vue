<template>
	<p v-if="!isLogged" @click="getRedirectUri()">
		{{ $t('alpha.login') }}
	</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OauthService } from '../services/index.js';
import { dinozStore, localStore, playerStore } from '../store/index.js';
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';
import { setCookie } from '../utils/cookies.js';

export default defineComponent({
	name: 'Authentication',
	data() {
		return {
			localStore: localStore(),
			playerStore: playerStore(),
			dinozStore: dinozStore(),
			isLogged: false as boolean
		};
	},
	props: {
		autoLog: {
			type: Boolean
		}
	},
	methods: {
		async authenticateToET(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				const commonData = await OauthService.authenticateUser(this.$route.query.code as string);
				// Set cookies
				const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
				setCookie(`x-drpg-${channel}-user`, commonData.id, 7);
				setCookie(`x-drpg-${channel}-token`, commonData.connexionToken, 7);
				// Set data in sessionStore
				this.playerStore.setMoney(commonData.money);
				this.dinozStore.setDinozList(commonData.dinoz);
				this.dinozStore.setDinozCount(commonData.dinozCount);
				this.playerStore.setClanId(commonData.clanId);
				this.playerStore.setPriest(commonData.priest);
				this.playerStore.setShopkeeper(commonData.shopkeeper);
				this.playerStore.setNotificationsCounter(commonData.notifications.length);
				this.playerStore.setNotifications(commonData.notifications);
				this.playerStore.setPlayerId(commonData.id);
				this.playerStore.setPlayerName(commonData.name);
				this.playerStore.setPlayerOptions(commonData.playerOptions);
				this.playerStore.setAdmin(commonData.admin);
				EventBus.emit('isLoading', false);
				this.isLogged = true;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}

			this.$router.push({ name: 'News' });
		},
		async getRedirectUri(): Promise<void> {
			const urlToRedirect = await OauthService.getRedirectUri();

			window.location.href = urlToRedirect.url;
		}
	},
	mounted(): void {
		setTimeout(() => {
			if (this.$route.query.code !== undefined) {
				this.authenticateToET();
			}
		}, 1);
	},
	watch: {
		autoLog() {
			this.getRedirectUri();
		}
	}
});
</script>
