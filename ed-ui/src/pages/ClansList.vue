<template>
	<TitleHeader :title="$t('pageTitle.clansList')"></TitleHeader>
	<div class="section ml-[-25px] mt-[-30px] sm:ml-0 sm:mt-0">
		<div class="titlePage">
			<h3>{{ $t('clansList.title') }}</h3>
		</div>
	</div>
	<div class="disclaimer ml-[-40px] sm:ml-0">
		<span>
			<img :src="getImgURL('icons', 'small_question')" alt="info_button" style="margin-right: 2px" />
			{{ $t(`clansList.disclaimer.text`) }}
			<a class="cursor-pointer text-[#fff192] underline" @click="goToHelp()">{{
				$t(`clansList.disclaimer.see_help`)
			}}</a>
			&
			<a class="cursor-pointer text-[#fff192] underline">{{ $t(`clansList.disclaimer.see_ranking`) }}</a>
		</span>
	</div>
	<div class="disclaimer ml-[-40px] sm:ml-0" v-if="joinRequest">
		<span>
			<p>
				{{ $t('clanPages.request.info') }}
				<a class="cursor-pointer text-[#fff192] underline" @click="goToClan(joinRequest.clan.id)">{{
					joinRequest.clan.name
				}}</a
				>.
			</p>
			<p>
				<a class="cursor-pointer text-[#fff192] underline" @click="cancelRequest(joinRequest)">{{
					$t('clanPages.request.cancel')
				}}</a>
			</p>
		</span>
	</div>
	<table class="ml-[-45px] sm:ml-0">
		<tbody>
			<tr>
				<th>{{ $t('clansList.th.name') }}</th>
				<th>{{ $t('clansList.th.leader') }}</th>
				<th>{{ $t('clansList.th.members') }}</th>
				<th class="hidden pt-[14px] sm:block">{{ $t('clansList.th.date') }}</th>
			</tr>
			<tr @click="changePage(-1)" v-if="page > 1">
				<td
					class="bg-[url('./assets/background/table_cell_even.webp')] pl-[1.2em]"
					colspan="5"
					style="text-align: center"
				>
					{{ $t('ranking.page.previous') }}
				</td>
			</tr>
			<tr v-for="clan in clansList" :key="clan.id" @click="goToClan(clan.id)">
				<td class="bg-[url('./assets/background/table_cell_even.webp')] pl-[1.2em]">
					{{ clan.name }}
				</td>
				<td class="bg-[url('./assets/background/table_cell_even.webp')] bg-[-10px] pl-[1.2em]">
					{{ clan.leader.name }}
				</td>
				<td class="bg-[url('./assets/background/table_cell_even.webp')] bg-[-10px] pl-[1.2em]">
					{{ clan.members.length }}
				</td>
				<td class="hidden bg-[url('./assets/background/table_cell_even.webp')] bg-[-10px] pl-[1.2em] sm:block">
					{{ dateToString(clan.creationDate) }}
				</td>
			</tr>
		</tbody>
		<tr @click="changePage(1)" v-if="clansList.length >= 20">
			<td
				class="bg-[url('./assets/background/table_cell_even.webp')] pl-[1.2em]"
				colspan="5"
				style="text-align: center"
			>
				{{ $t('ranking.page.next') }}
			</td>
		</tr>
	</table>
	<div class="ml-[-40px] flex flex-col items-center justify-between sm:ml-0 sm:flex-row">
		<input
			type="text"
			class="m-0 placeholder:text-[#fce3bc]"
			v-model="searchClanName"
			:placeholder="$t('clansList.search')"
		/>
		<a class="button" @click="search()">
			{{ $t('clansList.button.search') }}
		</a>
		<a v-if="!alreadyHasClan && canCreateClan" class="button" @click="goToCreateClanPage()">
			{{ $t('clansList.button.create') }}</a
		>
		<div
			v-if="!alreadyHasClan && !canCreateClan"
			v-tippy="{
				content: cannotCreateText,
				theme: 'small'
			}"
		>
			<a class="button" :class="{ 'cursor-not-allowed grayscale': !canCreateClan }">
				{{ $t('clansList.button.create') }}
			</a>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TitleHeader from '../components/utils/TitleHeader.vue';
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';
import { ClanService } from '../services/index.js';
import { PlayerService } from '../services/index.js';
import { Clan, ClanJoinRequest } from '@drpg/prisma';
import { playerStore } from '../store';
import { CLAN_CREATE_MONEY, CLAN_CREATE_RANKING_POINTS } from '@drpg/core/constants';
import { formatNumber } from '../utils/formatText';
import { formatText } from '../utils/formatText.js';

