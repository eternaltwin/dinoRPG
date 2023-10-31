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
				<a href="">{{ accountData.rank }}</a> ({{ accountData.pointCount }}
				points)
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
				{{ $t(`myAccount.dojo`) }}
			</dt>
			<dd>PlaceHolder</dd>
		</dl>
		<div class="profilContent" v-if="!isEditOn">
			<div v-html="customText" class="contentTexte" />
		</div>
		<textarea v-if="isEditOn" v-model="customTextEdit" class="editTexte" />
		<div class="buttonLand" v-if="isMyAccount()">
			<a v-if="hasPlume() && isEditOn" @click="setCustomText(customTextEdit)" class="tinybutton">OK</a>
			<a v-if="hasPlume() && !isEditOn" @click="isEditOn = true" class="tinybutton">{{ $t(`myAccount.edit`) }}</a>
			<a class="smallbutton">{{ $t(`myAccount.editAccount`) }}</a>
			<a class="smallbutton">{{ $t(`myAccount.quest`) }}</a>
			<p v-if="hasImport()" class="smallbutton" @click="getCode()">
				{{ $t(`myAccount.import`) }}
			</p>
			<ImportAccount v-if="openPopinImport" @closePopin="closePopin" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { epicList } from '../../constants/index.js';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import EventBus from '../../events/index.js';
import ImportAccount from '../../components/data/ImportAccount.vue';
import { PlayerService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { sessionStore } from '../../store/index.js';

export default defineComponent({
	name: 'Profile',
	components: {
		ImportAccount
	},
	data() {
		return {
			sessionStore: sessionStore(),
			openPopinImport: false as boolean,
			isEditOn: false as boolean,
			customText: this.accountData?.customText as string | null,
			customTextEdit: this.accountData?.customText as string | null,
			channel: import.meta.env.VITE_API_RELEASE_CHANNEL as string
		};
	},
	props: {
		accountData: {
			type: Object as PropType<PlayerInfo>
		}
	},
	methods: {
		getCode(): void {
			let server: string;
			let API: number;
			console.log(this.channel);
			switch (this.channel) {
				case 'development':
					server = 'http://localhost:8080';
					API = 425;
					break;
				case 'dinorpg.staging':
					server = 'https://staging.dinorpg.eternaltwin.org';
					API = 408;
					break;
				case 'dinorpg.production':
					server = 'https://dinorpg.eternaltwin.org';
					API = 423;
					break;
				default:
					server = 'http://localhost:8080';
					API = 425;
					break;
			}
			window.open(
				`https://twinoid.com/oauth/auth?response_type=code&client_id=${API}&redirect_uri=${server}/import&scope=rockfaller.com+mush.twinoid.com+mush.twinoid.es+arkadeo_plays+arkadeo.com+mush_ship_data+mush.vg+www.zombinoia.com+www.dieverdammten.de+www.die2nite.com+www.hordes.fr+applications+groups+contacts+www.dinorpg.com+es.dinorpg.com+en.dinorpg.com&state=authentification`,
				'_self'
			);
		},
		hasPlume(): boolean {
			return this.accountData!.epicRewards.includes(epicList.id.plume);
		},
		isMyAccount(): boolean {
			return this.sessionStore.getPlayerId === parseInt(this.$route.params.id as string);
		},
		closePopin(): void {
			this.openPopinImport = false;
		},
		hasImport(): boolean {
			return !this.accountData!.epicRewards.includes(epicList.id.import);
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
		}
	},
	mounted() {
		if (this.customText) {
			this.customText = this.customText.replace(/\n/g, '<br>');
		}
	}
});
</script>

<style lang="scss" scoped>
.profil {
	background: url('../../assets/design/info_header.webp') no-repeat,
		url('../../assets/design/info_footer.webp') no-repeat, url('../../assets/design/info_center.webp') repeat-y;
	background-position-y: top, bottom;
	height: auto;
	width: 304px;
	margin-bottom: 10px;
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
}
.smallbutton {
	background-image: url('../../assets/design/button_small.webp');
	padding-top: 4px;
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
