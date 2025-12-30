<template>
	<div class="wrapper">
		<div class="requests-container" v-if="joinRequestsList && joinRequestsList.length > 0 && selfMember">
			<table class="request-table">
				<tbody>
					<tr>
						<th colspan="4">
							<span>{{ $t('clansMembers.request.title') }}</span>
							<DZDisclaimer v-if="clanMembersList.length >= maxMembers">
								{{ $t('clansMembers.request.maximum') }}
							</DZDisclaimer>
						</th>
					</tr>
					<tr v-for="request in joinRequestsList" :key="request.id" :class="(request.id + 1) % 2 === 0 ? 'even' : ''">
						<td>
							{{ new Date(request.date).toLocaleString('fr-FR') }}
						</td>
						<td>
							<DZUser :user="request.player" />
						</td>
						<td>
							<DZButton
								class="accept"
								@click="acceptRequest(request.id)"
								v-if="hasAcceptAndDenyRequestsRight && clanMembersList.length < maxMembers"
							>
								<img :src="getImgURL('icons', 'small_follow')" alt="accept_icon" />
								{{ $t('clansMembers.request.accept') }}
							</DZButton>
						</td>
						<td>
							<DZButton class="deny" @click="denyRequest(request.id)" v-if="hasAcceptAndDenyRequestsRight">
								<img :src="getImgURL('icons', 'small_delete')" alt="deny_icon" />
								{{ $t('clansMembers.request.deny') }}
							</DZButton>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('clansMembers.th.name') }}</th>
					<th class="event" v-if="eventInProgress">{{ $t('clansMembers.th.event') }}</th>
					<th class="donations">{{ $t('clansMembers.th.donation') }}</th>
					<th class="stats" v-if="selfMember">{{ $t('clansMembers.th.stats') }}</th>
					<th class="actions" v-if="selfMember">{{ $t('clansMembers.th.actions') }}</th>
				</tr>
				<tr v-for="member in clanMembersList" :key="member.id" :class="(member.id + 1) % 2 === 0 ? 'even' : ''">
					<td class="name-column">
						<div class="name-container">
							<div class="name"><DZUser :user="member.player" :leader="!!member.player.leaderOf?.id" /></div>
							<div class="nickname">{{ member.nickname }}</div>
						</div>
					</td>
					<td v-if="eventInProgress" class="event other">
						{{ member.player.Events[0]?.totalProgression ?? 0 }}
					</td>
					<td class="donations other">
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
							<img
								:src="getImgURL('icons', 'edit')"
								alt="edit"
								v-if="hasEditRight && !member.player?.leaderOf?.id"
								@click="goToMemberEdit(member.id)"
								v-tippy="{
									content: $t('clansMembers.action.edit'),
									theme: 'small'
								}"
							/>
							<img
								:src="getImgURL('icons', 'small_delete')"
								alt="exclude"
								v-if="hasExcludeRight && !member.player?.leaderOf?.id"
								@click="excludeMember(member.id)"
								v-tippy="{
									content: $t('clansMembers.action.exclude'),
									theme: 'small'
								}"
							/>
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

import { ClanMember } from '@drpg/core/models/clan/clanMember';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import EventBus from '../../events/index.js';
import { errorHandler, utils } from '../../utils/index.js';
import { ClanService } from '../../services/ClanService.js';
import { playerStore } from '../../store';
import { CLAN_MAX_MEMBERS_AMOUNT } from '@drpg/core/constants';
import DZUser from '../common/DZUser.vue';
import { JoinRequestListResponse } from '@drpg/core/models/clan/clanJoinRequest';
import { currentEvents } from '@drpg/core/models/event/Events';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import DZButton from '../common/DZButton.vue';

export default defineComponent({
	name: 'ClanMembers',
	components: { DZUser, DZDisclaimer, DZButton },
	data() {
		return {
			clanMembersList: [] as ClanMember[],
			joinRequestsList: [] as JoinRequestListResponse,
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
		goToMemberEdit(_id: number): void {
			this.$router.push({ name: 'ClanMemberEdit', params: { memberId: _id } });
		},
		getHasRight(right: ClanMemberRight) {
			const member = this.clanMembersList.find(m => m.player.id === this.playerStore.playerId);
			if (!member) {
				return false;
			}
			return (
				member.clan.id === +this.$route.params.id &&
				(member.rights.includes(ClanMemberRight[right]) || member.player.leaderOf?.id === +this.$route.params.id)
			);
		},
		dateToString(date: Date | string) {
			return new Date(date).toLocaleString('fr-FR');
		},
		async getClanMembersList(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.clanMembersList = await ClanService.getClanMembersList(Number(this.$route.params.id));
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async getJoinRequestsList(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.joinRequestsList = await ClanService.getJoinRequestslist(Number(this.$route.params.id));
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async acceptRequest(id: number): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				const newMember = await ClanService.acceptJoinClanRequest(id);
				this.addClanMember(newMember);
				this.removeRequest(id);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async denyRequest(id: number): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				await ClanService.denyJoinClanRequest(id);
				this.removeRequest(id);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async excludeMember(id: number): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				EventBus.emit('isLoading', true);
				try {
					await ClanService.excludeClanMember(Number(this.$route.params.id), id);
					this.removeMemberFromClan(id);
					// There's a spot available, refresh the join list.
					await this.getJoinRequestsList();
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		async leaveClan() {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				EventBus.emit('isLoading', true);
				try {
					await ClanService.leaveClanSelf();
					this.playerStore.setClanId(undefined);
					EventBus.emit('isLoading', false);
					this.$router.push({ name: 'Clan', params: { id: Number(this.$route.params.id) } });
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		removeMemberFromClan(memberId: number) {
			// Helper to remove a player from `clanMembersList`
			this.clanMembersList = this.clanMembersList.filter(member => member.id !== memberId);
		},
		removeRequest(requestId: number) {
			// Helper to remove a request from `joinRequestsList`
			this.joinRequestsList = this.joinRequestsList.filter(request => request.id !== requestId);
		},
		addClanMember(member: ClanMember) {
			// Helper to add a player to `clanMembersList`
			this.clanMembersList.push(member);
		}
	},
	computed: {
		eventInProgress() {
			return currentEvents().length > 0;
		}
	},
	async mounted(): Promise<void> {
		await this.getClanMembersList();
		this.hasEditRight = this.getHasRight(ClanMemberRight.MEMBER_EDIT);
		this.hasExcludeRight = this.getHasRight(ClanMemberRight.MEMBER_EXCLUDE);
		this.hasAcceptAndDenyRequestsRight = this.getHasRight(ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS);
		this.selfMember = this.clanMembersList.find(member => member.player.id === this.playerStore.playerId);
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
				&.event {
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
					text-align: right;
				}
				&.actions {
					.buttons {
						display: flex;
						flex-wrap: wrap;
						align-items: center;
						gap: 4px;

						img {
							cursor: pointer;
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

	.request-table {
		tr {
			td {
				padding: 4px 8px;
				text-align: center;
				background-image: url('../../assets/background/table_cell_even.webp');
				background-position: -10px 0px;

				&:first-child {
					background-position: 0px 0px;
				}
			}
		}
	}
}
</style>