export default defineComponent({
	name: 'ClansList',
	components: {
		TitleHeader
	},
	data() {
		return {
			clansList: {} as Array<Clan>,
			page: 1 as number,
			searchClanName: '' as string,
			joinRequest: undefined as ClanJoinRequest | undefined,
			playerStore: playerStore(),
			alreadyHasClan: true as boolean,
			canCreateClan: false as boolean,
			creationCost: formatNumber(CLAN_CREATE_MONEY, '.'),
			cannotCreateText: formatText(
				this.$t('clansList.cannot_create_info', {
					money: formatNumber(CLAN_CREATE_MONEY, '.'),
					points: CLAN_CREATE_RANKING_POINTS
				})
			)
		};
	},
	methods: {
		goToClan(_id: number): void {
			this.$router.push({ name: 'Clan', params: { id: _id } });
		},
		dateToString(date: string) {
			return new Date(date).toLocaleString('fr-FR');
		},
		goToCreateClanPage() {
			if (this.canCreateClan) {
				this.$router.push({
					name: 'CreateClan'
				});
			}
		},
		goToHelp() {
			this.$router.push({
				name: 'Help'
			});
		},
		async search() {
			this.page = 1;
			if (this.searchClanName != '') {
				await this.getClansListByName();
			} else {
				await this.getClansList();
			}
		},
		async changePage(n: number) {
			this.page += n;
			await this.getClansList();
		},
		async getClansList(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.clansList = await ClanService.getClansList(this.page);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async getClansListByName() {
			EventBus.emit('isLoading', true);
			try {
				this.clansList = await ClanService.searchClansByName(this.searchClanName, this.page);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async getPlayerJoinRequest() {
			try {
				this.joinRequest = await ClanService.getSelfJoinRequest();
			} catch (err) {
				if (err?.response?.status != 404) {
					errorHandler.handle(err, this.$toast, this.$t);
				}
				return;
			}
		},
		async cancelRequest(request: ClanJoinRequest) {
			EventBus.emit('isLoading', true);
			try {
				await ClanService.denyJoinClanRequest(request.id);
				this.joinRequest = undefined;
				EventBus.emit('refreshMoney', true);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		}
	},
	async created(): Promise<void> {
		await this.getClansList();
		await this.getPlayerJoinRequest();
		this.alreadyHasClan = this.playerStore.clanId != undefined;
		if (!this.alreadyHasClan) {
			this.canCreateClan = await PlayerService.getCanCreateClan();
		}
	}
});
</script>

<style lang="scss" scoped>
table {
	min-width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	margin-bottom: 10px;
	border: 2px solid #f3d6b1;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		cursor: help;
		width: 100%;
		th {
			font-size: 8pt;
			letter-spacing: 0pt;
			text-shadow: 1px 1px 0px #356847;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 8px;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;
		}
		td {
			font-size: 9pt;
			padding-right: 5px;
			padding-top: 1px;
			padding-bottom: 1px;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			cursor: pointer;
		}
		&:hover {
			td {
				background-image: url('../assets/background/table_cell.webp');
				color: white;
				border-color: #9a4029;
			}
		}
	}
}
input {
	width: 200px;
	height: 25px;
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 2px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	background-image: url('../assets/design/form_field.webp');
	background-repeat: no-repeat;
	background-color: transparent;
	outline: none;
}
</style>
