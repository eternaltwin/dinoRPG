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
			<img class="banner-img" :src="`${API_BASE}/clan/${clan.id}/banner`" alt="Clan banner" />
		</div>
		<div class="bottom-info">
			<p class="creation-date">{{ $t('clan.header.creation_date', { date: DateToString(clan?.creationDate) }) }}</p>
			<div class="leader-name">
				<img
					src="\src\assets\icons\crown.png"
					alt="rank"
					v-tippy="{
						content: formatContent($t('clan.icons.crown')),
						theme: 'small'
					}"
				/>
				<span @click="goToPlayer(clan?.leader?.id)">{{ clan?.leader?.name }}</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Clan } from '@drpg/prisma';
import { CLAN_MAX_MEMBERS_AMOUNT } from '@drpg/core/constants';
import { API_BASE, utils } from '../../utils/index.js';

export default defineComponent({
	name: 'ClanHeader',
	props: {
		clan: Object as PropType<Clan>
	},
	data() {
		return {
			API_BASE,
			maxMembers: CLAN_MAX_MEMBERS_AMOUNT,
			teeeest: ''
		};
	},
	components: {},
	methods: {
		moneyLint(quantity: number): string {
			return utils.beautifulNumber(quantity.toString());
		},
		DateToString(date: Date): string {
			return new Date(date).toLocaleString('fr-FR');
		},
		goToPlayer(id: number) {
			this.$router.push({ name: 'MyAccount', params: { id } });
		}
	}
});
</script>

<style lang="scss" scoped>
.header {
	background:
		url('/src/assets/design/clan_banner_header.webp') no-repeat,
		url('/src/assets/design/clan_banner_footer.webp') no-repeat,
		url('/src/assets/design/clan_banner_center.webp') repeat-y;
	background-position-y: top, bottom;
	background-size: 550px;
	height: auto;
	max-height: 600px;
	overflow: hidden;
	margin-bottom: 10px;
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
	width: 448px;
	height: 100px;
	margin-left: auto;
	margin-right: auto;
	border: 1px solid #fff798;
	.banner-img {
		width: 100%;
		height: 100%;
	}
}

.top-info {
	margin-left: 65px;
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
	margin: 0 65px;
	display: flex;
	justify-content: space-between;
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
