<template>
	<div class="wrapper">
		<div class="requests-container" v-if="joinRequestsList && joinRequestsList.length > 0 && selfMember">
			<h4>{{ $t('clansMembers.request.title') }}</h4>
			<h5 v-if="clanMembersList.length >= maxMembers">
				{{ $t('clansMembers.request.maximum') }}
			</h5>
			<div class="request-line" v-for="request in joinRequestsList" :key="request.id">
				<div class="request-date">{{ new Date(request.date).toLocaleString('fr-FR') }}</div>
				<img :src="getImgURL('icons', 'small_follow')" alt="info_button" style="margin-right: 2px" />
				<div>
					<span class="player-name" @click="goToPlayer(request.playerId)">{{ request.player.name }}</span>
					{{ $t('clansMembers.request.line') }}
				</div>
				<div class="request-buttons">
					<button
						class="accept"
						@click="acceptRequest(request.id)"
						v-if="hasAcceptAndDenyRequestsRight && clanMembersList.length < maxMembers"
					>
						{{ $t('clansMembers.request.accept') }}
					</button>
					<button class="deny" @click="denyRequest(request.id)" v-if="hasAcceptAndDenyRequestsRight">
						{{ $t('clansMembers.request.deny') }}
					</button>
				</div>
			</div>
		</div>
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('clansMembers.th.name') }}</th>
					<th class="donation">{{ $t('clansMembers.th.donation') }}</th>
					<th class="stats" v-if="selfMember">{{ $t('clansMembers.th.stats') }}</th>
					<th class="actions" v-if="selfMember">{{ $t('clansMembers.th.actions') }}</th>
				</tr>
				<tr v-for="member in clanMembersList" :key="member.id" :class="(member.id + 1) % 2 === 0 ? 'even' : ''">
					<td class="name-column" @click="goToPlayer(member.player.id)">
						<div class="name-container">
							<img
								src="\src\assets\icons\crown.png"
								alt="rank"
								v-if="member.player.leaderOf?.id"
								v-tippy="{
									content: $t('clan.icons.crown'),
									theme: 'small'
								}"
							/>
							<div class="name">{{ member.player.name }}</div>
							<div class="nickname">{{ member.nickname }}</div>
						</div>
					</td>
					<td class="donation other">
						{{ moneyLint(member.donation) }}
						<img
							:src="getImgURL('icons', 'small_gold')"
							alt="gold"
							v-tippy="{
								content: formatContent($t('clan.icons.gold')),
								theme: 'small'
							}"
						/>
					</td>
					<td class="stats other" v-if="selfMember">
						<img
							src="\src\assets\icons\small_hourglass.webp"
							alt="lastLogin"
							v-tippy="{
								content: $t('clansMembers.stat.last_login', { date: dateToString(member.player?.lastLogin) }),
								theme: 'small'
							}"
						/>
					</td>
					<td class="actions other" v-if="selfMember">
						<div class="buttons">
							<button class="edit" v-if="hasEditRight" @click="goToMemberEdit(member.id)">
								{{ $t('clansMembers.action.edit') }}
							</button>
							<button
								class="exclude"
								v-if="hasExcludeRight && !member.player?.leaderOf?.id"
								@click="excludeMember(member.id)"
							>
								{{ $t('clansMembers.action.exclude') }}
							</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<a class="button" @click="leaveClan()" v-if="selfMember && !selfMember?.player?.leaderOf?.id">
			{{ $t('clansMembers.action.leave') }}
		</a>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { ClanJoinRequest } from '@drpg/core/models/clan/clanJoinRequest';
import { ClanMember } from '@drpg/core/models/clan/clanMember';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import EventBus from '../../events/index.js';
import { errorHandler, utils } from '../../utils/index.js';
import { ClanService } from '../../services/ClanService.js';
import { playerStore } from '../../store';
import { CLAN_MAX_MEMBERS_AMOUNT } from '@drpg/core/constants';

