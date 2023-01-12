<template>
	<ul class="rightMenu">
		<li>
			<div class="time">{{ time }}</div>
		</li>
		<li>
			<a @click="goToPage('News')">{{ $t('rightMenu.news') }}</a>
		</li>
		<li>
			<a @click="goToPage('')">{{ $t('rightMenu.gazette') }}</a>
		</li>
		<li>
			<a @click="goToPage('Ranking')">{{ $t('rightMenu.ranking') }}</a>
		</li>
		<li>
			<a @click="goToPage('')">{{ $t('rightMenu.clans') }}</a>
		</li>
		<li>
			<a @click="goToPage('Ingredients')">{{ $t('rightMenu.ingredients') }}</a>
		</li>
		<li>
			<a @click="goToMyAccount('MyAccount', getPlayerId)">{{ $t('rightMenu.account') }}</a>
		</li>
		<li>
			<a href="https://eternal-twin.net/forum/sections/drpg_main" target="_blank">{{ $t('rightMenu.forum') }}</a>
		</li>
		<li>
			<a v-if="isDevEnv()" href="http://localhost:8081/api-docs" target="_blank" class="smallbutton" @click="jwt()"
				>API</a
			>
			<a
				v-if="!isDevEnv()"
				href="https://dinorpg.eternaltwin.org/api-docs"
				target="_blank"
				class="smallbutton"
				@click="jwt()"
				>API</a
			>
		</li>
		<li>
			<p>{{ dinozCount }} Dinoz</p>
		</li>
		<li>
			<LocaleChange />
		</li>
		<li>
			<a @click="logOff()">{{ $t('rightMenu.logout') }}</a>
		</li>
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LocaleChange from '@/components/utils/LocaleChange.vue';
import { sessionStore } from '@/store';

export default defineComponent({
	name: 'RightMenu',
	data() {
		return {
			sessionStore: sessionStore(),
			time: '' as string
		};
	},
	components: {
		LocaleChange
	},
	computed: {
		dinozCount(): number | undefined {
			return this.sessionStore.getDinozCount;
		},
		getPlayerId(): number | undefined {
			return this.sessionStore.getPlayerId;
		}
	},
	methods: {
		goToMyAccount(page: string, paramId: number): void {
			this.$router.push({ name: page, params: { id: paramId } });
		},
		goToPage(page: string): void {
			this.$router.push({ name: page });
		},
		getTime(): void {
			const day: Date = new Date();
			this.time = day.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' });
		},
		logOff(): void {
			sessionStorage.clear();
			this.$router.go(0);
		},
		isDevEnv(): boolean {
			return import.meta.env.MODE === 'development';
		},
		async jwt(): Promise<void> {
			await navigator.clipboard.writeText(this.sessionStore.getJwt!);
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
	left: 550px;
	position: absolute;
	padding-bottom: 10px;
	padding-right: 10px;
	height: auto;
	width: auto;
	top: -25px;
	padding-left: 15px;
	padding-top: 15px;
	background: url('@/assets/design/sideMenu_header.webp') no-repeat,
		url('@/assets/design/sideMenu_footer.webp') no-repeat, url('@/assets/design/sideMenu_bg.webp') repeat-y;
	background-position-y: top, bottom;
	display: block;
	list-style: none;
	// margin-block-start: 1em;
	// margin-block-end: 1em;
	// margin-inline-start: 0px;
	// margin-inline-end: 0px;
	// padding-inline-start: 4px;
	li {
		width: 100px;
	}
	a {
		text-decoration: none;
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
.time {
	display: inline;
	width: 70px;
	height: 16px;
	padding-left: 20px;
	font-size: 10pt;
	background-image: url('@/assets/design/small_chrono.webp');
	background-repeat: no-repeat;
	margin-left: 3px;
	line-height: 12px;
}
</style>
