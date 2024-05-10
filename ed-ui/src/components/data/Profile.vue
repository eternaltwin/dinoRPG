<template class="profil">
	<div class="profil">
		<h3>
			<img :src="getImgURL('design', 'info_button')" alt="info_button" />
			{{ $t(`myAccount.profil`) }}
			<img :src="getImgURL('design', 'info_button')" alt="info_button" />
		</h3>
		<dl>
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
				<a v-if="playerPosition" href="/ranking" @click="goToRankingPage">{{ playerPosition }}</a>
				({{ accountData.pointCount }} points)
			</dd>
			<dt>
				{{ $t(`myAccount.inscription`) }}
			</dt>
			<dd>
				{{ accountData.subscribeAt }}
			</dd>
			<dt v-if="accountData.clan">
				{{ $t(`myAccount.clan`) }}
			</dt>
			<dd v-if="accountData.clan">
				{{ accountData.clan }}
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
			<DZButton>{{ $t(`myAccount.editAccount`) }}</DZButton>
			<DZButton v-if="hasPDA()">{{ $t(`myAccount.quest`) }}</DZButton>
			<DZButton @click="goLB()">{{ $t(`myAccount.labrute`) }}</DZButton>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { epicList } from '../../constants/index.js';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import EventBus from '../../events/index.js';
import { PlayerService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { playerStore } from '../../store/index.js';
import { goTo } from '../../utils/goTo.js';
import DZButton from '../common/DZButton.vue';

export default defineComponent({
	name: 'Profile',
	data() {
		return {
			playerStore: playerStore(),
			openPopinImport: false as boolean,
			isEditOn: false as boolean,
			customText: this.accountData?.customText as string | null,
			customTextEdit: this.accountData?.customText as string | null,
			channel: import.meta.env.VITE_API_RELEASE_CHANNEL as string,
			playerPosition: null as number | null
		};
	},
	components: {
		DZButton
	},
	props: {
		accountData: {
			type: Object as PropType<PlayerInfo>
		}
	},
	methods: {
		hasPlume(): boolean {
			return this.accountData!.epicRewards.includes(epicList.id.plume);
		},
		hasPDA(): boolean {
			return this.accountData!.epicRewards.includes(epicList.id.pda);
		},
		isMyAccount(): boolean {
			return this.playerStore.getPlayerId === parseInt(this.$route.params.id as string);
		},
		closePopin(): void {
			this.openPopinImport = false;
		},
		async goLB(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				const irma = await PlayerService.getLBRewards(parseInt(this.$route.params.id as string));
				EventBus.emit('isLoading', false);
				EventBus.emit('toast', { type: 'notif', message: this.$t(`toast.labrute`, { quantity: irma.quantity }) });
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		},
		async setCustomText(message: string): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				await PlayerService.setCustomText(message);
				EventBus.emit('isLoading', false);
				this.customText = message;
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
			this.isEditOn = false;
		},
		goToRankingPage(e: Event) {
			e.preventDefault();
			goTo(this.$router, 'Ranking');
		}
	},
	mounted() {
		// Fetch player position
		PlayerService.getPosition(+this.$route.params.id).then(({ position }) => {
			this.playerPosition = position;
		});

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
	height: auto;
	width: 305px;
	margin-bottom: 10px;
	margin-top: 9px;
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
	dl {
		// position: absolute;
		width: 245px;
		margin-left: 30px;
		margin-top: 10px;
		dt {
			float: left;
			position: relative;
			width: 85px;
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
</style>
