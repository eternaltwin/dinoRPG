<template class="profil">
	<div class="profil">
		<h3>
			<img :src="getImg('design', 'info_', 'button')" />
			{{ $t(`myAccount.profil`) }}
			<img :src="getImg('design', 'info_', 'button')" />
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
			<dd>
				PlaceHolder
			</dd>
		</dl>
		<div class="profilContent">
			<div class="contentTexte">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc lectus
				nulla, pellentesque quis velit ut, mattis sollicitudin purus.
				Suspendisse vel risus tincidunt, convallis nibh in, vulputate metus.
				Pellentesque pellentesque consequat arcu in vestibulum. Duis elementum
				est et lectus iaculis, quis fringilla odio dignissim. Proin hendrerit,
				leo eget venenatis rutrum, augue nisi auctor enim, quis pretium elit
				urna eu dui. In quis volutpat massa, ut vehicula lacus. Donec eu aliquet
				lectus, id dapibus lectus. Mauris elementum commodo augue, sit amet
				dictum nisi dignissim eget.
			</div>
		</div>
		<div class="buttonLand" v-if="isMyAccount()">
			<a v-if="hasPlume()" class="tinybutton">{{ $t(`myAccount.edit`) }}</a>
			<a class="smallbutton">{{ $t(`myAccount.editAccount`) }}</a>
			<a class="smallbutton">{{ $t(`myAccount.quest`) }}</a>
			<a class="smallbutton">{{ $t(`myAccount.import`) }}</a>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { epicList } from '@/constants';
import { PlayerInfo } from '@/models';
import store from '@/store';

export default defineComponent({
	name: 'Profile',
	props: {
		accountData: {
			type: Object as PropType<PlayerInfo>
		}
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.gif`);
		},
		hasPlume(): boolean {
			return this.accountData!.epicRewards.includes(epicList.id.plume);
		},
		isMyAccount(): boolean {
			return store.getters.getplayerId === parseInt(this.$route.params.id[0]);
		}
	}
});
</script>

<style lang="scss" scoped>
.profil {
	background: url('../../assets/design/info_header.gif') no-repeat,
		url('../../assets/design/info_footer.gif') no-repeat,
		url('../../assets/design/info_center.gif') repeat-y;
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
	background-image: url('~@/assets/design/button_small.gif');
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
		background-image: url('~@/assets/design/button_small_hover.gif');
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
