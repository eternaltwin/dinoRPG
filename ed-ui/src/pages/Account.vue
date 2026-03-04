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
			<div>
				<TwinoidGoals
					title="$t(`myAccount.twinoidgoals.archivedTitle`)"
					v-if="displayArchivedStats && archivedStats"
					:accountStats="archivedStats"
				></TwinoidGoals>
				<TwinoidGoals
					v-else
					:title="$t(`myAccount.twinoidgoals.name`)"
					:accountStats="accountData.stats"
				></TwinoidGoals>
				<DZButton v-if="accountData.archivedTwinoidId" @click="loadArchivedStats">
					{{ $t(`myAccount.twinoidgoals.seeStats`) }}
				</DZButton>
			</div>
			<div class="profilCard">
				<Profile :accountData="accountData"></Profile>
				<EpicRewards :epicRewards="accountData.epicRewards"></EpicRewards>
			</div>
		</div>
		<MyDinoz :accountData="accountData"></MyDinoz>
		<div class="mandragore">
			<img :src="getImgURL('design', 'mandragore')" alt="Mandragore" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PlayerService } from '../services/index.js';
import { errorHandler } from '../utils/index.js';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { playerStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import MyDinoz from '../components/data/MyDinoz.vue';
import Profile from '../components/data/Profile.vue';
import EpicRewards from '../components/data/EpicRewards.vue';
import TwinoidGoals from '../components/data/TwinoidGoals.vue';
import { PlayerStats } from '@drpg/core/models/player/PlayerStats';
import DZButton from '../components/common/DZButton.vue';

export default defineComponent({
	name: 'Account',
	data() {
		return {
			playerStore: playerStore(),
			accountData: {} as PlayerInfo,
			archivedStats: undefined as PlayerStats[] | undefined,
			dataLoaded: false as boolean,
			displayArchivedStats: false
		};
	},
	components: {
		DZButton,
		TitleHeader,
		MyDinoz,
		Profile,
		EpicRewards,
		TwinoidGoals
	},
	methods: {
		async checkAndLoadAccount(): Promise<void> {
			const accountId = this.$route.params.id as string;
			if (this.$route.name !== 'Account' || typeof accountId !== 'string' || accountId.length < 10) return;
			this.dataLoaded = false;

			try {
				const data = await PlayerService.getPlayerData(accountId);
				this.accountData = data;
				data.stats.sort((a, b) => b.quantity - a.quantity);
				this.dataLoaded = true;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async loadArchivedStats() {
			const accountId = this.$route.params.id as string;
			if (this.displayArchivedStats) {
				this.displayArchivedStats = false;
			} else {
				if (!this.archivedStats) {
					try {
						this.archivedStats = await PlayerService.getArchivedPlayerData(accountId);
						this.archivedStats.sort((a, b) => b.quantity - a.quantity);
					} catch (err) {
						errorHandler.handle(err, this.$toast);
					}
				}

				this.displayArchivedStats = true;
			}
		}
	},
	mounted() {
		this.checkAndLoadAccount();
	},
	watch: {
		'$route.params.id': 'checkAndLoadAccount'
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
	justify-content: space-between;
	gap: 10px;
	flex-direction: column;
	max-height: max-content;
	.filler {
		display: flex;
		align-items: center;
		justify-content: space-around;

		img {
			flex: 1;
			max-width: 33%;
			height: auto;
		}
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
	.mandragore {
		align-self: flex-end;
		margin-block-start: -420px;
		margin-inline-end: -140px;
		width: 30%;
	}
}
@media (max-width: 790px) {
	.wrapper {
		.mandragore {
			display: none;
		}
	}
}
@media (max-width: 540px) {
	.wrapper {
		.filler {
			display: none;
		}
		.mandragore {
			display: none;
		}
	}
}
</style>
