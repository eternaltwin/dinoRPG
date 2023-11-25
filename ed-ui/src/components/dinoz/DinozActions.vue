<template>
	<div class="actions">
		<Resurect :enabled="resurect" @close="resurect = false" />
		<NPCModal v-if="NPCModal" :text="NPCModal" :npcName="npcName" @close="continueMission()" />
		<div class="actions_top">
			<p>{{ $t('layout.action') }}</p>
		</div>
		<MissionHUDVue v-if="mission && missionId" :missionId="missionId" @abort="endMission()" />
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
						:class="{
							hover: action.name === Action.FOLLOW && dinozAvailableToFollow.length > 0
						}"
					>
						<td class="icon">
							<img :src="getImgURL('icons', action.imgName)" :alt="action.imgName" />
						</td>
						<td v-if="action.name === 'shop'" class="label">
							{{ $t(`shop.item.${shopNameList[action.prop]}.name`) }}
						</td>
						<td v-else-if="action.name === 'npc'" class="label">
							{{ $t(`npc.name.${npcDisplayName(action.prop)}`) }}
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
								v-html="formatContent($t(`npc.name.${npcDisplayName(action.prop)}`))"
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
					<tr
						v-for="dinozToFollow in dinozAvailableToFollow"
						:key="dinozToFollow.id"
						class="dinoz-to-follow"
						@click="followDinoz(dinozToFollow.id)"
					>
						<td class="icon">
							<img :src="getImgURL('icons', 'small_follow')" alt="follow" />
						</td>
						<td class="label">
							{{ dinozToFollow.name }}
						</td>
					</tr>
				</tbody>
			</table>
		</ul>
		<DZDisclaimer timer v-if="isSelling()" class="selling" :content="$t('toast.isSelling')" />
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { missionsList, shopNameList } from '../../constants/index.js';
import { sessionStore, dinozStore } from '../../store/index.js';
import EventBus from '../../events/index.js';
import { DinozService, FightService, MissionService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { formatText } from '../../utils/formatText.js';
import { mixin } from '../../mixin/mixin.js';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { npcList } from '@drpg/core/models/npc/NpcList';
import Resurect from '../../components/modal/ResurrectModal.vue';
import MissionHUDVue from '../../components/dinoz/MissionHUD.vue';
import NPCModal from '../../components/modal/NPCModal.vue';
import MissionRewardModal from '../../components/modal/MissionRewardModal.vue';
import { Action, ActionFiche, actionList } from '@drpg/core/models/dinoz/ActionList';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { MissionHUD } from '@drpg/core/models/missions/missionHUD';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { orderDinozList } from '@drpg/core/utils/DinozUtils';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			shopNameList: shopNameList,
			resurect: false as boolean,
			NPCModal: undefined as string | undefined,
			mission: dinozStore().getDinozList!.find(dinoz => dinoz.id!.toString() === this.$route.params.id.toString())!
				.missionHUD,
			npcName: undefined as string | undefined,
			missionReward: undefined as Rewarder[] | undefined,
			sessionStore: sessionStore(),
			dinozStore: dinozStore(),
			MissionEnum: ConditionEnum,
			digReward: undefined as Rewarder | undefined,
			dinozId: this.$route.params.id.toString(),
			dinozAvailableToFollow: [] as DinozFiche[],
			Action
		};
	},
	components: {
		Resurect,
		MissionHUDVue,
		NPCModal,
		MissionRewardModal,
		DZDisclaimer
	},
	props: {
		dinozActions: Object as PropType<Array<ActionFiche>>,
		updateActions: Function as PropType<(actions: Array<ActionFiche>) => void>,
		missionId: Number
	},
	methods: {
		async launch(action: ActionFiche) {
			switch (action.name) {
				case Action.LEVEL_UP:
					this.$router.push({
						name: 'Leveling',
						params: { id: this.$route.params.id.toString() }
					});
					break;
				case Action.SHOP:
					this.$router.push({
						name: 'ItemShopPage',
						params: { name: shopNameList[action.prop as number] }
					});
					break;
				case Action.NPC:
					this.$router.push({
						name: 'NPC',
						params: { id: this.$route.params.id.toString(), npc: this.npcDisplayName(action.prop as number) }
					});
					break;
				case Action.FIGHT: {
					const dinozId = +this.$route.params.id;

					EventBus.emit('isLoading', true);
					// eslint-disable-next-line
					const fight = await FightService.processFight(+this.$route.params.id);
					this.sessionStore.setFightResult(fight);

					const dinozList = this.dinozStore.getDinozList;

					if (!dinozList) {
						EventBus.emit('toast', { type: 'error', message: 'missingData' });
						EventBus.emit('isLoading', false);
						return;
					}

					this.dinozStore.setDinozList(
						dinozList.map(dinoz => {
							if (dinoz.id === dinozId || dinoz.leaderId === dinozId) {
								// Update dinoz HP
								dinoz.life -= fight.hpLost.find(hpLost => hpLost.id === dinoz.id)?.hpLost || 0;
							}
							return dinoz;
						})
					);

					this.$router.push({
						name: 'Fight',
						params: { dinozId: this.$route.params.id.toString() }
					});
					EventBus.emit('isLoading', false);
					break;
				}
				case Action.RESURRECT:
					this.resurect = true;
					break;
				case Action.MISSION:
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
				case Action.DIG:
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
				case Action.FISH:
				case Action.CUEILLE:
				case Action.ENERGY:
				case GatherType.HUNT:
				case GatherType.SEEK:
				case GatherType.XMAS:
				case GatherType.TICTAC:
				case GatherType.LABO:
				case GatherType.ANNIV:
				case GatherType.PARTY:
					this.$router.push({
						name: 'Gather',
						params: { dinozId: this.$route.params.id.toString(), type: action.name }
					});
					break;
				case Action.CONCENTRATE:
					await DinozService.cancelConcentration(parseInt(this.$route.params.id.toString()));
					EventBus.emit('refreshDinoz', true);
					break;
				case Action.MARKET:
					this.$router.push({
						name: 'MarketPage'
					});
					break;
				case Action.FOLLOW: {
					if (!this.dinozStore.getDinozList) {
						EventBus.emit('toast', { type: 'error', message: 'dinozListMissing' });
						return;
					}

					const currentDinoz = this.dinozStore.getDinoz(+this.$route.params.id);

					if (!currentDinoz) {
						EventBus.emit('toast', { type: 'error', message: 'unknownDinoz' });
						return;
					}

					// Display the list of dinoz available to follow
					const dinozList = this.dinozStore.getDinozList.filter(
						dinoz =>
							dinoz.id !== +this.$route.params.id &&
							!dinoz.isSelling &&
							!dinoz.leaderId &&
							dinoz.placeId === currentDinoz.placeId
					);

					this.dinozAvailableToFollow = dinozList;
					break;
				}
				case Action.UNFOLLOW: {
					try {
						await DinozService.unfollow(+this.$route.params.id);

						// Refresh followed and following status
						let currentDinozList = this.dinozStore.getDinozList;
						if (!currentDinozList) {
							EventBus.emit('toast', { type: 'error', message: 'dinozListMissing' });
							return;
						}

						const currentDinoz = currentDinozList.find(dinoz => dinoz.id === +this.$route.params.id);
						if (!currentDinoz) {
							EventBus.emit('toast', { type: 'error', message: 'unknownDinoz' });
							return;
						}

						const previousLeader = currentDinoz.leaderId;

						// Update current dinoz and previous leader
						currentDinozList = currentDinozList.map(dinoz => {
							if (dinoz.id === currentDinoz.id) {
								dinoz.leaderId = null;
							} else if (dinoz.id === previousLeader) {
								dinoz.followers = dinoz.followers.filter(follower => follower !== currentDinoz.id);
							}
							return dinoz;
						});

						this.dinozStore.setDinozList(orderDinozList(currentDinozList));

						// Remove unfollow action and add follow and fight actions
						const dinozActions = this.dinozActions;
						if (!dinozActions || !this.updateActions) {
							EventBus.emit('toast', { type: 'error', message: 'missingData' });
							return;
						}

						this.updateActions([
							actionList[Action.FIGHT],
							...dinozActions.filter(action => action.name !== Action.UNFOLLOW),
							actionList[Action.FOLLOW]
						]);
					} catch (e) {
						errorHandler.handle(e);
					}
					break;
				}
				default:
					console.log(action.name);
					break;
			}
		},
		continueMission() {
			this.NPCModal = undefined;
			this.$emit('continueMission');
		},
		endMission() {
			this.missionReward = undefined;
			const dinozId = parseInt(this.$route.params.id as string);
			const dinozToUpdate = this.dinozStore.getDinoz(dinozId) as DinozFiche;
			dinozToUpdate.missionHUD = null;
			dinozToUpdate.missionId = undefined;
			this.dinozStore.setDinoz(dinozToUpdate);
			this.$emit('endMission');
		},
		validateMission() {
			this.missionReward = undefined;
			EventBus.emit('refreshDinoz', true);
		},
		npcDisplayName(npcId: number) {
			return Object.values(npcList).find(npc => npc.id === npcId)?.name;
		},
		isSelling() {
			const dinoz = this.dinozStore.getDinoz(+this.$route.params.id);

			return !!dinoz?.isSelling;
		},
		async followDinoz(targetId: number) {
			try {
				await DinozService.follow(+this.$route.params.id, targetId);

				// Reset the list of dinoz available to follow
				this.dinozAvailableToFollow = [];

				// Refresh followed and following status
				const currentDinozList = this.dinozStore.getDinozList;
				if (!currentDinozList) {
					EventBus.emit('toast', { type: 'error', message: 'dinozListMissing' });
					return;
				}

				this.dinozStore.setDinozList(
					orderDinozList(
						currentDinozList.map(dinoz => {
							if (dinoz.id === +this.$route.params.id) {
								dinoz.leaderId = targetId;
							} else if (dinoz.id === targetId) {
								dinoz.followers.push(+this.$route.params.id);
							}
							return dinoz;
						})
					)
				);

				// Remove follow and fight actions and add unfollow action
				const dinozActions = this.dinozActions;
				if (!dinozActions || !this.updateActions) {
					EventBus.emit('toast', { type: 'error', message: 'missingData' });
					return;
				}

				this.updateActions([
					...dinozActions.filter(action => action.name !== Action.FOLLOW && action.name !== Action.FIGHT),
					actionList[Action.UNFOLLOW]
				]);
			} catch (e) {
				errorHandler.handle(e);
			}
		}
	},
	computed: {
		missionName() {
			if (this.missionId) {
				return missionsList[this.missionId!];
			}
			return undefined;
		},
		storeMission() {
			return dinozStore().getDinozList!.find(dinoz => dinoz.id!.toString() === this.dinozId)?.missionHUD || null;
		}
	},
	watch: {
		storeMission: function (mission: MissionHUD) {
			this.mission = mission;
		}
	}
});
</script>

<style lang="scss" scoped>
.actions {
	background:
		url('../../assets/background/banniere_left.webp') no-repeat,
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
		tr {
			&:hover,
			&.hover {
				td {
					&.icon {
						outline: 1px solid white;
					}
					&.label {
						background-color: #9a4029;
					}
				}
			}

			&.dinoz-to-follow {
				padding: 2px;
				.icon {
					text-align: right;
					padding-top: 6px;
					padding-bottom: 6px;
				}

				&:hover {
					td {
						&.icon {
							outline: none;
							background-color: #9a4029;
						}
					}
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

.selling {
	margin-right: 1px;
}
</style>
