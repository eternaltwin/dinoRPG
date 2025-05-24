<template>
	<TitleHeader
		:title="`${$t('pageTitle.account')}`"
		:header="`${$t('myAccount.title')} ${accountData.name}`"
	></TitleHeader>

	<div class="wrapper" v-if="dataLoaded">
		<div class="filler">
			<img :src="getImgURL('design', 'moueffeHp')" alt="moueffe" class="dinoz" />
			<img :src="getImgURL('design', 'pigmou_01')" alt="pigmou" class="dinoz" />
			<img :src="getImgURL('design', 'kabuk_hp')" alt="kabuki" class="dinoz" />
		</div>
		<div class="cards">
			<TwinoidGoals :accountStats="accountData.stats"></TwinoidGoals>
			<div class="profilCard">
				<Profile :accountData="accountData"></Profile>
				<EpicRewards :epicRewards="accountData.epicRewards"></EpicRewards>
			</div>
		</div>
		<MyDinoz :accountData="accountData"></MyDinoz>
		<!--			<img :src="getImgURL('design', 'mandragore')" alt="Mandragore" class="mandragore" />-->
	</div>
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
		const accountId = this.$route.params.id as string;
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
			if (this.$router.currentRoute.value.params.id === this.playerStore.getPlayerId.toString()) {
				const accountId = this.$route.params.id as string;
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
.smallbutton {
	display: inline-block;
	background-image: url('../assets/design/button_small.webp');
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
		background-image: url('../assets/design/button_small_hover.webp');
	}
}
.wrapper {
	display: flex;
	//width: 620px;
	justify-content: space-between;
	gap: 10px;
	flex-direction: column;
	//flex-wrap: wrap;
	height: 100%;
	.mandragore {
		position: absolute;
		right: -180px;
		bottom: 0;
	}
	.cards {
		display: flex;
		width: 100%;
		max-height: 100%;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		.profilCard {
			display: flex;
			flex-direction: column;
		}
	}
}
.filler {
	display: flex;
	gap: 15px;
	height: 200px;
	width: 540px;
	img {
		object-fit: scale-down;
		width: 75%;
	}
}
@media (max-width: 540px) {
	.filler {
		display: none;
	}
}
</style>
