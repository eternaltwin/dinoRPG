<template>
	<Tippy theme="normal" tag="div" v-if="missionId" class="mission" @click="getInformation(mission)">
		<p class="dinozName">{{ dinozName }}</p>
		<p class="name">
			{{ $t(`missions.name.${missionName}`) }}
		</p>
		<div class="detail" v-if="missionDetail">
			<template v-if="missionDetail.actionType === MissionEnum.TALKTO">
				{{
					$t(`missions.actions.${missionDetail.action ?? missionDetail.actionType}`, {
						npc: $t(`missions.npc.${missionDetail.target}`)
					})
				}}
			</template>
			<template v-else-if="missionDetail.actionType === MissionEnum.LAUNCH_FIGHT">
				{{ $t(`missions.actions.${missionDetail.target}`) }}
			</template>
			<template v-else-if="missionDetail.actionType === MissionEnum.GIVE_ITEM">
				{{
					$t(`missions.actions.${missionDetail.actionType}`, {
						itemQuantity: missionDetail.itemQuantity,
						item: $t(`item.name.${missionDetail.item.name}`)
					})
				}}
			</template>
			<template v-else-if="missionDetail.actionType === MissionEnum.GOTO">
				{{
					$t(`missions.actions.${missionDetail.actionType}`, { place: $t(`missions.place.${missionDetail.target}`) })
				}}
			</template>
			<template v-else-if="missionDetail.actionType === MissionEnum.FINISH_MISSION">
				{{
					$t(`missions.actions.${missionDetail.actionType}`, { place: $t(`missions.place.${missionDetail.target}`) })
				}}
			</template>
			<template v-else-if="missionDetail.actionType === MissionEnum.HIDE_PLACE">
				{{ $t(`missions.actions.hidePlace`) }}
			</template>
			<template v-else-if="missionDetail.actionType === MissionEnum.DO">
				{{ $t(`missions.actions.${missionDetail.target}`) }}
			</template>
			<template v-else-if="missionDetail.actionType === MissionEnum.KILL">
				{{
					$t(`missions.actions.${missionDetail.actionType}`, {
						progress: missionDetail.progress,
						target: missionDetail.value,
						targetName: $t(`missions.target.${missionDetail.target.join(':')}`, missionDetail.value)
					})
				}}
			</template>
			<template v-else-if="missionDetail.actionType === MissionEnum.OVERWRITE">
				{{ $t(`missions.actions.${missionDetail.target}`) }}
			</template>
		</div>
		<template #content>
			<h1>{{ $t(`missions.name.${missionName}`) }}</h1>
			<p v-html="formatContent($t(`missions.description.${missionName}`))" />
			<div v-if="previousDialog" class="previous-step">
				<h2>{{ $t('missions.lastDialog') }}</h2>
				<p v-html="$t(`missions.dialog.${missionName}.${previousDialog}`)" />
			</div>
		</template>
	</Tippy>
	<MissionInformationModal
		:enabled="information"
		:mission="mission"
		:dinozId="dinozId"
		@close="information = !information"
		@reload="reload()"
	/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dinozStore, useLoadingStore } from '../../store/index.js';
import { missionsList } from '../../constants/index.js';
import { MissionList } from '@drpg/core/models/missions/missionList';
import { MissionsStatus } from '@drpg/core/models/enums/MissionsStatus';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { MissionHUD } from '@drpg/core/models/missions/missionHUD';
import MissionInformationModal from '../../components/modal/MissionInformationModal.vue';
import { npcList } from '@drpg/core/models/npc/NpcList';

export default defineComponent({
	name: 'MissionHUD',
	components: {
		MissionInformationModal
	},
	emits: ['abort'],
	data() {
		return {
			dinozStore: dinozStore(),
			information: false as boolean,
			MissionEnum: ConditionEnum
		};
	},
	methods: {
		getInformation(mission: MissionList): void {
			if (mission.status === 'ongoing' || mission.status === 'available') {
				this.information = !this.information;
			}
		},
		async reload(): Promise<void> {
			useLoadingStore().setLoaderOn();
			const dinozId = this.$route.params.id as string;
			const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList;
			const dinozToUpdate = dinozList.find(dinoz => dinoz.id.toString() === dinozId);

			if (dinozToUpdate) {
				dinozToUpdate.missionId = undefined;
				dinozToUpdate.missionHUD = null;
			}
			this.information = !this.information;
			this.$emit('abort');
			useLoadingStore().setLoaderOff();
		}
	},
	props: {
		missionId: { type: Number, required: true },
		dinozName: { type: String, required: true },
		dinozId: { type: Number, required: true }
	},
	computed: {
		missionName(): string {
			return missionsList[this.missionId];
		},
		missionDetail(): MissionHUD | null {
			const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList;
			const myDinoz = dinozList.find(dinoz => dinoz.id === this.dinozId);

			if (!myDinoz) {
				return null;
			}
			return myDinoz.missionHUD;
		},
		mission(): MissionList {
			return { missionId: this.missionId, status: MissionsStatus.ONGOING };
		},
		// Show previous dialog if we have to find a place
		previousDialog() {
			if (this.missionDetail?.actionType !== ConditionEnum.HIDE_PLACE) {
				return null;
			}

			// Check if we even have a previous step
			const mission = npcList[this.missionDetail.npc]?.missions?.find(m => m.missionId === this.missionId);

			if (!mission) {
				return null;
			}

			const previousStep = mission.steps.find(step => step.stepId === (this.missionDetail?.currentStep ?? 0) - 1);

			if (!previousStep) {
				return null;
			}

			return previousStep.displayedText;
		}
	}
});
</script>

<style lang="scss" scoped>
.dinozName {
	color: #ffee92;
	font-variant: small-caps;
	font-weight: bold;
}
.mission {
	//margin: 0 10px 10px;
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
	align-self: stretch;
}
.name {
	font-variant: small-caps;
	font-weight: bold;
	color: white;
}
.detail {
	font-style: italic;
	color: #fce3bc;
	font-size: 9pt;
}

.previous-step {
	margin-top: 8px;

	h2 {
		text-align: left;
		padding-left: 8px;
	}

	p {
		font-size: 9pt !important;
		line-height: 10.5pt !important;
		font-style: italic;
		color: #fdf1c4;
	}
}

@media (max-width: 539px) {
	.mission {
		width: 100%;
	}
}
</style>
