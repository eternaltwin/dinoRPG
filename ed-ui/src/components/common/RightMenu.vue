<template>
	<ul class="rightMenu">
		<li class="time-wrapper">
			<div class="time">{{ time }}</div>
		</li>
		<!--		<li>-->
		<!--			<a @click="goToPage('News')">{{ $t('rightMenu.news') }}</a>-->
		<!--		</li>-->
		<!--		<li>-->
		<!--			<a @click="goToPage('')">{{ $t('rightMenu.gazette') }}</a>-->
		<!--		</li>-->
		<li>
			<a @click="goToPage('Ranking')">{{ $t('rightMenu.ranking') }}</a>
		</li>
		<li>
			<a @click="goToPage('ClansList')">{{ $t('rightMenu.clans') }}</a>
		</li>
		<li>
			<a @click="goToPage('Ingredients')">{{ $t('rightMenu.ingredients') }}</a>
		</li>
		<li v-if="getPlayerId">
			<a @click="goToMyAccount('MyAccount', getPlayerId)">{{ $t('rightMenu.account') }}</a>
		</li>
		<li>
			<a href="https://eternal-twin.net/forum/sections/drpg_main" target="_blank">{{ $t('rightMenu.forum') }}</a>
		</li>
		<li>
			<a @click="goToPage('FAQ')">{{ $t('rightMenu.faq') }}</a>
		</li>
		<li>
			<p>{{ dinozCount }} Dinoz</p>
		</li>
		<li>
			<LocaleChange />
		</li>
		<li v-if="isAdmin">
			<a @click="goToPage('Admin')">Admin</a>
		</li>
		<li>
			<a @click="logOff()">{{ $t('rightMenu.logout') }}</a>
		</li>
		<li @click="goToPage('Help')" class="guide">
			{{ $t('rightMenu.guide') }}
		</li>
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LocaleChange from '../../components/utils/LocaleChange.vue';
import { dinozStore, playerStore, localStore } from '../../store/index.js';
import EventBus from '../../events/index.js';

export default defineComponent({
	name: 'RightMenu',
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			localStore: localStore(),
			time: '' as string
		};
	},
	components: {
		LocaleChange
	},
	computed: {
		dinozCount() {
			return this.dinozStore.getDinozCount;
		},
		getPlayerId() {
			return this.playerStore.getPlayerId;
		},
		isAdmin(): boolean {
			return this.playerStore.admin;
		}
	},
	methods: {
		messagerie() {
			EventBus.emit('message', true);
		},
		togglePanel() {
			this.isPanelOpen = !this.isPanelOpen; // Bascule entre ouvert et fermé
		},
		goToMyAccount(page: string, paramId: number): void {
			this.$router.push({ name: page, params: { id: paramId } });
		},
		goToPage(page: string): void {
			this.$router.push({ name: page });
		},
		getTime(): void {
			const day = new Date();
			this.time = day.toLocaleTimeString('fr-FR', { timeZone: 'GMT' });
		},
		logOff(): void {
			this.localStore.setJwt(undefined);
			this.dinozStore.$reset();
			this.playerStore.$reset();
			this.$router.go(0);
		},
		isDevEnv(): boolean {
			return import.meta.env.MODE === 'development';
		},
		async jwt(): Promise<void> {
			await navigator.clipboard.writeText(this.localStore.getJwt!);
		}
	},
	mounted(): void {
		setInterval(() => {
			this.getTime();
		}, 1000);
	}
});
</script>

<style lang="scss" scoped>
.rightMenu {
	background:
		url('../../assets/design/sideMenu_header.webp') no-repeat,
		url('../../assets/design/sideMenu_footer.webp') no-repeat,
		url('../../assets/design/sideMenu_bg.webp') repeat-y;
	background-position-y: top, bottom;
	a {
		text-decoration: none;
		color: rgb(142, 62, 38);
		display: block;
		font-family: 'Trebuchet MS', Arial, sans-serif;
		font-size: 12px;
		font-variant: small-caps;
		font-weight: 700;
		height: 20px;
		line-height: 14.6667px;
		padding-left: 5px;
		text-align: left;
	}

	a:hover {
		background-color: #9a4029;
		color: #fce3bc;
		cursor: pointer;
	}

	p {
		border-collapse: collapse;
		border-spacing: 0px 0px;
		color: rgb(142, 62, 38);
		display: block;
		font-family: 'Trebuchet MS', Arial, sans-serif;
		font-size: 12px;
		font-variant: small-caps;
		font-weight: 700;
		height: 20px;
		line-height: 14.6667px;
		list-style-image: none;
		list-style-position: outside;
		list-style-type: none;
		margin-bottom: 0px;
		margin-left: 0px;
		margin-right: 10px;
		margin-top: 0px;
		padding-bottom: 0px;
		padding-left: 5px;
		padding-right: 0px;
		padding-top: 0px;
		text-align: left;
	}
}

.time-wrapper {
	margin-bottom: 4px;

	.time {
		display: inline;
		width: 70px;
		height: 16px;
		padding-left: 20px;
		padding-bottom: 2px;
		font-size: 10pt;
		background-image: url('../../assets/design/small_chrono.webp');
		background-repeat: no-repeat;
		margin-left: 3px;
		line-height: 12px;
	}
}

.guide {
	background-image: url('../../assets/design/button_help.gif');
	color: #fff1ad;
	font-variant: small-caps;
	font-weight: bold;
	text-align: center;
	height: 23px;
	width: 95px !important;
	margin-left: 2.5px;
	padding-top: 27px;
	background-repeat: no-repeat;
	font-size: 10pt;
	cursor: pointer;

	&:hover {
		color: white;
		background-image: url('../../assets/design/button_help_hover.gif');
	}
}
</style>
