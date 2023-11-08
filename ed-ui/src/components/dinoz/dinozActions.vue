<template>
	<div class="actions">
		<Resurrect :enabled="resurect" @close="resurect = false" />
		<NPCModal v-if="NPCModal" :text="NPCModal" :npcName="npcName" @close="continueMission()" />
		<div class="actions_top">
			<p>{{ $t('layout.action') }}</p>
		</div>
		<MissionHUD v-if="mission && missionId" :missionId="missionId" @abort="endMission()" />
		<MissionRewardModal v-if="missionReward" :missionReward="missionReward" @close="validateMission()" />
		<ul>
			<table class="action_button">
				<tbody>
					<Tippy
						tag="tr"
						theme="normal"
						v-for="action in dinozActions"
						:key="action.name"
						:id="action.imgName"
						@click="launch(action)"
					>
						<td class="icon">
							<img :src="getImgURL('icons', action.imgName)" :alt="action.imgName" />
						</td>
						<td v-if="action.name === 'shop'" class="label">
							{{ $t(`shop.item.${shopNameList[action.prop]}.name`) }}
						</td>
						<td v-else-if="action.name === 'npc'" class="label">
							{{ $t(`npc.name.${npcNameList[action.prop]}`) }}
						</td>
						<td
							v-else-if="action.name === 'mission' && mission.actionType === MissionEnum.FINISH_MISSION"
							class="label"
						>
							{{ $t(`missions.actions.terminate`) }}
						</td>
						<td v-else-if="action.name === 'mission'" class="label">
							{{ $t(`missions.npc.${action.prop}`) }}
						</td>
						<td v-else-if="action.name !== 'npc' && action.name !== 'shop'" class="label">
							{{ $t(`action.name.${action.name}`) }}
						</td>
						<template #content>
							<h1
								v-if="action.name === 'shop'"
								v-html="formatContent($t(`shop.item.${shopNameList[action.prop]}.name`))"
							/>
							<h1
								v-else-if="action.name === 'npc'"
								v-html="formatContent($t(`npc.name.${npcNameList[action.prop]}`))"
							/>
							<h1
								v-else-if="action.name === 'mission' && mission.actionType === MissionEnum.FINISH_MISSION"
								v-html="formatContent($t(`missions.actions.terminate`))"
							/>
							<h1 v-else-if="action.name === 'mission'" v-html="formatContent($t(`missions.npc.${action.prop}`))" />
							<h1
								v-else-if="action.name !== 'npc' && action.name !== 'shop'"
								v-html="formatContent($t(`action.name.${action.name}`))"
							/>
							<p
								v-if="action.name === 'shop'"
								v-html="formatContent($t(`shop.item.${shopNameList[action.prop]}.description`))"
							/>
							<p v-else-if="action.name === 'npc'" v-html="formatContent($t(`npc.description`))" />
							<p
								v-else-if="action.name === 'mission'"
								v-html="formatContent($t(`missions.tooltip`, { mission: $t(`missions.name.${missionName}`) }))"
							/>
							<p
								v-else-if="action.name !== 'npc' && action.name !== 'shop'"
								v-html="formatContent($t(`action.description.${action.name}`))"
							/>
						</template>
					</Tippy>
				</tbody>
			</table>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { missionsList, npcNameList, shopNameList } from '../../constants/index.js';
import { ActionFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { sessionStore } from '../../store/index.js';
import EventBus from '../../events/index.js';
import { DinozService, FightService, MissionService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { formatText } from '../../utils/formatText.js';
import { mixin } from '../../mixin/mixin.js';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { MissionHUD } from '@drpg/core/models/missions/missionHUD';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			shopNameList: shopNameList,
			npcNameList: npcNameList,
			resurect: false as boolean,
			NPCModal: undefined as string | undefined,
			mission: sessionStore().getDinozList!.find(dinoz => dinoz.id!.toString() === this.$route.params.id.toString())!
				.missions,
			npcName: undefined as string | undefined,
			missionReward: undefined as Array<Rewarder> | undefined,
			sessionStore: sessionStore(),
			MissionEnum: ConditionEnum,
			digReward: undefined as Rewarder | undefined,
			dinozId: this.$route.params.id.toString()
		};
	},
	components: {
		Resurrect: defineAsyncComponent(() => import('../../components/modal/ResurrectModal.vue')),
		MissionHUD: defineAsyncComponent(() => import('../../components/dinoz/MissionHUD.vue')),
		NPCModal: defineAsyncComponent(() => import('../../components/modal/NPCModal.vue')),
		MissionRewardModal: defineAsyncComponent(() => import('../../components/modal/MissionRewardModal.vue'))
	},
	props: {
		dinozActions: Object as PropType<Array<ActionFiche>>,
		missionId: Number
	},
	methods: {
		async launch(action: ActionFiche): Promise<void> {
			switch (action.name) {
				case 'levelup':
					this.$router.push({
						name: 'Leveling',
						params: { id: this.$route.params.id.toString() }
					});
					break;
				case 'shop':
					this.$router.push({
						name: 'ItemShopPage',
						params: { name: shopNameList[action.prop as number] }
					});
					break;
				case 'npc':
					this.$router.push({
						name: 'NPC',
						params: { id: this.$route.params.id.toString(), npc: npcNameList[action.prop as number] }
					});
					break;
				case 'fight':
					EventBus.emit('isLoading', true);
					// eslint-disable-next-line
					const fight: FightResult = await FightService.processFight(parseInt(this.$route.params.id.toString()));
					this.sessionStore.setFightResult(fight);
					this.$router.push({
						name: 'Fight',
						params: { dinozId: this.$route.params.id.toString() }
					});
					EventBus.emit('isLoading', false);
					break;
				case 'resurrect':
					this.resurect = true;
					break;
				case 'mission':
					if (this.mission!.actionType === ConditionEnum.FINISH_MISSION) {
						this.missionReward = await MissionService.finishMission(this.$route.params.id.toString(), this.missionId!);
					} else {
						try {
							this.npcName = action.prop as string;
							this.NPCModal = await MissionService.interactMission(
								this.$route.params.id.toString(),
								this.missionId!,
								action.prop as string
							);
						} catch (e) {
							errorHandler.handle(e);
						}
					}
					break;
				case 'dig':
					this.digReward = await DinozService.dig(parseInt(this.$route.params.id.toString()));
					if (this.digReward.rewardType === RewardEnum.GOLD) {
						EventBus.emit('toast', {
							type: 'reward',
							message: formatText(this.$t(`dig.gold`, { gold: this.digReward.value }))
						});
					} else if (this.digReward.rewardType === RewardEnum.STATUS) {
						EventBus.emit('toast', {
							type: 'reward',
							message: formatText(
								this.$t(`dig.status`, {
									item: mixin.methods.formatContent(this.$t(`status.name.${this.digReward.value}`))
								})
							)
						});
					}
					EventBus.emit('refreshDinoz', true);
					break;
				case 'fish':
				case 'cueille':
				case 'energy':
				case 'hunt':
				case 'seek':
				case 'xmas':
				case 'tictac':
				case 'labo':
				case 'anniv':
				case 'party':
					this.$router.push({
						name: 'Gather',
						params: { dinozId: this.$route.params.id.toString(), type: action.name }
					});
					break;
				case 'concentrate':
					await DinozService.cancelConcentration(parseInt(this.$route.params.id.toString()));
					EventBus.emit('refreshDinoz', true);
					break;
				default:
					console.log(action.name);
					break;
			}
		},
		continueMission(): void {
			this.NPCModal = undefined;
			this.$emit('continueMission');
		},
		endMission(): void {
			this.missionReward = undefined;
			const dinozId = parseInt(this.$route.params.id as string);
			const dinozToUpdate: DinozFiche = this.sessionStore.getDinoz(dinozId);
			dinozToUpdate.missions = undefined;
			dinozToUpdate.missionId = undefined;
			this.sessionStore.setDinoz(dinozToUpdate);
			this.$emit('endMission');
		},
		validateMission(): void {
			this.missionReward = undefined;
			EventBus.emit('refreshDinoz', true);
		}
	},
	computed: {
		missionName(): string | undefined {
			if (this.missionId) {
				return missionsList[this.missionId!];
			}
			return undefined;
		},
		storeMission(): MissionHUD | undefined {
			return sessionStore().getDinozList!.find(dinoz => dinoz.id!.toString() === this.dinozId).missions;
		}
	},
	watch: {
		storeMission: function (missions: MissionHUD) {
			this.mission = missions;
		}
	}
});
</script>

<style lang="scss" scoped>
.actions {
	background: url('../../assets/background/banniere_left.webp') no-repeat,
		url('../../assets/background/banniere_middle.webp') repeat-x,
		url('../../assets/background/banniere_right.webp') no-repeat;
	background-position-x: left, center, right;
	float: left;
	left: 12px;
	top: -14px;
	position: relative;
	width: 185px;
	min-height: 90px;
	color: white;
	position: relative;
	.actions_top {
		width: 185px;
		height: 28px;
		p {
			color: white;
			padding-left: 2px;
			font-size: 7.5pt;
			position: absolute;
			top: -1.5px;
			text-shadow: 0.5px 0 1px grey;
			text-transform: uppercase;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			font-weight: bold;
		}
	}
	.action_button {
		position: relative;
		left: 5px;
		border-collapse: collapse;
		border-spacing: 0;
		margin-bottom: 2px;
		width: 175px;
		tr:hover {
			td {
				&.icon {
					outline: 1px solid white;
				}
				&.label {
					background-color: #9a4029;
				}
			}
		}

		td {
			margin: 0;
			padding: 0 0 2px;
			text-align: left;
			cursor: pointer;

			&.label {
				padding-left: 4px;
				padding-right: 4px;
				font-weight: bold;
				color: white;
				font-size: 11pt;
				font-variant: small-caps;
				line-height: 10.5pt;
				border-top-right-radius: 7px;
				border-bottom-right-radius: 7px;
			}

			&.icon {
				width: 32px;
				font-size: 0;
				line-height: 0;
			}
		}
	}
}
</style>
