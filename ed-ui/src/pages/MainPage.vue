<template>
	<ErrorMessage />
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
import store from '@/store';
import { CommonData } from '@/models';
import { errorHandler } from '@/utils';
import { PlayerService } from '@/services';
import ErrorMessage from '@/components/utils/ErrorMessage.vue';

export default defineComponent({
	name: 'MainPage',
	components: {
		LeftPanel,
		RightMenu,
		ErrorMessage
	},
	async mounted(): Promise<void> {
		const money = store.getters.getMoney;
		const dinozList = store.getters.getDinozList;
		const dinozCount = store.getters.getDinozCount;

		if (isNil(money) || isNil(dinozList) || isNil(dinozCount)) {
			try {
				const commonData: CommonData = await PlayerService.getCommonData();

				// Set data in store
				store.commit('setMoney', commonData.money);
				store.commit('setDinozList', commonData.dinoz);
				store.commit('setDinozCount', commonData.dinozCount);
				store.commit('setPlayerId', commonData.playerId);
			} catch (err) {
				errorHandler.handle(err);
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
