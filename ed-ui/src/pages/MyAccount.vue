<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<TitleHeader :title="`${$t('pageTitle.account')}`"></TitleHeader>
	<div class="section ml-[-25px] mt-[-30px] sm:ml-0 sm:mt-0">
		<div class="titlePage">
			<h3>{{ $t(`myAccount.title`) }} {{ accountData.playerName }}</h3>
		</div>
	</div>
	<div
		class="mb-10 ml-[-65px] flex min-w-full flex-wrap items-center justify-center sm:ml-0 lg:items-start lg:justify-between"
	>
		<img :src="getImgURL('design', 'moueffeHp')" alt="moueffe" />
		<img :src="getImgURL('design', 'pigmou_01')" alt="pigmou" />
		<img :src="getImgURL('design', 'kabuk_hp')" alt="kabuki" />
	</div>
	<div
		class="mb-10 ml-[-65px] flex min-w-full flex-col items-center justify-center gap-x-10 overflow-x-hidden sm:ml-0 sm:overflow-visible lg:mt-7 lg:flex-row lg:flex-nowrap lg:items-start lg:justify-between"
	>
		<div v-if="dataLoaded">
			<TwinoidGoals :accountStats="accountData.stats" :key="accountData.stats"></TwinoidGoals>
		</div>
		<div v-if="dataLoaded">
			<Profile :accountData="accountData" :key="accountData"></Profile>
			<EpicRewards :epicRewards="accountData.epicRewards" :key="accountData.epicRewards"></EpicRewards>
		</div>
	</div>
	<MyDinoz v-if="dataLoaded" :accountData="accountData" :key="accountData.dinoz"></MyDinoz>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PlayerService } from '../services/index.js';
import { errorHandler } from '../utils/index.js';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { playerStore } from '../store/index.js';
import EventBus from '../events/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import MyDinoz from '../components/data/MyDinoz.vue';
import Profile from '../components/data/Profile.vue';
import EpicRewards from '../components/data/EpicRewards.vue';
import TwinoidGoals from '../components/data/TwinoidGoals.vue';

export default defineComponent({
	name: 'MyAccount',
	data() {
		return {
			playerStore: playerStore(),
			accountData: {} as PlayerInfo,
			dataLoaded: false as boolean
		};
	},
	components: {
		TitleHeader,
		MyDinoz,
		Profile,
		EpicRewards,
		TwinoidGoals
	},
	async created(): Promise<void> {
		const accountId = parseInt(this.$route.params.id.toString());
		EventBus.emit('isLoading', true);
		try {
			this.accountData = await PlayerService.getPlayerData(accountId);
			this.accountData.stats.sort((a, b) => b.quantity - a.quantity);
			this.dataLoaded = true;
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	},
	watch: {
		// Reload page if player click on 'my account' button
		'$route.params.id': async function () {
			if (this.$router.currentRoute.value.params.id === this.playerStore.getPlayerId!.toString()) {
				const accountId = parseInt(this.$route.params.id.toString());
				EventBus.emit('isLoading', true);
				try {
					this.accountData = await PlayerService.getPlayerData(accountId);
					this.accountData.stats.sort((a, b) => b.quantity - a.quantity);
					this.dataLoaded = true;
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		}
	}
});
</script>

<style lang="scss" scoped>
img {
	object-fit: scale-down;
	width: 25%;
}
</style>
