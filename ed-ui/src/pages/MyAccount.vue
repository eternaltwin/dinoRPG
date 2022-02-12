<template>
	<Title :title="`${$t('pageTitle.account')}`"></Title>
	<div style="width:auto">
		<div class="section">
			<div class="titlePage">
				<h3>{{ $t(`myAccount.title`) }} {{ accountData.playerName }}</h3>
			</div>
		</div>
		<div class="wrapper" v-if="dataLoaded">
			<div class="filler"></div>
			<Profile :accountData="accountData"></Profile>
			<EpicRewards :epicRewards="accountData.epicRewards"></EpicRewards>
			<MyDinoz
				class="dinoz"
				style="width:690px"
				:accountData="accountData"
			></MyDinoz>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Title from '@/components/utils/Title.vue';
import { PlayerService } from '@/services';
import { errorHandler } from '@/utils';
import { PlayerInfo } from '@/models';
import MyDinoz from '@/components/data/MyDinoz.vue';
import Profile from '@/components/data/Profile.vue';
import EpicRewards from '@/components/data/EpicRewards.vue';
import { sessionStore } from '@/store';
import EventBus from '@/events';

export default defineComponent({
	name: 'MyAccount',
	data() {
		return {
			accountData: {} as PlayerInfo,
			dataLoaded: false as boolean
		};
	},
	components: {
		Title,
		MyDinoz,
		Profile,
		EpicRewards
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
		'$route.params.id': function() {
			if (
				this.$router.currentRoute.value.params.id ===
				sessionStore.getters.getPlayerId.toString()
			) {
				this.$router.go(0);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
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
