<template>
	<div class="actions">
		<Resurrect :enabled="resurect" @close="resurect = false" />
		<NPCModal v-if="NPCModal" :text="NPCModal" :npcName="npcName" @close="continueMission()" />
		<div class="actions_top">
			<p>{{ $t('layout.action') }}</p>
		</div>
		<MissionHUD v-if="missionId" :missionId="missionId" @abort="endMission()" />
		<MissionRewardModal :missionReward="missionReward" @close="endMission()" />
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
						<td v-else-if="action.name === 'mission' && missionAction === 'validate'" class="label">
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
								v-else-if="action.name === 'mission' && missionAction === 'validate'"
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
import { defineComponent, PropType, defineAsyncComponent } from 'vue';
import { shopNameList, npcNameList, missionsList } from '@/constants';
import { Action } from '@/models';
import { sessionStore } from '@/store';
import EventBus from '@/events';
import { MissionService } from '@/services';
import { errorHandler } from '@/utils/index.js';
import { FightService } from '@/services';

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
			missionReward: undefined as string | undefined,
			sessionStore: sessionStore()
		};
	},
	components: {
		Resurrect: defineAsyncComponent(() => import('@/components/modal/ResurrectModal.vue')),
		MissionHUD: defineAsyncComponent(() => import('@/components/dinoz/MissionHUD.vue')),
		NPCModal: defineAsyncComponent(() => import('@/components/modal/NPCModal.vue')),
		MissionRewardModal: defineAsyncComponent(() => import('@/components/modal/MissionRewardModal.vue'))
	},
	props: {
		dinozActions: Object as PropType<Array<Action>>,
		missionId: Number
	},
	methods: {
		async launch(action: Action): Promise<void> {
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
						query: { dinozId: this.$route.params.id.toString() }
					});
					EventBus.emit('isLoading', false);
					break;
				case 'resurrect':
					this.resurect = true;
					break;
				case 'mission':
					if (this.missionAction === 'validate') {
						this.missionReward = await MissionService.interactMission(
							this.$route.params.id.toString(),
							this.missionId!,
							action.prop as string
						);
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
				default:
					break;
			}
		},
		continueMission(): void {
			this.NPCModal = undefined;
			this.$emit('continueMission');
		},
		endMission(): void {
			this.missionReward = undefined;
			this.mission = undefined;
			this.$router.go(0);
		}
	},
	computed: {
		missionAction(): string | undefined {
			return this.mission?.split('(')[0];
		},
		missionName(): string | undefined {
			if (this.missionId) {
				return missionsList[this.missionId!];
			}
			return undefined;
		}
	}
});
</script>

<style lang="scss" scoped>
.actions {
	background: url('@/assets/background/banniere_left.webp') no-repeat,
		url('@/assets/background/banniere_right.webp') no-repeat, url('@/assets/background/banniere_middle.webp') repeat-x;
	background-position-x: left, right;
	float: left;
	left: 12px;
	top: -14px;
	position: relative;
	width: 185px;
	min-height: 90px;
	color: white;
	position: relative;
	flex-grow: 50%;
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
		border-spacing: 0px;
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
				font-size: 0pt;
				line-height: 0pt;
			}
		}
	}
}
</style>
