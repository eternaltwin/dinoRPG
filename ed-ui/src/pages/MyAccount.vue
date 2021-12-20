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
		try {
			this.accountData = await PlayerService.getPlayerData(accountId);
			this.dataLoaded = true;
		} catch (err) {
			errorHandler.handle(err);
			return Promise.reject(err);
		}
	},
	watch: {
		// Reload page if player click on 'my account' button
		'$route.params.id': function() {
			this.$router.go(0);
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
