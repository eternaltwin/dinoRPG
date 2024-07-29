<template>
	<div class="dinorpg">
		<table id="layout">
			<tbody>
				<tr>
					<td id="left"><div></div></td>
					<td id="center">
						<a @click="goToNews()" class="linkHome"></a>
						<div id="centerHeader" v-if="loaded">
							<div id="menu"></div>
							<LeftPanel />
							<div id="centerContent">
								<Router-view />
								<RightMenu />
							</div>
						</div>
					</td>
					<td id="right">
						<div></div>
					</td>
				</tr>
				<tr>
					<td><div></div></td>
					<td>
						<div class="skyfootercore"></div>
					</td>
					<td>
						<div class="skyfooterright"></div>
					</td>
				</tr>
			</tbody>
		</table>
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
a.linkHome {
	position: absolute;
	width: 500px;
	height: 80px;
	z-index: 10;
	margin-top: 25px;
	margin-left: 240px;
	background-color: transparent;
	cursor: pointer;
}
</style>
