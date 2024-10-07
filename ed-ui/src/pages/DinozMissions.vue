<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<TitleHeader :title="$t('pageTitle.dinozMissions')" />
	<div class="section ml-[-35px] mt-[-30px] sm:ml-0 sm:mt-0">
		<div class="titlePage">{{ $t(`dinozMissions.title`) }}</div>
	</div>
	<DZDisclaimer help :content="$t('dinozMissions.disclaimer')" class="ml-[-45px] sm:ml-0" />
	<table class="ml-[-45px] sm:ml-0">
		<tbody>
			<tr>
				<th class="px-[4px] pb-[8px]">{{ $t('dinozMissions.dinoz') }}</th>
				<th class="px-[4px] pb-[8px]">{{ $t('dinozMissions.missions') }}</th>
				<th />
			</tr>
			<tr v-for="dinoz in data as MissionsPageData" :key="dinoz.id">
				<td class="px-1 py-0.5" style="font-variant: small-caps">{{ dinoz.name }}</td>
				<td class="px-1 py-0.5 text-[9pt] font-bold">
					<ul>
						<Tippy tag="li" theme="normal" v-for="mission in dinoz.missions" :key="mission.npc">
							<img :src="getImgURL('design', 'info_button')" alt="info_button" />
							<span>
								{{ mission.missions.length }}/{{ npcMissions.find(npc => npc.name === mission.npc)?.missions.length }}
								{{ $t(`npc.name.${mission.npc}`) }}
							</span>
							<template #content>
								<h1 v-html="formatContent($t('dinozMissions.missionsFrom', { npc: mission.npc }))"></h1>
								<ul id="missions-summary">
									<li v-for="innerMission in mission.missions" :key="innerMission.id">
										{{
											void (rewards = npcMissions
												.find(npc => npc.name === mission.npc)
												?.missions.find(m => m.missionId === innerMission.id)?.rewards)
										}}
										<span class="center">
											<img :src="getImgURL('design', 'info_button')" alt="info_button" />
											<span>{{ $t(`missions.name.${innerMission.name}`) }}</span>
										</span>
										<table v-if="rewards">
											{{
												void (xp = rewards.find(r => r.rewardType === RewardEnum.EXPERIENCE)?.value)
											}}
											{{
												void (gold = rewards.find(r => r.rewardType === RewardEnum.GOLD)?.value)
											}}
											{{
												void (items = rewards.filter(r => r.rewardType === RewardEnum.ITEM))
											}}
											<tbody>
												<tr>
													<td v-if="xp">
														<div class="center">
															<span class="xp">{{ xp }}</span>
															<img :src="getImgURL('icons', 'small_xp')" alt="xp" />
														</div>
													</td>
													<td v-if="gold">
														<div class="center">
															<span class="gold">{{ gold }}</span>
															<img :src="getImgURL('icons', 'small_gold')" alt="xp" />
														</div>
													</td>
													<td v-if="items.length">
														<div class="center" v-for="item in items" :key="item.value">
															<span class="item">{{ item.quantity }}</span>
															<img
																:src="getImgURL('item', `item_${itemNameList[item.value]}`)"
																:alt="itemNameList[item.value]"
															/>
														</div>
													</td>
												</tr>
											</tbody>
										</table>
									</li>
								</ul>
							</template>
						</Tippy>
						<li>
							<img :src="getImgURL('design', 'info_button')" alt="info_button" />
							<span>
								{{ $t('dinozMissions.total') }}
								<span class="text-[#ea0000]">
									{{ dinoz.missions.reduce((acc, mission) => acc + mission.missions.length, 0) }}/{{ totalMissions }}
								</span>
							</span>
						</li>
					</ul>
				</td>
				<td>
					<router-link
						:to="{ name: 'DinozPage', params: { id: dinoz.id } }"
						class="ml-2 border-double border-[#c85d3f] bg-[#c85d3f] bg-clip-padding px-1 py-0 text-[9pt] text-[#f3ca92] no-underline hover:bg-[#f3ca92] hover:text-[#c85d3f]"
						style="font-variant: small-caps"
					>
						{{ $t('dinozMissions.see') }}
					</router-link>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import EventBus from '../events/index.js';
import { playerStore } from '../store/index.js';
import { MissionsPageData } from '@drpg/core/returnTypes/Dinoz';
import { MissionService } from '../services/MissionService.js';
import { npcMissions } from '@drpg/core/models/npc/NpcMissions';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { errorHandler } from '../utils/errorHandler.js';
import { formatText } from '../utils/formatText.js';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';

export default defineComponent({
	name: 'DinozMissions',
	components: {
		TitleHeader,
		DZDisclaimer
	},
	data() {
		return {
			playerStore: playerStore(),
			data: [] as MissionsPageData,
			npcMissions,
			totalMissions: npcMissions.reduce((acc, npc) => acc + (npc.missions?.length || 0), 0),
			RewardEnum,
			itemNameList
		};
	},
	async mounted(): Promise<void> {
		// Redirect to last page if no PDA
		if (!this.playerStore.playerOptions.hasPMI) {
			this.$toast.open({
				message: formatText(this.$t(`toast.noPMI`)),
				type: 'error'
			});
			this.$router.back();
			return;
		}

		// Fetch data
		try {
			this.data = await MissionService.getGlobalMissions();
		} catch (error) {
			errorHandler.handle(error, this.$toast);
			return;
		}
		EventBus.emit('isLoading', false);
	}
});
</script>

<style lang="scss" scoped>
table {
	min-width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		cursor: help;
		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
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
			font-size: 16px;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
			ul {
				list-style-type: none;
				background-color: #f4d9a8;
				border-radius: 5px;
				margin: 4px 8px;
				padding: 4px 8px;
				img {
					padding-right: 8px;
					padding-left: 4px;
				}
			}
		}
	}
}
#missions-summary {
	color: white;
	margin-left: 4px;
	li {
		img {
			width: 7px;
			margin-right: 8px;
			margin-left: 4px;
			margin-top: 10px;
		}
		span {
			font-size: 9pt;
		}
		table {
			min-width: 90%;
			margin: 2px 0;
			margin-left: 18px;
			td {
				padding: 0px 2px;
				img {
					width: 8px;
				}
				.item + img {
					width: 24px;
					margin-top: 0;
				}
			}
		}
	}
}
</style>
