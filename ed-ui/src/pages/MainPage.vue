<template>
	<div class="dinorpg">
		<div id="centerHeader" v-if="loaded">
			<div id="centerContent">
				<a @click="goToNews()" class="linkHome"></a>
				<Router-view />
			</div>
		</div>
		<div id="prefoot" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import LeftPanel from '../components/common/LeftPanel.vue';
import { playerStore, dinozStore } from '../store/index.js';
import { errorHandler } from '../utils/index.js';
import { PlayerService } from '../services/index.js';
import EventBus from '../events/index.js';

export default defineComponent({
	name: 'MainPage',
	/*components: {
		LeftPanel
	},*/
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
.dinorpg {
	background-image: url('../assets/background/bg_ciel3.webp');
	background-repeat: repeat-x;
}
#centerHeader {
	min-height: 100vh;
	background:
		url('../assets/background/full_bg.webp') no-repeat,
		url('../assets/background/full_core_bg.webp') repeat-y;
	background-position-x: calc(50% + 247px);
	background-position-y: top;
}

#prefoot {
	background-image: url('../assets/background/full_footer.webp');
	background-color: white;
	background-repeat: no-repeat;
	background-position-x: calc(50% + 248px);
	min-height: 128px;
}
#centerContent {
	//display: flex;
	//flex-wrap: nowrap;
	//margin-left: 30px;
	width: 100%;
	max-width: 540px;
	display: flex;
	flex-direction: column;
}
</style>
