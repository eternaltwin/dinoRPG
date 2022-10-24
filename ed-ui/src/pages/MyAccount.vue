<template>
	<TitleHeader :title="`${$t('pageTitle.account')}`"></TitleHeader>
	<div style="width: auto">
		<div class="section">
			<div class="titlePage">
				<h3>{{ $t(`myAccount.title`) }} {{ accountData.playerName }}</h3>
			</div>
		</div>
		<div class="wrapper" v-if="dataLoaded">
			<div class="filler"></div>
			<Profile :accountData="accountData"></Profile>
			<EpicRewards :epicRewards="accountData.epicRewards"></EpicRewards>
			<MyDinoz class="dinoz" style="width: 690px" :accountData="accountData"></MyDinoz>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { PlayerService } from '@/services';
import { errorHandler } from '@/utils';
import { PlayerInfo } from '@/models';
import { sessionStore } from '@/store';
import EventBus from '@/events';

export default defineComponent({
	name: 'MyAccount',
	data() {
		return {
			sessionStore: sessionStore(),
			accountData: {} as PlayerInfo,
			dataLoaded: false as boolean
		};
	},
	components: {
		TitleHeader: defineAsyncComponent(() => import('@/components/utils/TitleHeader.vue')),
		MyDinoz: defineAsyncComponent(() => import('@/components/data/MyDinoz.vue')),
		Profile: defineAsyncComponent(() => import('@/components/data/Profile.vue')),
		EpicRewards: defineAsyncComponent(() => import('@/components/data/EpicRewards.vue'))
	},
	async created(): Promise<void> {
		const accountId = parseInt(this.$route.params.id.toString());
		EventBus.emit('isLoading', true);
		try {
			this.accountData = await PlayerService.getPlayerData(accountId);
			this.dataLoaded = true;
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	},
	watch: {
		// Reload page if player click on 'my account' button
		'$route.params.id': function () {
			if (this.$router.currentRoute.value.params.id === this.sessionStore.getPlayerId!.toString()) {
				this.$router.go(0);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.smallbutton {
	display: inline-block;
	background-image: url('~@/assets/design/button_small.webp');
	font-size: 9pt;
	width: 80px;
	padding-top: 5px;
	padding-right: 5px;
	color: white;
	font-weight: normal;
	font-variant: small-caps;
	height: 24px;
	margin-top: 3px;
	margin-bottom: 2px;
	padding-left: 10px;
	cursor: pointer;
	text-align: center;
	text-decoration: none;
	&:hover {
		background-image: url('~@/assets/design/button_small_hover.webp');
	}
}
.filler {
	height: 180px;
	width: 550px;
}
.wrapper {
	display: flex;
	width: 620px;
	justify-content: space-between;
	gap: 10px;
	flex-wrap: wrap;
}
</style>
