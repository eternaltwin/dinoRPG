<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="actions ml-[-85px] mt-[-21px] min-h-[95px] sm:ml-0 sm:mt-0 sm:bg-transparent">
		<Resurect :enabled="resurect" @close="resurect = false" />
		<NPCModal v-if="NPCModal" :text="NPCModal" :npcName="npcName" @close="continueMission()" />
		<div class="actions_top">
			<p>{{ $t('layout.action') }}</p>
		</div>
		<template v-for="didi in dinozFullParty" :key="didi">
			<MissionHUDVue
				v-if="didi.missionHUD"
				:missionId="didi.missionId"
				:dinozName="didi.name"
				:dinozId="didi.id"
				@abort="endMission(didi.id)"
			/>
		</template>
		<MissionRewardModal v-if="missionReward" :missionReward="missionReward" @close="validateMission()" />
		<Tippy tag="p" theme="small" class="follow" v-if="leaderDinoz" @click="goToLeader()">
			{{ $t('following') }}
			<template #content>
				{{ $t(`follow`, { leader: leaderDinoz.name }) }}
			</template>
		</Tippy>
		<DZDisclaimer
			class="m-0 mt-4"
			v-if="dinoz.actions?.some(a => a.name === Action.STOP_REST)"
			:content="$t('toast.resting', { hp: hpRegen, min: minutesBeforeHour })"
			timer
		></DZDisclaimer>
		<DZFollow v-if="dinoz.actions?.some(a => a.name === Action.FOLLOW)"></DZFollow>
		<Tippy
			tag="div"
			theme="normal"
			class="action"
			v-for="action in dinoz.actions?.filter(a => a.name !== Action.FOLLOW)"
			:key="action"
			:id="action.imgName"
			@click="launch(action)"
		>
			<img :src="getImgURL('icons', action.imgName)" :alt="action.imgName" />
			<p v-if="action.name === 'shop'">{{ $t(`shop.item.${shopNameList[action.prop]}.name`) }}</p>
			<p v-else-if="action.name === 'npc'">{{ $t(`npc.name.${npcDisplayName(action.prop)}`) }}</p>
			<p v-else-if="action.name === 'mission' && mission.actionType === MissionEnum.FINISH_MISSION">
				{{ $t(`missions.actions.terminate`) }}
			</p>
			<p v-else-if="action.name === 'mission'">{{ $t(`missions.npc.${action.prop}`) }}</p>
			<p v-else>{{ $t(`action.name.${action.name}`) }}</p>
			<template #content>
				<h1 v-if="action.name === 'shop'" v-html="formatContent($t(`shop.item.${shopNameList[action.prop]}.name`))" />
				<h1 v-else-if="action.name === 'npc'" v-html="formatContent($t(`npc.name.${npcDisplayName(action.prop)}`))" />
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
		<DZDisclaimer timer v-if="isSelling()" class="m-0 mt-4" :content="$t('toast.isSelling')" />
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { itinerantShopNameList, missionsList, shopNameList } from '../../constants/index.js';
import { dinozStore, playerStore, sessionStore } from '../../store/index.js';
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
import { Action, ActionFiche } from '@drpg/core/models/dinoz/ActionList';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { MissionHUD } from '@drpg/core/models/missions/missionHUD';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { orderDinozList } from '@drpg/core/utils/DinozUtils';
import DZFollow from '../../components/dinoz/DZFollow.vue';
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';
import { getSpecialStat, SpecialStat } from '@drpg/core/utils/getSpecialStat';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			shopNameList: shopNameList,
			itinerantShopNameList: itinerantShopNameList,
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
			Action,
			hpRegen: 1,
			itinerantName: '' as string,
			dinozFullParty: [] as DinozFiche[],
			playerStore: playerStore()
		};
	},
	components: {
		Resurect,
		MissionHUDVue,
		NPCModal,
		MissionRewardModal,
		DZDisclaimer,
		DZFollow
	},
	props: {
		updateActions: Function as PropType<(actions: Array<ActionFiche>) => void>,
		dinoz: {
			type: Object as PropType<DinozFiche>,
			required: true
		}
	},
	methods: {
		async launch(action: ActionFiche) {
			EventBus.emit('isLoading', true);
			switch (action.name) {
				case Action.IRMA:
				case Action.IRMAS:
				case Action.ACTION:
					try {
						const toast = await DinozService.useIrma(parseInt(this.$route.params.id.toString()));
						if (toast.category === ItemEffect.ACTION && toast.value > 0) {
							const message = this.$t(`toast.${toast.category}`, { value: toast.value });
							this.$toast.open({
								message: formatText(message),
								type: 'info'
							});
						}
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					EventBus.emit('refreshDinoz', true);
					break;
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
				case Action.ITINERANTSHOP:
					this.$router.push({
						name: 'ItinerantMerchantPage',
						params: { itinerantId: action.prop }
					});
					break;
				case Action.NPC:
					this.dinozStore.clearNpc(+this.dinozId);
					this.$router.push({
						name: 'NPC',
						params: { id: this.$route.params.id.toString(), npc: this.npcDisplayName(action.prop as number) }
					});
					break;
				case Action.FIGHT: {
					const dinozId = +this.$route.params.id;

					// eslint-disable-next-line
					try {
						const fight = await FightService.processFight(+this.$route.params.id);
						this.sessionStore.setFightResult(fight);
						const dinozList = this.dinozStore.getDinozList;

						if (!dinozList) {
							this.$toast.open({
								message: formatText(this.$t(`toast.missingData`)),
								type: 'error'
							});
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
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				}
				case Action.RESURRECT:
					this.resurect = true;
					break;
				case Action.MISSION:
					if (this.mission && this.mission.actionType === ConditionEnum.FINISH_MISSION) {
						this.missionReward = await MissionService.finishMission(
							this.$route.params.id.toString(),
							this.dinoz.missionId!
						);
					} else {
						try {
							this.npcName = action.prop as string;
							this.NPCModal = await MissionService.interactMission(
								this.$route.params.id.toString(),
								this.dinoz.missionId!,
								action.prop as string
							);
						} catch (e) {
							errorHandler.handle(e, this.$toast);
						}
					}
					break;
				case Action.DIG:
					try {
						this.digReward = await DinozService.dig(parseInt(this.$route.params.id.toString()));
						if (this.digReward.rewardType === RewardEnum.GOLD) {
							this.$toast.open({
								message: formatText(this.$t(`dig.gold`, { gold: this.digReward.value })),
								type: 'reward'
							});
						} else if (this.digReward.rewardType === RewardEnum.STATUS) {
							this.$toast.open({
								message: formatText(
									formatText(
										this.$t(`dig.status`, {
											item: mixin.methods.formatContent(this.$t(`status.name.${this.digReward.value}`))
										})
									)
								),
								type: 'success'
							});
						} else if (this.digReward.rewardType === RewardEnum.SCENARIO) {
							if (this.digReward.value === 1 && this.digReward.step === 5) {
								this.$toast.open({
									message: formatText(this.$t(`quest.dig_star_found`)),
									type: 'info'
								});
							}
						}
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					EventBus.emit('refreshDinoz', true);
					break;
				case Action.FISH:
				case Action.CUEILLE:
				case Action.ENERGY:
				case Action.SEEK:
				case Action.HUNT:
				case GatherType.HUNT:
				case GatherType.SEEK:
				case GatherType.XMAS:
				case GatherType.TICTAC:
				case GatherType.LABO:
				case GatherType.ANNIV:
				case GatherType.PARTY:
				case Action.DAILY:
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
						this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
						return;
					}
					break;
				}
				case Action.UNFOLLOW: {
					try {
						await DinozService.unfollow(+this.$route.params.id);

						// Refresh followed and following status
						let currentDinozList = this.dinozStore.getDinozList;
						if (!currentDinozList) {
							this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
							return;
						}

						const currentDinoz = currentDinozList.find(dinoz => dinoz.id === +this.$route.params.id);
						if (!currentDinoz) {
							this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
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
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					EventBus.emit('refreshDinoz', true);
					break;
				}
				case Action.DISBAND:
					try {
						await DinozService.disband(+this.$route.params.id);

						let currentDinozList = this.dinozStore.getDinozList;
						if (!currentDinozList) {
							this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
							return;
						}

						const currentDinoz = currentDinozList.find(dinoz => dinoz.id === +this.$route.params.id);
						if (!currentDinoz) {
							this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
							return;
						}

						const previousLeader = currentDinoz.id;
						const followingdinoz = currentDinozList
							.filter(dinoz => dinoz.leaderId === previousLeader && dinoz.id !== previousLeader)
							.map(d => d.id);

						currentDinozList = currentDinozList.map(dinoz => {
							if (dinoz.id === currentDinoz.id) {
								dinoz.followers = [];
							} else if (followingdinoz.includes(dinoz.id)) {
								dinoz.leaderId = null;
							}
							return dinoz;
						});

						this.dinozStore.setDinozList(orderDinozList(currentDinozList));
						EventBus.emit('refreshDinoz', true);
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.CONGEL:
					try {
						await DinozService.frozeDinoz(+this.$route.params.id);

						const currentDinozList = this.dinozStore.getDinozList;
						if (!currentDinozList) {
							this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
							return;
						}

						const currentDinoz = currentDinozList.findIndex(dinoz => dinoz.id === +this.$route.params.id);
						if (currentDinoz < 0) {
							this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
							return;
						}
						currentDinozList[currentDinoz].unavailableReason = UnavailableReasonFront.frozen;
						this.dinozStore.setDinozList(currentDinozList);
						EventBus.emit('refreshDinoz', true);
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.STOP_CONGEL:
					try {
						await DinozService.unfrozeDinoz(+this.$route.params.id);
						EventBus.emit('refreshDinoz', true);
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.REST:
					try {
						await DinozService.restDinoz(+this.$route.params.id, true);
						EventBus.emit('refreshDinoz', true);
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.STOP_REST:
					try {
						await DinozService.restDinoz(+this.$route.params.id, false);
						EventBus.emit('refreshDinoz', true);
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.REINCARNATION:
					try {
						await DinozService.reincarnate(+this.$route.params.id);
						EventBus.emit('refreshDinoz', true);
						this.$toast.open({
							message: this.$t('toast.reincarnation'),
							type: 'info'
						});
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				default:
					console.log(action.name);
					break;
			}
			EventBus.emit('isLoading', false);
		},
		continueMission() {
			this.NPCModal = undefined;
			this.$emit('continueMission');
		},
		endMission(dinozId: number) {
			this.missionReward = undefined;
			const dinozToUpdate = this.dinozStore.getDinoz(dinozId) as DinozFiche;
			dinozToUpdate.missionHUD = null;
			dinozToUpdate.missionId = undefined;
			this.dinozStore.setDinoz(dinozToUpdate);
			this.$emit('endMission');
		},
		validateMission() {
			this.missionReward = undefined;
			EventBus.emit('refreshDinoz', true);
			EventBus.emit('refreshMoney', true);
		},
		npcDisplayName(npcId: number) {
			return Object.values(npcList).find(npc => npc.id === npcId)?.name;
		},
		isSelling() {
			const dinoz = this.dinozStore.getDinoz(+this.$route.params.id);

			return dinoz.unavailableReason === UnavailableReasonFront.selling;
		},
		goToLeader() {
			if (!this.leaderDinoz) return;
			this.$router.push({ name: 'DinozPage', params: { id: this.leaderDinoz.id } });
		},
		async regenRate() {
			const data = this.dinoz;
			const dinozSkill = await DinozService.getDinozSkill(+this.dinozId);
			const priest = this.playerStore.isPriest;
			const specialStats = Object.values(SpecialStat)
				.map(stat => getSpecialStat(data, data.status, dinozSkill, stat as SpecialStat, priest))
				.filter(Boolean) as NonNullable<ReturnType<typeof getSpecialStat>>[];
			const regen = specialStats.find(s => s.name === SpecialStat.HP_REGEN);
			regen ? (this.hpRegen = regen.value) : 1;
		}
	},
	computed: {
		missionName() {
			if (this.dinoz.missionId) {
				return missionsList[this.dinoz.missionId!];
			}
			return undefined;
		},
		storeMission() {
			return dinozStore().getDinozList!.find(dinoz => dinoz.id!.toString() === this.dinozId)?.missionHUD || null;
		},
		leaderDinoz() {
			return dinozStore().getDinoz(this.dinoz.leaderId);
		},
		minutesBeforeHour() {
			const day: Date = new Date();
			return 60 - day.getMinutes();
		}
	},
	watch: {
		storeMission: function (mission: MissionHUD) {
			this.mission = mission;
		}
	},
	async mounted() {
		if (this.dinoz.actions?.some(a => a.name === Action.STOP_REST)) {
			await this.regenRate();
		}
		this.dinozFullParty = dinozStore().getDinozList!.filter(dinoz => this.dinoz?.followers.includes(dinoz.id));
		this.dinozFullParty.push(this.dinoz);
	}
});
</script>

<style lang="scss" scoped>
.follow {
	margin: 0 10px 10px;
	padding: 5px 5px 5px 20px;
	font-size: 10pt;
	background-color: #bc683c;
	background-image: url('../../assets/icons/small_missAct.webp');
	background-position: 5px 8px;
	background-repeat: no-repeat;
	line-height: 10pt;
	overflow: hidden;
	color: #774828;
	cursor: pointer;
	font-style: italic;
	color: #fce3bc;
	font-size: 9pt;
}
.actions {
	background:
		url('../../assets/background/banniere_left.webp') no-repeat,
		url('../../assets/background/banniere_middle.webp') repeat-x,
		url('../../assets/background/banniere_right.webp') no-repeat;
	background-position-x: left, center, right;
	background-color: #d19860;
	float: left;
	left: 12px;
	top: -14px;
	position: relative;
	width: 185px;
	color: white;
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	.action {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		margin-left: 5px;
		margin-right: 5px;
		border-radius: 7px;
		font-size: 11pt;
		font-variant: small-caps;
		line-height: 10.5pt;
		font-weight: 700;
		&:hover {
			background-color: #9a4029;
			cursor: pointer;
			img {
				outline: 1px solid white;
			}
		}
	}
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
}

.selling {
	margin-right: 1px;
}
</style>
