<template>
	<div class="header">
		<h3>
			<img :src="getImgURL('design', 'info_button')" alt="info_button" style="margin-right: 10px" />
			{{ $t('clan.header.infos') }}
			<img :src="getImgURL('design', 'info_button')" alt="info_button" style="margin-left: 10px" />
		</h3>

		<div class="top-info">
			<div class="top-info-element">
				<img
					:src="getImgURL('design', 'small_member')"
					alt="members"
					v-tippy="{
						content: formatContent($t('clan.icons.members')),
						theme: 'small'
					}"
				/>
				{{ clan?.members?.length }}/{{ maxMembers }}
			</div>
			<div class="top-info-element">
				<img
					:src="getImgURL('icons', 'small_gold')"
					alt="gold"
					v-tippy="{
						content: formatContent($t('clan.icons.gold')),
						theme: 'small'
					}"
				/>
				{{ moneyLint(clan?.treasureValue ?? 0) }}
			</div>
			<div class="top-info-element">
				<img
					src="\src\assets\icons\crown.png"
					alt="rank"
					v-tippy="{
						content: formatContent($t('clan.icons.rank')),
						theme: 'small'
					}"
				/>
				Bronze
			</div>
		</div>
		<div class="banner" v-if="clan && clan.id > 0">
			<img class="banner-img" :src="`${API_BASE}/clan/${clan.id}/banner`" alt="banner" />
		</div>
		<div class="bottom-info">
			<p class="creation-date">{{ $t('clan.header.creation_date', { date: DateToString(clan?.creationDate) }) }}</p>
			<div class="leader-name">
				<DZUser :user="clan.leader" leader />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Clan } from '@drpg/core/models/clan/clan';
import { CLAN_MAX_MEMBERS_AMOUNT } from '@drpg/core/constants';
import { API_BASE, utils } from '../../utils/index.js';
import DZUser from '../common/DZUser.vue';

export default defineComponent({
	name: 'ClanHeader',
	props: {
		clan: { type: Object as PropType<Clan>, required: true }
	},
	data() {
		return {
			API_BASE,
			maxMembers: CLAN_MAX_MEMBERS_AMOUNT,
			teeeest: ''
		};
	},
	components: { DZUser },
	methods: {
		moneyLint(quantity: number): string {
			return utils.beautifulNumber(quantity.toString());
		},
		DateToString(date: Date): string {
			return new Date(date).toLocaleString('fr-FR');
		}
	}
});
</script>

<style lang="scss" scoped>
.header {
	//background-size: 550px;
	height: auto;
	max-height: 600px;
	//overflow: hidden;
	margin-bottom: 10px;
	background: url('../../assets/background/desc_shop_top_left.webp'),
		url('../../assets/background/desc_shop_top_right.webp'), url('../../assets/background/desc_shop_top_center.webp'),
		url('../../assets/background/desc_shop_bottom_left.webp'),
		url('../../assets/background/desc_shop_bottom_right.webp'),
		url('../../assets/background/desc_shop_bottom_center.webp'),
		url('../../assets/background/desc_shop_center_left.webp'),
		url('../../assets/background/desc_shop_center_right.webp'),
		url('../../assets/background/desc_shop_center_center.webp');
	background-position-x: left, right, center, left, right, center, left, right, center;
	background-position-y: top, top, top, bottom, bottom, bottom, 35px, 35px, 35px;
	background-repeat: no-repeat, no-repeat, repeat-x, no-repeat, no-repeat, repeat-x, repeat-y, repeat-y, repeat;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
	h3 {
		display: flex;
		justify-content: center;
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
}

.banner {
	max-width: 95%;
	height: 100px;
	border: 1px solid #fff798;
	.banner-img {
		width: 100%;
		height: 100%;
	}
}

.top-info {
	//margin-left: 65px;
	display: flex;
	padding-top: 5px;
	padding-bottom: 1px;
	font-size: 14px;
	.top-info-element {
		background-color: #bc683c;
		color: white;
		padding: 0 2px;
		margin-right: 15px;
	}
}

.bottom-info {
	//margin: 0 65px;
	width: 100%;
	display: flex;
	justify-content: space-around;
	color: #fff798;
	padding-top: 1px;
	padding-bottom: 15px;
	font-size: 14px;
	.creation-date {
		font-size: 12px;
	}
	.leader-name {
		display: flex;
		gap: 4px;
		align-items: center;
		span {
			color: #fff798;
			font-family: Arial, sans-serif;
			font-size: 10pt;
			font-style: normal;
			font-variant-caps: small-caps;
			font-weight: 400;
			text-shadow: 1px 1px 1px #383522;
			&:hover {
				color: #383522;
				text-shadow: 1px 1px 1px #fff798;
				cursor: pointer;
			}
		}
	}
}
</style>
