<template>
	<div class="dinorpg">
		<div id="layout">
			<div class="left"><div></div></div>
			<div class="center">
				<a @click="goToNews()" class="linkHome"></a>
				<div id="centerHeader" v-if="loaded">
					<!--					<div id="menu"></div>-->
					<LeftPanel />
					<div id="centerContent">
						<Router-view />
					</div>
					<RightMenu />
				</div>
			</div>
			<div class="right">
				<div></div>
			</div>
		</div>
		<div id="prefoot">
			<div class="left"><div></div></div>
			<div class="footCenter center"><div></div></div>
			<div class="footRight right"><div></div></div>
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
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	flex-grow: 3;
	background-image: url('../assets/background/bg_ciel3.webp');
	background-color: white;
	background-repeat: no-repeat;
}

#prefoot {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	flex-grow: 3;
	//background-image: url('../assets/background/bg_ciel3.webp');
	background-color: white;
	background-repeat: no-repeat;
}

.left {
	flex-grow: 1;
}
.right {
	background-image: url('../assets/background/core_right_bg.webp');
	background-position: left 77px;
	background-repeat: repeat-y;
	flex-grow: 1;
	div {
		height: 88px;
		background-image: url('../assets/background/core_right_header3.webp');
		background-repeat: no-repeat;
		background-position: left top;
	}
}

.center {
	width: 900px;
	background-image: url('../assets/background/sky_core_bg.webp');
	background-repeat: repeat-y;
	display: flex;
	align-items: center;
	flex-direction: column;
	a.linkHome {
		/*position: absolute;
		width: 500px;
		height: 80px;
		z-index: 10;
		margin-top: 25px;
		margin-left: 240px;
		background-color: transparent;*/
		cursor: pointer;
	}

	#centerHeader {
		padding: 1px;
		background-image: url('../assets/background/core_center_header3.webp');
		background-repeat: no-repeat;
		min-height: 100vh;
		width: 100%;
		display: flex;
	}
}
.footCenter {
	background-image: url('../assets/background/core_center_footer.webp');
}
.footRight {
	div {
		background-image: url('../assets/background/core_right_footer.webp');
	}
}
</style>
