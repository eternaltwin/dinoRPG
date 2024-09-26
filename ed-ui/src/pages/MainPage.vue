<template>
	<div class="dinorpg">
		<div id="layout" class="flex flex-grow-3 min-h-screen w-full justify-around bg-white bg-no-repeat">
			<!-- Section Left -->
			<div class="flex-grow"></div>
			<!-- Section Center -->
			<div class="center flex flex-col w-[900px] items-center bg-repeat-y bg-contain md:bg-auto">
				<div id="centerHeader" class="flex w-full min-h-screen p-px bg-no-repeat bg-contain md:bg-auto" v-if="loaded">
					<LeftPanel />
					<div
						id="centerContent"
						class="flex flex-col w-full lg:max-w-[540px] mt-[-20px] md:mt-[10px] ml-[80px] md:ml-[40px] lg:ml-[30px]"
					>
						<a @click="goToNews()" class="linkHome w-full h-[120px] z-1 cursor-pointer"></a>
						<Router-view />
					</div>
					<RightMenu />
				</div>
			</div>
			<!-- Section Right -->
			<div class="right relative flex-grow hidden md:block bg-repeat-y"></div>
		</div>
		<div id="prefoot" class="flex w-full h-[100px] justify-between">
			<!-- Section Left -->
			<div class="flex-grow"></div>
			<!-- Section Center -->
			<div
				class="footCenter flex w-full sm:w-[900px] h-full items-center bg-top-center bg-contain sm:bg-cover bg-no-repeat"
			></div>
			<!-- Section Right -->
			<div class="footRight flex-grow"></div>
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
#layout {
	background-image: url('../assets/background/bg_ciel3.webp');
}
.center {
	background-image: url('../assets/background/sky_core_bg.webp');
	#centerHeader {
		background-image: url('../assets/background/core_center_header3.webp');
	}
}
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
.footCenter {
	background-image: url('../assets/background/core_center_footer.webp');
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
