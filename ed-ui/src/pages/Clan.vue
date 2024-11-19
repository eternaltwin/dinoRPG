<template>
	<TitleHeader :title="`${$t('pageTitle.clan')}${clan.name} ]`" :header="$t('clan.header.title', { name: clan.name }"></TitleHeader>
	<div class="wrapper">
		<div class="filler">
			<ClanHeader :clan="clan" v-if="clan"></ClanHeader>
		</div>
	</div>

	<!-- Pages du clan (à faire dans un composant à part)-->
	<div class="pages topspace">
		<h3>
			<img :src="getImgURL('design', 'info_button')" alt="info_button" style="margin-right: 10px" />
			{{ $t('clan.tabs.pages') }}
			<img :src="getImgURL('design', 'info_button')" alt="info_button" style="margin-left: 10px" />
		</h3>
		<div class="tabs-list">
			<div
				:class="tabSelected === 1 ? 'tab selected' : 'tab'"
				@click="setTab(1)"
				v-tippy="{
					content: formatContent($t('clan.tabs.pages')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('icons', 'act_sun')" alt="Pages du clan" />
			</div>
			<div
				:class="tabSelected === 2 ? 'tab selected' : 'tab'"
				@click="setTab(2)"
				v-tippy="{
					content: formatContent($t('clan.tabs.members')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('icons', 'act_clan')" alt="Liste des membres" />
			</div>
			<div
				v-if="isClanMember"
				:class="tabSelected === 3 ? 'tab selected' : 'tab'"
				@click="setTab(3)"
				v-tippy="{
					content: formatContent($t('clan.tabs.treasure')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('icons', 'act_treasure')" alt="Trésor de clan" />
			</div>
			<div
				v-if="isClanMember"
				:class="tabSelected === 4 ? 'tab selected' : 'tab'"
				@click="setTab(4)"
				v-tippy="{
					content: formatContent($t('clan.tabs.war')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('icons', 'act_attack')" alt="Infos de guerre" />
			</div>
			<div
				v-if="isClanMember"
				:class="tabSelected === 5 ? 'tab selected' : 'tab'"
				@click="setTab(5)"
				v-tippy="{
					content: formatContent($t('clan.tabs.discussion')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('icons', 'act_talk')" alt="Fil de discussion" />
			</div>
			<div
				v-if="isClanMember"
				:class="tabSelected === 6 ? 'tab selected' : 'tab'"
				@click="setTab(6)"
				v-tippy="{
					content: formatContent($t('clan.tabs.history')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('icons', 'act_save')" alt="Historique du clan" />
			</div>
			<div
				v-if="isClanMember && hasBannerEditRight"
				:class="tabSelected === 7 ? 'tab selected' : 'tab'"
				@click="setTab(7)"
				v-tippy="{
					content: formatContent($t('clan.tabs.parameters')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('icons', 'act_gather')" alt="Paramètres du clan" />
			</div>
		</div>
		<div class="clan-page">
			<Router-view></Router-view>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TitleHeader from '../components/utils/TitleHeader.vue';

import ClanHeader from '../components/clans/ClanHeader.vue';

import EventBus from '../events/index.js';
import { ClanService } from '../services/ClanService.js';
import { errorHandler } from '../utils/errorHandler.js';
import { Clan } from '@drpg/prisma';

import { playerStore } from '../store/index.js';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';

export default defineComponent({
	name: 'Clan',
	components: {
		ClanHeader,
		TitleHeader
	},
	data() {
		return {
			tabSelected: 1 as number,
			clan: {} as Clan,
			playerStore: playerStore(),
			isClanMember: false as boolean,
			hasBannerEditRight: false as boolean
		};
	},
	methods: {
		setTab(value: number) {
			this.tabSelected = value;
			//TODO: directement utiliser tabSelected = string, comme ça pas besoin du switch case, juste un router.push(selectedTab)
			switch (value) {
				case 1:
					this.$router.push({ name: 'Clan', params: { id: this.clan.id } });
					break;
				case 2:
					this.$router.push({ name: 'ClanMembers' });
					break;
				case 3:
					this.$router.push({ name: 'ClanTreasure' });
					break;
				case 4:
					this.$router.push({ name: 'ClanWar' });
					break;
				case 5:
					this.$router.push({ name: 'ClanDiscussion' });
					break;
				case 6:
					this.$router.push({ name: 'ClanHistory' });
					break;
				case 7:
					this.$router.push({ name: 'ClanParameters' });
					break;
			}
		},
		async getClan(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.clan = await ClanService.getClan(Number(this.$route.params.id));
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async getHasBannerEditRight() {
			try {
				this.hasBannerEditRight = await ClanService.getPlayerHasRight(
					Number(this.$route.params.id),
					ClanMemberRight[ClanMemberRight.CLAN_EDIT_BANNER]
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		}
	},
	mounted(): void {
		this.isClanMember = this.playerStore.clanId == Number(this.$route.params.id);
	},
	async created(): Promise<void> {
		await this.getClan();
		await this.getHasBannerEditRight();
	},
	watch: {
		// Reload page if player goes on another clan page
		'$route.params.id': async function (to) {
			if (to !== undefined && this.$route.name === 'Clan') {
				await this.getClan();
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	display: flex;
	width: 620px;
	justify-content: space-between;
	gap: 10px;
	flex-wrap: wrap;
}
.filler {
	height: 180px;
	width: 550px;
}

.topspace {
	margin-top: 25px;
}

.tabs-list {
	margin-left: 10px;
	display: flex;
	padding-top: 5px;
	font-size: 14px;
	.tab {
		padding: 0 2px;
		&:hover {
			cursor: pointer;
		}
	}
	img:hover {
		filter: brightness(1.2);
	}
	img {
		width: 32px;
		height: 32px;
	}
	.selected {
		background-color: #f3ca92;
	}
}

.pages {
	background:
		url('/src/assets/design/clan_pages_header.webp') no-repeat,
		url('/src/assets/design/clan_pages_footer.webp') no-repeat,
		url('/src/assets/design/clan_pages_center.webp') repeat-y;
	background-position-y: top, bottom;
	background-size: 674px;
	width: 674px;
	height: auto;
	max-height: none;
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
</style>
