<template>
	<div class="actions" v-if="dinoz">
		<Resurrect :enabled="resurrect" @close="resurrect = false" />
		<NPCModal v-if="NPCModal" :text="NPCModal" :npcName="npcName" @close="continueMission()" />
		<div class="actions_top">
			<p>{{ $t('layout.action') }}</p>
		</div>
		<div class="action_content">
			<template v-for="didi in dinozFullParty" :key="didi">
				<MissionHUDVue
					v-if="didi.missionHUD && didi.missionId"
					:missionId="didi.missionId"
					:dinozName="didi.name"
					:dinozId="didi.id"
					@abort="endMission(didi.id)"
				/>
			</template>
			<MissionRewardModal v-if="missionReward" :missionReward="missionReward" @close="validateMission()" />
			<Tippy tag="p" theme="small" class="follow" v-if="leaderDinoz" @click="goToLeader()">
				{{ $t('hud.following') }}
				<template #content>
					{{ $t(`hud.follow`, { leader: leaderDinoz.name }) }}
				</template>
			</Tippy>
			<p class="follow" v-if="dinoz.tournament && dinoz.level >= dinoz.tournament.levelLimit">
				{{ $t('hud.dojoTeam', { max: dinoz.tournament.levelLimit }) }}
			</p>
			<DZDisclaimer
				v-if="dinoz.unavailableReason === UnavailableReason.unfreezing"
				:content="$t('hud.unfreezeCountdown', { time: timeUntilMidnight })"
				help
			/>
			<DZDisclaimer
				v-if="dinoz.unavailableReason === UnavailableReason.restingAttack"
				:content="$t('hud.restingAttackCountdown', { time: attackCountdown })"
				help
			/>
			<DZDisclaimer
				v-if="dinoz.unavailableReason === UnavailableReason.unsacrificing"
				:content="$t('hud.unsacrificeCountdown', { time: timeUntilAvailable })"
				help
			/>
			<DZDisclaimer
				v-if="dinoz.actions?.some(a => a.name === Action.STOP_REST) && dinoz.life < dinoz.maxLife / 2"
				:content="$t('hud.resting', { hp: hpRegen, min: minutesBeforeHour })"
				timer
			></DZDisclaimer>
			<DZDisclaimer
				v-if="dinoz.actions?.some(a => a.name === Action.STOP_REST) && dinoz.life >= dinoz.maxLife / 2"
				:content="$t('hud.restEnd')"
				help
			></DZDisclaimer>
			<DZFollow v-if="dinoz.actions?.some(a => a.name === Action.FOLLOW)" :key="dinoz.id"></DZFollow>
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
				<p v-if="action.name === 'shop'">{{ $t(`shop.item.${shopNameList[action.prop ?? '']}.name`) }}</p>
				<p v-else-if="action.name === 'npc'">{{ $t(`npc.name.${npcDisplayName(+(action.prop ?? '0'))}`) }}</p>
				<p v-else-if="action.name === 'mission' && mission?.actionType === MissionEnum.FINISH_MISSION">
					{{ $t(`missions.actions.terminate`) }}
				</p>
				<p v-else-if="action.name === 'mission'">{{ $t(`missions.npc.${action.prop}`) }}</p>
				<p v-else>
					{{ action.forDinoz ? `${dinoz.followers.find(f => f.id === action.forDinoz)?.name}: ` : '' }}
					{{ $t(`action.name.${action.name}`) }}
				</p>
				<template #content>
					<h1
						v-if="action.name === 'shop'"
						v-html="formatContent($t(`shop.item.${shopNameList[action.prop ?? '']}.name`))"
					/>
					<h1
						v-else-if="action.name === 'npc'"
						v-html="formatContent($t(`npc.name.${npcDisplayName(+(action.prop ?? '0'))}`))"
					/>
					<h1
						v-else-if="action.name === 'mission' && mission?.actionType === MissionEnum.FINISH_MISSION"
						v-html="formatContent($t(`missions.actions.terminate`))"
					/>
					<h1 v-else-if="action.name === 'mission'" v-html="formatContent($t(`missions.npc.${action.prop}`))" />
					<h1 v-else v-html="formatContent($t(`action.name.${action.name}`))" />
					<p
						v-if="action.name === 'shop'"
						v-html="formatContent($t(`shop.item.${shopNameList[action.prop ?? '']}.description`))"
					/>
					<p v-else-if="action.name === 'npc'" v-html="formatContent($t(`npc.description`))" />
					<p
						v-else-if="action.name === 'mission'"
						v-html="formatContent($t(`missions.tooltip`, { mission: $t(`missions.name.${missionName}`) }))"
					/>
					<p v-else v-html="formatContent($t(`action.description.${action.name}`))" />
				</template>
			</Tippy>
			<DZDisclaimer timer v-if="isSelling" class="selling" :content="$t('toast.isSelling')" />
		</div>
	</div>