export default defineComponent({
	name: 'ClanMembers',
	components: {},
	data() {
		return {
			clanMembersList: {} as Array<ClanMember>,
			joinRequestsList: {} as Array<ClanJoinRequest>,
			playerStore: playerStore(),
			hasEditRight: false as boolean,
			hasExcludeRight: false as boolean,
			hasAcceptAndDenyRequestsRight: false as boolean,
			selfMember: undefined as ClanMember | undefined,
			maxMembers: CLAN_MAX_MEMBERS_AMOUNT
		};
	},
	methods: {
		moneyLint(quantity: number): string {
			return utils.beautifulNumber(quantity.toString());
		},
		goToPlayer(_id: string): void {
			this.$router.push({ name: 'MyAccount', params: { id: _id } });
		},
		goToMemberEdit(_id: number): void {
			this.$router.push({ name: 'ClanMemberEdit', params: { memberId: _id } });
		},
		getHasRight(right: ClanMemberRight) {
			const member = this.clanMembersList.find(m => m.player.id == this.playerStore.playerId);
			if (!member) {
				return false;
			}
			return (
				member.clan.id == +this.$route.params.id &&
				(member.rights.includes(ClanMemberRight[right]) || member.player.leaderOf?.id == +this.$route.params.id)
			);
		},
		dateToString(date: Date) {
			return date.toLocaleString('fr-FR');
		},
		async getClanMembersList(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.clanMembersList = await ClanService.getClanMembersList(Number(this.$route.params.id));
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async getJoinRequestsList(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.joinRequestsList = await ClanService.getJoinRequestslist(Number(this.$route.params.id));
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async acceptRequest(id: number): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				await ClanService.acceptJoinClanRequest(id);
				await this.getJoinRequestsList();
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async denyRequest(id: number): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				await ClanService.denyJoinClanRequest(id);
				await this.getJoinRequestsList();
				EventBus.emit('refreshMoney', true);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async excludeMember(id: number): Promise<void> {
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				EventBus.emit('isLoading', true);
				try {
					await ClanService.excludeClanMember(Number(this.$route.params.id), id);
					await this.getClanMembersList();
					await this.getJoinRequestsList();
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err, this.$toast, this.$t);
					return;
				}
			}
		},
		async leaveClan() {
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				EventBus.emit('isLoading', true);
				try {
					await ClanService.leaveClanSelf();
					this.playerStore.setClanId(undefined);
					EventBus.emit('isLoading', false);
					this.$router.push({ name: 'Clan', params: { id: Number(this.$route.params.id) } });
				} catch (err) {
					errorHandler.handle(err, this.$toast, this.$t);
					return;
				}
			}
		}
	},
	async mounted(): Promise<void> {
		await this.getClanMembersList();
		this.hasEditRight = this.getHasRight(ClanMemberRight.MEMBER_EDIT);
		this.hasExcludeRight = this.getHasRight(ClanMemberRight.MEMBER_EXCLUDE);
		this.hasAcceptAndDenyRequestsRight = this.getHasRight(ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS);
		this.selfMember = this.clanMembersList.find(member => member.player.id == this.playerStore.playerId);
		await this.getJoinRequestsList();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	width: auto;
	table {
		width: 100%;
		margin-top: 10px;
		margin-bottom: 5px;
		margin-bottom: 10px;
		border: 2px solid #f3d6b1;
		background-color: #ecbd84;
		border-collapse: separate;
		border-spacing: 1px;
		tr {
			display: table-row;
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
				background-image: url('../../assets/background/table_header.webp');
				background-position: left bottom;
				max-width: 222px;
				&.name {
					width: 50%;
				}
				&.donations {
					width: 15%;
				}
				&.stats {
					width: 10%;
				}
				&.actions {
					width: 25%;
				}
			}
			td {
				font-size: 9pt;
				padding-right: 5px;
				padding-top: 1px;
				padding-bottom: 1px;
				color: #710;
				background-color: #f3ca92;
				border: 1px solid #c88f44;
				&.name-column {
					background-image: url('../../assets/background/table_cell.webp');
					background-position: 0px 0px;
					padding-left: 1.2em;
					&:hover {
						color: white;
						border-color: #9a4029;
						cursor: pointer;
					}
					.name-container {
						display: flex;
						align-items: baseline;
						gap: 8px;
						.nickname {
							font-style: italic;
							color: #a07031;
							font-size: 10px;
						}
					}
				}
				&.other {
					padding-left: 1em;
					background-image: url('../../assets/background/table_cell.webp');
					background-position: -10px 0px;
					max-width: 4px;
				}
				&.actions {
					.buttons {
						display: flex;
						flex-wrap: wrap;
						gap: 4px;
						button {
							border: none;
							padding: 2px 8px;
							border-radius: 8px;
							&.edit {
								background-color: rgb(228, 228, 228);
							}
							&.exclude {
								background-color: red;
							}
							&:hover {
								filter: brightness(80%);
								cursor: pointer;
							}
						}
					}
				}
			}
			&.even {
				td.name {
					background-image: url('../../assets/background/table_cell_even.webp');
					background-position: 0px 0px;
				}
				td.other {
					background-image: url('../../assets/background/table_cell_even.webp');
					background-position: -10px 0px;
				}
			}
		}
	}
}

.requests-container {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 4px;
	h4 {
		margin: 0;
	}
	h5 {
		margin: 0;
		font-weight: 100;
		font-size: 12px;
		font-style: italic;
		color: grey;
	}
	.request-line {
		display: flex;
		align-items: center;
		.request-date {
			padding-right: 8px;
		}
		.player-name {
			font-weight: bold;
			color: #383522;
			&:hover {
				color: #fff798;
				cursor: pointer;
			}
		}
		.request-buttons {
			display: flex;
			gap: 8px;
			padding: 0 8px;
			button {
				border: none;
				padding: 4px 8px;
				border-radius: 8px;
				&.accept {
					background-color: green;
				}
				&.deny {
					background-color: red;
				}
				&:hover {
					filter: brightness(120%);
					color: white;
					cursor: pointer;
				}
			}
		}
	}
}
</style>
