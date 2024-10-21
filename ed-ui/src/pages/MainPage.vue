<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="dinorpg">
		<div
			id="layout"
			class="grow-3 flex min-h-screen w-full justify-around bg-white bg-[url('./assets/background/bg_ciel3.webp')] bg-no-repeat"
		>
			<!-- Section Left -->
			<div class="grow"></div>
			<!-- Section Center -->
			<div
				class="center flex w-[900px] flex-col items-center bg-[url('./assets/background/sky_core_bg.webp')] bg-contain bg-repeat-y sm:bg-auto"
			>
				<div
					id="centerHeader"
					class="flex min-h-screen w-full bg-[url('./assets/background/core_center_header3.webp')] bg-contain bg-no-repeat p-px sm:bg-auto"
					v-if="loaded"
				>
					<LeftPanel />
					<div
						id="centerContent"
						class="ml-[80px] mt-[-40px] flex w-full flex-col md:ml-[40px] md:mt-[10px] lg:ml-[30px] lg:max-w-[540px]"
					>
						<a @click="goToNews()" class="linkHome z-1 h-[120px] w-full cursor-pointer"></a>
						<Router-view />
					</div>
					<RightMenu />
				</div>
			</div>
			<!-- Section Right -->
			<div class="right relative hidden grow bg-repeat-y md:block"></div>
		</div>
		<div id="prefoot" class="flex h-[100px] w-full justify-between">
			<!-- Section Left -->
			<div class="grow"></div>
			<!-- Section Center -->
			<div
				class="bg-top-center flex size-full items-center bg-[url('./assets/background/core_center_footer.webp')] bg-contain bg-no-repeat sm:w-[900px] sm:bg-auto"
			></div>
			<!-- Section Right -->
			<div class="footRight grow"></div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LeftPanel from '../components/common/LeftPanel.vue';
import RightMenu from '../components/common/RightMenu.vue';
import { playerStore, dinozStore } from '../store/index.js';
import { errorHandler } from '../utils/index.js';
import { PlayerService } from '../services/index.js';
import EventBus from '../events/index.js';

export default defineComponent({
	name: 'MainPage',
	components: {
		LeftPanel,
		RightMenu
	},
	data() {
		return {
			playerStore: playerStore(),
			dinozStore: dinozStore(),
			loaded: false as boolean
		};
	},
	methods: {
		async firstLoad() {
			EventBus.emit('isLoading', true);
			try {
				const commonData = await PlayerService.getLoggedInData();
				// Set data in sessionStore
				this.playerStore.setMoney(commonData.money);
				this.dinozStore.setDinozList(commonData.dinoz);
				this.dinozStore.setDinozCount(commonData.dinozCount);
				this.playerStore.setClanId(commonData.clanId);
				this.playerStore.setPriest(commonData.priest);
				this.playerStore.setShopkeeper(commonData.shopkeeper);

				if (!this.playerStore.getPlayerId) {
					this.playerStore.setPlayerId(commonData.id);
					this.playerStore.setPlayerName(commonData.name);
					this.playerStore.setPlayerOptions(commonData.playerOptions);
					this.playerStore.setAdmin(commonData.admin);
				}
				this.loaded = true;
				EventBus.emit('isLoading', false);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
				return;
			}
		},
		async goToNews() {
			this.$router.push({
				name: 'News'
			});
			await this.firstLoad();
		}
	},
	async created() {
		try {
			await this.firstLoad();
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
		EventBus.on('refreshMoney', async e => {
			if (!e) return;
			const newMoney = await PlayerService.getPlayerMoney();
			this.playerStore.setMoney(parseInt(newMoney));
		});
	}
});
</script>

<style lang="scss" scoped>
.right {
	background-image: url('../assets/background/core_right_bg.webp');
	&::before {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		min-height: 100px;
		background-image: url('../assets/background/core_right_header3.webp');
		background-repeat: no-repeat;
		background-position: left top;
	}
}
.footRight {
	&::before {
		content: '';
		display: block;
		width: 100%;
		min-height: 100px;
		background-image: url('../assets/background/core_right_footer.webp');
		background-repeat: no-repeat;
		background-position: left top;
	}
}
</style>
