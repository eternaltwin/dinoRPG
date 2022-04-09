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
import { isNil } from 'lodash';
import LeftPanel from '@/components/common/LeftPanel.vue';
import RightMenu from '@/components/common/RightMenu.vue';
import { sessionStore } from '@/store';
import { CommonData } from '@/models';
import { errorHandler } from '@/utils';
import { PlayerService } from '@/services';
import EventBus from '@/events';

export default defineComponent({
	name: 'MainPage',
	components: {
		LeftPanel,
		RightMenu
	},
	async mounted(): Promise<void> {
		const money = sessionStore.getters.getMoney;
		const dinozList = sessionStore.getters.getDinozList;
		const dinozCount = sessionStore.getters.getDinozCount;

		if (isNil(money) || isNil(dinozList) || isNil(dinozCount)) {
			try {
				EventBus.emit('isLoading', true);
				const commonData: CommonData = await PlayerService.getCommonData();

				// Set data in sessionStore
				sessionStore.commit('setMoney', commonData.money);
				sessionStore.commit('setDinozList', commonData.dinoz);
				sessionStore.commit('setDinozCount', commonData.dinozCount);
				sessionStore.commit('setPlayerId', commonData.playerId);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		}
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
