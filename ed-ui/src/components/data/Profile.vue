<template>
	<transition name="fade">
		<!--		<div class="profil" :style="{ display: option ? 'none' : '' }">-->
		<div class="profil" v-if="!option">
			<h3>
				<img :src="getImgURL('design', 'info_button')" alt="info_button" />
				{{ $t(`myAccount.profil`) }}
				<img :src="getImgURL('design', 'info_button')" alt="info_button" />
			</h3>
			<dl>
				<dt>
					{{ $t(`myAccount.title`) }}
				</dt>
				<dd>
					<DZUser :user="accountData" />
				</dd>
				<dt>
					{{ $t(`myAccount.dinoz`) }}
				</dt>
				<dd>
					{{ accountData.dinozCount }}
				</dd>
				<dt>
					{{ $t(`myAccount.ranking`) }}
				</dt>
				<dd>
					<RouterLink
						v-if="playerPosition"
						:to="{
							name: 'RankingPlayers',
							params: { pageLoaded: Math.floor(playerPosition / 20) + 1 }
						}"
						>{{ playerPosition }}</RouterLink
					>
					({{ accountData.pointCount }} points)
				</dd>
				<dt>
					{{ $t(`myAccount.inscription`) }}
				</dt>
				<dd>
					{{ getFormattedSubscribe() }}
				</dd>
				<dt v-if="accountData.clan">
					{{ $t(`myAccount.clan`) }}
				</dt>
				<dd v-if="accountData.clan">
					<a @click="goToClan(accountData.clan.id)">{{ accountData.clan.name }}</a>
				</dd>
				<dt>
					{{ $t(`myAccount.completion`) }}
				</dt>
				<dd>{{ accountData.completion.toFixed(2) }} %</dd>
			</dl>
			<div class="profilContent" v-if="!isEditOn">
				<div v-html="customText" class="contentTexte" />
			</div>
			<textarea v-if="isEditOn" v-model="customTextEdit" class="editTexte" />
			<div class="buttonLand" v-if="isMyAccount()">
				<a v-if="hasPlume() && isEditOn" @click="setCustomText(customTextEdit)" class="tinybutton">OK</a>
				<a v-if="hasPlume() && !isEditOn" @click="isEditOn = true" class="tinybutton">{{ $t(`myAccount.edit`) }}</a>
				<DZButton @click="option = true">{{ $t(`myAccount.editAccount`) }}</DZButton>
				<DZButton v-if="hasPMI()" @click="goPMI">{{ $t(`myAccount.quest`) }}</DZButton>
				<Tippy class="lb-button" theme="small" placement="top" :content="formatContent($t('myAccount.labruteTooltip'))">
					<DZButton @click="goLB">{{ $t(`myAccount.labrute`) }}</DZButton>
				</Tippy>
			</div>
		</div>
		<div class="profil" v-else>
			<h3>
				<img :src="getImgURL('design', 'info_button')" alt="info_button" />
				{{ $t(`myAccount.options.title`) }}
				<img :src="getImgURL('design', 'info_button')" alt="info_button" />
			</h3>
			<div class="option">
				{{ $t('topBar.rightMenu.archivedSiteId') }}
				<DZSelect id="archivedSite" v-model="archivedSiteId" :options="possibleSites" @change="updateArchivedSiteId" />
			</div>
			<div class="option">
				{{ $t('topBar.rightMenu.shareArchivedData') }}
				<label class="switch">
					<DZCheckbox id="shareArchivedData" v-model="shareArchivedData" @change="updateShareArchivedData" />
				</label>
			</div>
			<div class="buttonLand" v-if="isMyAccount()">
				<DZButton @click="resetAccount()">{{ $t(`myAccount.options.reset`) }}</DZButton>
				<DZButton @click="option = false">{{ $t(`myAccount.options.retour`) }}</DZButton>
			</div>
		</div>
	</transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { PlayerService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { localStore, playerStore, useDinozStore } from '../../store/index.js';
import { goTo } from '../../utils/goTo.js';
import DZButton from '../common/DZButton.vue';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { formatText } from '../../utils/formatText.js';
import DZUser from '../common/DZUser.vue';
import { deleteCookie } from '../../utils/cookies.js';
import { Tippy } from 'vue-tippy';
import { formatDate } from '../../utils/formatDateTime';
import DZSelect from '../common/DZSelect.vue';
import DZCheckbox from '../common/DZCheckbox.vue';

export default defineComponent({
	name: 'Profile',
	data() {
		return {
			playerStore: playerStore(),
			isEditOn: false as boolean,
			customText: this.accountData?.customText as string | null,
			customTextEdit: this.accountData?.customText ?? '',
			playerPosition: null as number | null,
			option: false as boolean,
			localStore: localStore(),
			dinozStore: dinozStore(),
			shareArchivedData: playerStore().getPlayerOptions.shareArchivedData,
			archivedSiteId: playerStore().getPlayerOptions.archivedSiteId ?? undefined,
			possibleSites: [
				{ label: `www.dinorpg.com (FR)`, value: 2 },
				{ label: `en.dinorpg.com (EN)`, value: 3 },
				{ label: `es.dinorpg.com (ES)`, value: 45 },
				{ label: `www.dinorpg.de (DE)`, value: 5 }
			]
		};
	},
	components: {
		DZCheckbox,
		DZSelect,
		DZUser,
		DZButton,
		Tippy
	},
	props: {
		accountData: {
			type: Object as PropType<PlayerInfo>,
			required: true
		}
	},
	methods: {
		getFormattedSubscribe() {
			return formatDate(this.accountData.subscribedAt);
		},
		hasPlume(): boolean {
			return this.accountData.epicRewards.includes(Reward.PLUME);
		},
		async resetAccount() {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});

			if (res) {
				try {
					const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
					await PlayerService.resetAccount();
					deleteCookie(`x-drpg-${channel}-token`);
					useDinozStore().$reset();
					this.playerStore.$reset();
					this.$router.go(0);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		hasPMI(): boolean {
			return this.accountData.epicRewards.includes(Reward.PMI);
		},
		isMyAccount(): boolean {
			return this.playerStore.getPlayerId === (this.$route.params.id as string);
		},
		async goLB(): Promise<void> {
			try {
				const irma = await PlayerService.getLBRewards();

				this.$toast.open({
					message: formatText(this.$t(`toast.labrute`, { quantity: irma.quantity }, irma.quantity)),
					type: 'info'
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async goPMI() {
			this.$router.push({ name: 'DinozMissions' });
		},
		async setCustomText(message: string): Promise<void> {
			try {
				await PlayerService.setCustomText(message);

				this.customText = message;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
			this.isEditOn = false;
		},
		goToRankingPage(e: Event) {
			e.preventDefault();
			goTo(this.$router, 'Ranking');
		},
		goToClan(id: number) {
			this.$router.push({ name: 'Clan', params: { id } });
		},
		async fetchPlayerPosition() {
			// Fetch player position
			try {
				const { position } = await PlayerService.getPosition(this.$route.params.id as string);
				this.playerPosition = position;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		updateArchivedSiteId() {
			if (this.archivedSiteId) {
				this.playerStore.setPlayerOptions({
					...this.playerStore.playerOptions,
					archivedSiteId: this.archivedSiteId
				});
				PlayerService.updateSetting('archivedSiteId', this.archivedSiteId);
			}
		},
		updateShareArchivedData() {
			this.playerStore.setPlayerOptions({
				...this.playerStore.playerOptions,
				shareArchivedData: this.shareArchivedData
			});
			PlayerService.updateSetting('shareArchivedData', this.shareArchivedData);
		}
	},
	beforeRouteUpdate(to, from, next) {
		this.fetchPlayerPosition();
		next();
	},
	mounted() {
		this.fetchPlayerPosition();

		if (this.customText) {
			this.customText = this.customText.replace(/\n/g, '<br>');
		}
	}
});
</script>

<style lang="scss" scoped>
.profil {
	background:
		url('../../assets/design/info_header.webp') no-repeat,
		url('../../assets/design/info_footer.webp') no-repeat,
		url('../../assets/design/info_center.webp') repeat-y;
	background-position-y: top, bottom;
	width: 305px;
	margin-bottom: 10px;
	text-shadow: 1px 1px 1px #383522;

	h3 {
		display: flex;
		justify-content: space-evenly;
		padding-top: 3px;
		font-family: Arial, sans-serif;
		font-size: 10pt;
		font-style: normal;
		font-variant-caps: small-caps;
		font-weight: 400;
		text-align: center;
		color: #ffee92; //!important;
		text-shadow: 1px 1px 1px #383522;
		img {
			height: 7px;
			width: 7px;
			padding-top: 5px;
		}
	}
	.option {
		color: #ffee92;
		margin-left: 30px;
		margin-right: 30px;
		margin-top: 10px;
		font-size: 9pt;
		font-weight: bold;
		font-variant: small-caps;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	dl {
		// position: absolute;
		width: 245px;
		margin-left: 30px;
		margin-top: 10px;
		dt {
			float: left;
			position: relative;
			width: 135px;
			height: 19px;
			font-weight: bold;
			font-size: 9pt;
			font-variant: small-caps;
			color: #ffee92;
		}
		dd {
			min-height: 19px;
			height: auto;
			font-size: 10pt;
			text-align: right;
			color: #fce3bb;
			a {
				color: white;
				font-weight: normal;
				text-decoration: underline;
				cursor: pointer;
			}
		}
	}
}
.editTexte {
	width: 245px;
	height: 167px;
	overflow: auto;
	margin: 27px;
	margin-top: auto;
	margin-bottom: 10px;
	margin-top: 5px;
	position: relative;
	font-size: 8pt;
	background-color: #9a4029;
	border: 1px solid #fbdfba;
	color: #fce3bb;
	line-height: 20px;
	padding-left: 5px;
}
.profilContent {
	// top: 105px;
	width: 245px;
	height: 167px;
	overflow: auto;
	margin: auto;
	margin-top: auto;
	margin-bottom: 10px;
	margin-top: 5px;
	position: relative;
	font-size: 8pt;
	background-color: #9a4029;
	border: 1px solid #fbdfba;
}
.contentTexte {
	color: #fce3bb;
	line-height: 20px;
	padding-left: 5px;
}
.buttonLand {
	align-items: flex-start;
	flex-grow: row;
	justify-content: space-around;
	flex-wrap: wrap;
	display: flex;
	left: 25px;
	width: 250px;
	height: auto;
	margin: auto;
	margin-bottom: auto;
	align-items: center;
	margin-bottom: 5px;
	* {
		margin-bottom: 5px;
	}

	.lb-button {
		display: flex;
		a {
			margin-bottom: 0;
			width: 100%;
		}
	}
}
.smallbutton {
	background-image: url('../../assets/design/button_small.webp');
	font-size: 9pt;
	line-height: 7pt;
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
	&:hover {
		background-image: url('../../assets/design/button_small_hover.webp');
	}
}
.tinybutton {
	padding-left: 5px;
	padding-right: 5px;
	padding-top: 2px;
	padding-bottom: 2px;
	color: #ffee92 !important;
	font-size: 9pt;
	font-variant: small-caps;
	border: 1px solid #ffee92;
	outline: 1px solid #bc683c;
	background-color: #d65536;
	cursor: pointer;
	display: inline;
	top: 7px;
	width: 60px;
	text-align: center;
	text-transform: uppercase;
	font-size: 7.5pt;
	font-variant: normal;
	&:hover {
		color: white !important;
		background-color: #b0dd00 !important;
	}
}

.fade-enter-active {
	transition: all 1s 0.2s;
}

.fade-enter-from,
.fade-leave-to {
	transform: rotateY(-180deg);
	opacity: 0;
}
</style>