</template>

<script lang="ts">
import { Action, ActionFiche } from '@drpg/core/models/dinoz/ActionList';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { UnavailableReason } from '@drpg/prisma/enums';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';
import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { MissionHUD } from '@drpg/core/models/missions/missionHUD';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { orderDinozList, toSkillDetails } from '@drpg/core/utils/DinozUtils';
import { getSpecialStat, SpecialStat } from '@drpg/core/utils/getSpecialStat';
import { defineComponent, PropType } from 'vue';
import DZFollow from '../../components/dinoz/DZFollow.vue';
import MissionHUDVue from '../../components/dinoz/MissionHUD.vue';
import MissionRewardModal from '../../components/modal/MissionRewardModal.vue';
import NPCModal from '../../components/modal/NPCModal.vue';
import Resurrect from '../../components/modal/ResurrectModal.vue';
import { itinerantShopNameList, missionsList, shopNameList } from '../../constants/index.js';
import { mixin } from '../../mixin/mixin.js';
import { ClanService, DinozService, FightService, MissionService } from '../../services/index.js';
import { playerStore, sessionStore, useDinozStore } from '../../store/index.js';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { errorHandler } from '../../utils/index.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { DigResponse } from '@drpg/core/returnTypes/Dinoz';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			shopNameList: shopNameList,
			itinerantShopNameList: itinerantShopNameList,
			resurrect: false as boolean,
			NPCModal: undefined as string | undefined,
			npcName: undefined as string | undefined,
			missionReward: undefined as Rewarder[] | undefined,
			sessionStore: sessionStore(),
			MissionEnum: ConditionEnum,
			digRewards: undefined as DigResponse | undefined,
			Action,
			itinerantName: '' as string,
			playerStore: playerStore(),
			timeUntilMidnight: '',
			timeUntilAvailable: '',
			minutesBeforeHour: 60 - new Date().getMinutes(),
			intervals: [] as number[],
			mission: useDinozStore().getDinoz(+this.$route.params.id.toString())?.missionHUD,
			attackCountdown: 0 as number
		};
	},
	components: {
		Resurrect,
		MissionHUDVue,
		NPCModal,
		MissionRewardModal,
		DZDisclaimer,
		DZFollow
	},
	props: {
		refreshDinoz: {
			type: Function as PropType<() => Promise<void>>,
			required: true
		}
	},
	methods: {
		computeTimeUntilMidnight() {
			const now = new Date();
			const nowMs = now.getTime();
			const midnightMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
			const timeRemainingMs = midnightMs - nowMs;

			const totalSeconds = Math.floor(timeRemainingMs / 1000);
			const safeSeconds = Math.max(0, totalSeconds);

			const hours = Math.floor(safeSeconds / 3600);
			const minutes = Math.floor((safeSeconds % 3600) / 60);
			const seconds = safeSeconds % 60;
			const h = hours.toString().padStart(2, '0');
			const m = minutes.toString().padStart(2, '0');
			const s = seconds.toString().padStart(2, '0');

			this.timeUntilMidnight = `${h}:${m}:${s}`;
		},
		computeTimeUntilAvailable() {
			if (this.dinoz && this.dinoz.unavailableUntil) {
				console.log(`${this.dinoz.unavailableUntil}`);
				const now = new Date();
				const nowMs = now.getTime();
				const timeRemainingMs = new Date(this.dinoz.unavailableUntil).getTime() - nowMs;
				console.log(`timeRemainingMs ${timeRemainingMs}`);

				const totalSeconds = Math.floor(timeRemainingMs / 1000);
				const safeSeconds = Math.max(0, totalSeconds);

				const hours = Math.floor(safeSeconds / 3600);
				const minutes = Math.floor((safeSeconds % 3600) / 60);
				const seconds = safeSeconds % 60;
				const h = hours.toString().padStart(2, '0');
				const m = minutes.toString().padStart(2, '0');
				const s = seconds.toString().padStart(2, '0');

				this.timeUntilAvailable = `${h}:${m}:${s}`;

				if (timeRemainingMs <= 0) {
					this.refreshDinoz();
				}
			}
		},
		computeTimeUntilNextHour() {
			const now = new Date();
			this.minutesBeforeHour = 60 - now.getMinutes();
			if (this.minutesBeforeHour === 0) {
				this.refreshDinoz();
			}
		},
		updateAttackCountdown() {
			const time = useDinozStore().getDinozAttackTimer(+this.$route.params.id);
			if (!time) {
				return;
			}
			this.attackCountdown = time;
			return;
		},
		async launch(action: ActionFiche) {
			if (!this.dinoz) {
				this.$toast.open({
					message: 'Dinoz not found',
					type: 'error'
				});
				return;
			}
			if (action.confirm) {
				const res = await this.$confirm({
					message: this.$t(`action.popupConfirm`, { action: this.$t(`action.name.${action.name}`) }),
					header: this.$t('popup.attention'),
					acceptLabel: this.$t('popup.accept'),
					rejectLabel: this.$t('popup.reject'),
					icon: 'pi pi-trash'
				});
				if (!res) return;
			}
			switch (action.name) {
				case Action.IRMA:
				case Action.IRMAS:
				case Action.ACTION:
					try {
						const toast = await DinozService.useIrma(parseInt(this.$route.params.id.toString()));
						if (toast.category === ItemEffect.ACTION && toast.value > 0) {
							const message = this.$t(`toast.${toast.category}`, { value: toast.value }, toast.value);
							this.$toast.open({
								message: message,
								type: 'info'
							});
						}
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					await this.refreshDinoz();
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
				case Action.DEMON_SHOP:
					this.$router.push({
						name: 'DemonShopPage'
					});
					break;
				case Action.ITINERANT_SHOP:
					this.$router.push({
						name: 'ItinerantMerchantPage',
						params: { itinerantId: action.prop }
					});
					break;
				case Action.NPC:
					useDinozStore().clearNpc(+this.$route.params.id);
					this.$router.push({
						name: 'NPC',
						params: {
							id: this.$route.params.id.toString(),
							npc: this.npcDisplayName(action.prop as number)
						}
					});
					break;
				case Action.FIGHT: {
					try {
						const fight = await FightService.processFight(+this.$route.params.id);
						this.sessionStore.setFightResult(fight);

						if (fight.autoReequipped && fight.autoReequipped.length > 0) {
							const itemsStr = fight.autoReequipped
								.map(item => `${item.count}x ${this.$t(`item.name.${itemNameList[item.itemId]}`)}`)
								.join(', ');
							this.$toast.open({
								message: this.$t('toast.autoReequipSuccess', { items: itemsStr }),
								type: 'success'
							});
						}
						if (fight.missingReequip && fight.missingReequip.length > 0) {
							const itemsStr = fight.missingReequip
								.map(item => `${item.count}x ${this.$t(`item.name.${itemNameList[item.itemId]}`)}`)
								.join(', ');
							this.$toast.open({
								message: this.$t('toast.autoReequipMissing', { items: itemsStr }),
								type: 'warning'
							});
						}

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
					this.resurrect = true;
					break;
				case Action.MISSION:
					if (typeof this.dinoz.missionId !== 'number') {
						this.$toast.open({
							message: this.$t('toast.missingData'),
							type: 'error'
						});
						return;
					}
					if (this.mission && this.mission.actionType === ConditionEnum.FINISH_MISSION) {
						this.missionReward = await MissionService.finishMission(
							this.$route.params.id.toString(),
							this.dinoz.missionId
						);
					} else if (this.mission && this.mission.actionType === ConditionEnum.LAUNCH_FIGHT) {
						try {
							this.npcName = action.prop as string;
							const fight = await MissionService.startFightMission(
								this.$route.params.id.toString(),
								this.dinoz.missionId,
								action.prop as string
							);
							this.sessionStore.setFightResult(fight);
							this.$router.push({
								name: 'Fight',
								params: { dinozId: this.$route.params.id.toString() }
							});
						} catch (e) {
							errorHandler.handle(e, this.$toast);
						}
					} else {
						try {
							if (this.mission && 'npcName' in this.mission) {
								const npcName = this.mission.npcName;
								const dialog = await MissionService.interactMission(
									this.$route.params.id.toString(),
									this.dinoz.missionId,
									action.prop as string
								);
								this.$router.push({
									name: 'NPC',
									params: { id: this.$route.params.id.toString(), npc: npcName },
									query: { dialog: dialog }
								});
							} else {
								this.npcName = action.prop as string;
								this.NPCModal = await MissionService.interactMission(
									this.$route.params.id.toString(),
									this.dinoz.missionId,
									action.prop as string
								);
							}
						} catch (e) {
							errorHandler.handle(e, this.$toast);
						}
					}
					break;
				case Action.DIG:
					try {
						this.digRewards = await DinozService.dig(parseInt(this.$route.params.id.toString()));

						if (this.digRewards.fight) {
							this.sessionStore.setFightResult(this.digRewards.fight);
							this.$router.push({
								name: 'Fight',
								params: { dinozId: this.$route.params.id.toString() }
							});

							return;
						}

						for (const reward of this.digRewards.rewards) {
							if (reward.rewardType === RewardEnum.GOLD) {
								this.$toast.open({
									message: this.$t(`dig.gold`, { gold: reward.value }),
									type: 'reward'
								});
							} else if (reward.rewardType === RewardEnum.STATUS) {
								this.$toast.open({
									message: this.$t(`dig.status`, {
										item: mixin.methods.formatContent(this.$t(`status.name.${reward.value}`))
									}),
									type: 'success'
								});
							} else if (reward.rewardType === RewardEnum.SCENARIO) {
								if (reward.value === 1 && reward.step === 5) {
									this.$toast.open({
										message: this.$t(`quest.dig_star_found`),
										type: 'info'
									});
								}
							}
						}
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					await this.refreshDinoz();
					break;
				case Action.FISH:
				case Action.CUEILLE:
				case Action.ENERGY:
				case Action.SEEK:
				case Action.HUNT:
				case Action.XMAS:
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
						params: {
							dinozId: action.forDinoz ? action.forDinoz.toString() : this.$route.params.id.toString(),
							type: action.name
						}
					});
					break;
				case Action.CONCENTRATE:
					await DinozService.cancelConcentration(parseInt(this.$route.params.id.toString()));
					await this.refreshDinoz();
					break;
				case Action.MARKET:
					this.$router.push({
						name: 'MarketPage',
						params: { tab: 0 }
					});
					break;
				case Action.FOLLOW: {
					if (!useDinozStore().getDinozList) {
						this.$toast.open({ message: this.$t(`toast.dinozListMissing`), type: 'error' });
						return;
					}
					break;
				}
				case Action.UNFOLLOW: {
					try {
						await DinozService.unfollow(+this.$route.params.id);

						// Refresh followed and following status
						const currentDinozList = useDinozStore().getDinozList;
						if (!currentDinozList) {
							this.$toast.open({ message: this.$t(`toast.dinozListMissing`), type: 'error' });
							return;
						}

						const currentDinoz = currentDinozList.find(dinoz => dinoz.id === +this.$route.params.id);
						if (!currentDinoz || !currentDinoz.leaderId) {
							this.$toast.open({ message: this.$t(`toast.unknownDinoz`), type: 'error' });
							return;
						}

						const currentDinozIndex = currentDinozList.map(d => d.id).indexOf(currentDinoz.id);
						const leaderIndex = currentDinozList.map(d => d.id).indexOf(currentDinoz.leaderId);
						const leaderDinoz = currentDinozList[leaderIndex];

						if (currentDinozIndex > -1 && leaderIndex > -1) {
							currentDinoz.leaderId = null;
							const indexCurrentInFollowers = leaderDinoz.followers.map(d => d.id).indexOf(currentDinoz.id);
							leaderDinoz.followers.splice(indexCurrentInFollowers, 1);
						}

						useDinozStore().setDinozList(orderDinozList(currentDinozList));
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					await this.refreshDinoz();
					break;
				}
				case Action.DISBAND:
					try {
						await DinozService.disband(+this.$route.params.id);

						let currentDinozList = useDinozStore().getDinozList;
						if (!currentDinozList) {
							this.$toast.open({ message: this.$t(`toast.dinozListMissing`), type: 'error' });
							return;
						}

						const currentDinoz = currentDinozList.find(dinoz => dinoz.id === +this.$route.params.id);
						if (!currentDinoz) {
							this.$toast.open({ message: this.$t(`toast.unknownDinoz`), type: 'error' });
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

						useDinozStore().setDinozList(orderDinozList(currentDinozList));
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.CHANGE_LEADER:
					try {
						const followerId = +this.$route.params.id;
						const currentLeader = useDinozStore().getDinozList.find(d => d.id === followerId)?.leaderId;

						if (!currentLeader) {
							this.$toast.open({ message: this.$t(`toast.noFollowers`), type: 'error' });
							return;
						}

						await DinozService.changeLeader(followerId, currentLeader);

						const dinozList = useDinozStore().getDinozList;
						if (!dinozList) {
							this.$toast.open({ message: this.$t(`toast.dinozListMissing`), type: 'error' });
							return;
						}

						useDinozStore().setDinozList(orderDinozList(dinozList));

						this.$toast.open({ message: this.$t(`toast.leaderChanged`), type: 'success' });

						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.CONGEL:
					try {
						await DinozService.frozeDinoz(+this.$route.params.id);

						const currentDinoz = useDinozStore().getDinoz(+this.$route.params.id);
						if (!currentDinoz) {
							this.$toast.open({ message: this.$t(`toast.unknownDinoz`), type: 'error' });
							return;
						}
						currentDinoz.unavailableReason = UnavailableReason.frozen;
						useDinozStore().setDinoz(currentDinoz);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.STOP_CONGEL:
					try {
						await DinozService.unfrozeDinoz(+this.$route.params.id);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.REST:
					try {
						await DinozService.restDinoz(+this.$route.params.id, true);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.STOP_REST:
					try {
						await DinozService.restDinoz(+this.$route.params.id, false);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.REINCARNATION:
					try {
						await DinozService.reincarnate(+this.$route.params.id);
						await this.refreshDinoz();
						this.$toast.open({
							message: this.$t('toast.reincarnation'),
							type: 'info'
						});
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.FB_TOURNAMENT:
					this.$router.push({
						name: 'Forcebrute',
						query: { dinozId: +this.$route.params.id }
					});
					break;
				case Action.WAR_DEFEND:
					try {
						await ClanService.addDefenser(+this.$route.params.id);
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					await this.refreshDinoz();
					break;
				case Action.WAR_REMOVE:
					try {
						await ClanService.removeDefender(+this.$route.params.id);
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					await this.refreshDinoz();
					break;
				case Action.WAR_ATTACK:
					try {
						const fight = await ClanService.attackCastle(+this.$route.params.id);
						const currentDinoz = useDinozStore().getDinoz(+this.$route.params.id);
						if (!currentDinoz) {
							this.$toast.open({ message: this.$t(`toast.unknownDinoz`), type: 'error' });
							return;
						}

						const team = [currentDinoz.id, ...currentDinoz.followers.map(f => f.id)];
						for (const teamKey of team) {
							useDinozStore().setDinozAttackTimer(teamKey);
						}
						this.sessionStore.setFightResult(fight);

						this.$router.push({
							name: 'Fight',
							params: { dinozId: this.$route.params.id.toString() }
						});
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					await this.refreshDinoz();
					break;
				default:
					console.warn(`Unknown action: ${action.name}`);
					break;
			}
		},
		continueMission() {
			this.NPCModal = undefined;
			this.$emit('continueMission');
		},
		endMission(dinozId: number) {
			this.missionReward = undefined;
			const dinozToUpdate = useDinozStore().getDinoz(dinozId) as DinozFiche;
			dinozToUpdate.missionHUD = null;
			dinozToUpdate.missionId = undefined;
			useDinozStore().setDinoz(dinozToUpdate);
			this.$emit('endMission');
		},
		async validateMission() {
			this.missionReward = undefined;
			await this.refreshDinoz();
			await this.$refreshGold();
		},
		npcDisplayName(npcId: number) {
			return Object.values(npcList).find(npc => npc.id === npcId)?.name;
		},
		goToLeader() {
			if (!this.leaderDinoz) return;
			this.$router.push({ name: 'DinozPage', params: { id: this.leaderDinoz.id } });
		}
	},
	computed: {
		UnavailableReason() {
			return UnavailableReason;
		},
		isSelling() {
			return this.dinoz?.unavailableReason === UnavailableReason.selling;
		},
		hpRegen() {
			const currentDinoz = useDinozStore().getCurrentDinoz;
			if (!currentDinoz) {
				this.$toast.open({
					message: 'Dinoz not found',
					type: 'error'
				});
				return;
			}
			const skills = toSkillDetails(currentDinoz.skills);
			const priest = playerStore().isPriest;
			return (
				getSpecialStat(
					currentDinoz,
					currentDinoz.status.map(s => s.statusId),
					skills,
					SpecialStat.HP_REGEN,
					priest
				)?.value ?? 1
			);
		},
		missionName() {
			if (!this.dinoz) {
				return;
			}
			if (this.dinoz.missionId) {
				return missionsList[this.dinoz.missionId];
			}
			return undefined;
		},
		storeMission() {
			return (
				useDinozStore().getDinozList.find(dinoz => dinoz.id.toString() === this.$route.params.id)?.missionHUD || null
			);
		},
		leaderDinoz() {
			if (!this.dinoz) {
				return;
			}
			if (!this.dinoz.leaderId) return;
			return useDinozStore().getDinoz(this.dinoz.leaderId);
		},
		dinoz() {
			return useDinozStore().getDinoz(+this.$route.params.id);
		},
		dinozFullParty() {
			return useDinozStore().getDinozParty(+this.$route.params.id);
		}
	},
	watch: {
		storeMission: function (mission: MissionHUD) {
			this.mission = mission;
		}
	},
	async mounted() {
		const intervalId = window.setInterval(() => this.computeTimeUntilMidnight(), 1000);
		const intervalId2 = window.setInterval(() => this.computeTimeUntilNextHour(), 1000);
		const intervalId3 = window.setInterval(() => this.updateAttackCountdown(), 1000);
		const intervalId4 = window.setInterval(() => this.computeTimeUntilAvailable(), 1000);
		this.intervals.push(intervalId, intervalId2, intervalId3, intervalId4);
	},
	unmounted() {
		this.intervals.forEach(clearInterval);
	}
});
</script>

<style lang="scss" scoped>
.follow {
	padding: 5px 5px 5px 20px;
	background-color: #bc683c;
	background-image: url('../../assets/icons/small_missAct.webp');
	background-position: 5px 8px;
	background-repeat: no-repeat;
	line-height: 10pt;
	overflow: hidden;
	cursor: pointer;
	font-style: italic;
	color: #fce3bc;
	font-size: 9pt;
	align-self: stretch;
}

.actions {
	background:
		url('../../assets/background/banniere_left.webp') no-repeat,
		url('../../assets/background/banniere_right.webp') no-repeat,
		url('../../assets/background/banniere_middle.webp') repeat-x;
	background-position-x: left, right, center;
	background-color: #d19860;
	background-size: auto;
	box-shadow: inset 0 0 1px 2px #d3a76a;
	border-style: hidden solid solid solid;
	border-width: 0 1px 1px 1px;
	border-color: #9f5841;
	//float: left;
	//width: 185px;
	min-height: 90px;
	max-width: 221px;
	color: white;
	display: flex;
	flex-direction: column;
	gap: 0.2rem;

	.action {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		margin-right: 5px;
		border-radius: 7px;
		font-size: 11pt;
		font-variant: small-caps;
		line-height: 10.5pt;
		font-weight: 700;
		width: 100%;

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
			text-shadow: 0.5px 0 1px grey;
			text-transform: uppercase;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			font-weight: bold;
		}
	}

	.action_content {
		margin-bottom: 5px;
		display: flex;
		flex-direction: column;
		align-items: baseline;
		gap: 2px;
		padding-left: 5px;
		padding-right: 5px;
	}
}

@media (max-width: 539px) {
	.actions {
		width: 95%;
		max-width: 100%;

		.action_content {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			flex-wrap: wrap;
			gap: 0.2rem;

			.action {
				width: 46%;
			}

			.follow {
				width: 100%;
			}
		}
	}
}

.selling {
	margin-right: 1px;
}
</style>
