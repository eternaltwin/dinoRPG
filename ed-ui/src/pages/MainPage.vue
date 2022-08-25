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
	data() {
		return {
			sessionStore: sessionStore()
		};
	},
	async mounted(): Promise<void> {
		const money = this.sessionStore.getMoney;
		const dinozList = this.sessionStore.getDinozList;
		const dinozCount = this.sessionStore.getDinozCount;

		if (!money || !dinozList || !dinozCount) {
			try {
				EventBus.emit('isLoading', true);
				const commonData: CommonData = await PlayerService.getCommonData();

				// Set data in sessionStore
				this.sessionStore.setMoney(commonData.money);
				this.sessionStore.setDinozList(commonData.dinoz);
				this.sessionStore.setDinozCount(commonData.dinozCount);
				this.sessionStore.setPlayerId(commonData.id);
				EventBus.emit('isLoading', false);

				await this.$router.push({ name: 'News' });
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
