<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div>
		<!-- Bouton Panel (visible seulement sur mobile/tablette) -->
		<button
			class="visible absolute left-0 top-[90px] z-40 rounded-r-lg bg-[#bc693cd7] px-6 py-4 text-white transition-transform duration-300 lg:invisible"
			:class="{ 'translate-x-[130px]': isPanelOpen }"
			@click="togglePanel"
		>
			<span class="text-3xl" v-if="!isPanelOpen">☰</span>
			<span class="text-3xl" v-else>✖</span>
		</button>
		<!-- Menu latéral -->
		<ul
			class="rightMenu absolute left-0 z-40 mt-[90px] w-[130px] -translate-x-full list-none p-[15px] transition-transform duration-300 lg:relative lg:translate-x-0"
			:class="{ 'translate-x-0': isPanelOpen }"
		>
			<li class="mb-[5px]">
				<div
					class="ml-[3px] inline h-[20px] w-[80px] bg-[url('./assets/design/small_chrono.webp')] bg-no-repeat pb-[2px] pl-[20px] text-2xl"
				>
					{{ time }}
				</div>
			</li>
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
			<li
				@click="goToPage('Help')"
				class="ml-[2px] h-[55px] max-w-[95px] cursor-pointer bg-[url('./assets/design/button_help.gif')] bg-no-repeat pt-[28px] text-center text-xl font-bold text-[#fff1ad] hover:bg-[url('./assets/design/button_help_hover.gif')] hover:text-white"
				style="font-variant: small-caps"
			>
				{{ $t('rightMenu.guide') }}
			</li>
		</ul>
	</div>
			<li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LocaleChange from '../../components/utils/LocaleChange.vue';
import { dinozStore, playerStore, localStore } from '../../store/index.js';

export default defineComponent({
	name: 'RightMenu',
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			localStore: localStore(),
			time: '' as string,
			isPanelOpen: false
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
		&:hover {
			background-color: #9a4029;
			color: #fce3bc;
			cursor: pointer;
		}
	}
	p {
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
}
</style>
