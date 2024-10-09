<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="clan-header bg-cover sm:bg-contain">
		<h3 class="mt-[-5px] sm:mt-0">
			<img :src="getImgURL('design', 'info_button')" alt="info_button" style="margin-right: 10px" />
			{{ $t('clan.header.infos') }}
			<img :src="getImgURL('design', 'info_button')" alt="info_button" style="margin-left: 10px" />
		</h3>
		<div class="mt-[5px] flex gap-3 text-[14px] sm:ml-[45px] sm:mt-[10px] md:mt-[5px] lg:mt-0">
			<div class="flex items-center gap-1 rounded-lg bg-[#bc683c] p-1 text-white">
				<img
					:src="getImgURL('design', 'small_member')"
					alt="members"
					v-tippy="{
						content: formatContent($t('clan.icons.members')),
						theme: 'small'
					}"
				/>
				{{ clan?.members?.length }} / {{ maxMembers }}
			</div>
			<div class="flex items-center gap-1 rounded-lg bg-[#bc683c] p-1 text-white">
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
			<!-- CDC
				<div class="flex items-center gap-1 rounded-lg bg-[#bc683c] p-1 text-white">
				<img
					src="\src\assets\icons\crown.png"
					alt="rank"
					v-tippy="{
						content: formatContent($t('clan.icons.rank')),
						theme: 'small'
					}"
				/>
				Bronze
			</div>-->
		</div>
		<div
			class="mx-auto sm:max-w-[600px] md:max-w-[570px] lg:max-w-[448px]"
			style="border: 2px solid #fff798"
			v-if="clan && clan.id > 0"
		>
			<img class="h-auto w-full" :src="`${API_BASE}/clan/${clan.id}/banner`" alt="Clan banner" />
		</div>
		<div class="bottom-info flex">
			<p class="text-[12px]">{{ $t('clan.header.creation_date', { date: DateToString(clan?.creationDate) }) }}</p>
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
.clan-header {
	background:
		url('/src/assets/design/clan_banner_header.webp') no-repeat,
		url('/src/assets/design/clan_banner_footer.webp') no-repeat,
		url('/src/assets/design/clan_banner_center.webp') repeat-y;
	background-position-y: top, bottom;
	background-size: contain;
	min-width: 100%;
	margin-bottom: 20px;
	h3 {
		display: flex;
		justify-content: center;
		padding-top: 1px;
		font-size: 10pt;
		font-style: normal;
		font-variant-caps: small-caps;
		font-weight: 400;
		text-align: center;
		color: #ffee92;
		text-shadow: 1px 1px 1px #383522;
		img {
			height: 7px;
			width: 7px;
			margin-top: 5px;
		}
	}
}
.bottom-info {
	margin: 0 45px;
	justify-content: space-between;
	color: #fff798;
	padding-top: 1px;
	padding-bottom: 15px;
	font-size: 14px;
	.leader-name {
		display: flex;
		gap: 4px;
		align-items: center;
		span {
			color: #fff798;
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
