<template>
	<div class="dinorpg">
		<table id="layout">
			<tbody>
				<tr>
					<td id="left"><div></div></td>
					<td id="center">
						<a href="/" class="linkHome"></a>
						<div id="centerHeader">
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
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
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
			dinozStore: dinozStore()
		};
	},
	methods: {
		async firstLoad(): Promise<void> {
			EventBus.emit('isLoading', true);
			const commonData: PlayerCommonData = await PlayerService.getLoggedInData();

			// Set data in sessionStore
			this.playerStore.setMoney(commonData.money);
			this.dinozStore.setDinozList(commonData.dinoz);
			this.dinozStore.setDinozCount(commonData.dinozCount);
			this.playerStore.setPlayerId(commonData.id);
			this.playerStore.setPlayerName(commonData.name);
			if (!this.playerStore.getPlayerOptions) {
				this.playerStore.setPlayerOptions(commonData.playerOptions);
			}

			EventBus.emit('isLoading', false);
		}
	},
	async mounted(): Promise<void> {
		try {
			await this.firstLoad();
		} catch (err) {
			errorHandler.handle(err);
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
}
</style>
