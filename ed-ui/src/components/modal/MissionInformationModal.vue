<template>
	<Transition>
		<div v-if="enabled" class="modal-background">
			<div class="modal-box">
				<button class="modal-close" @click="$emit('close')">X</button>
				<p>{{ $t(`missions.description.${missionName}`) }}</p>
				<div class="option">
					<a v-if="mission?.status === 'ongoing'" class="button" @click="updateMission('stop')">
						{{ $t('missions.giveUp') }}
					</a>
					<a v-if="!dinoz.missionId && mission?.status === 'available'" class="button" @click="updateMission('start')">
						{{ $t('missions.accept') }}
					</a>
					<p v-if="dinoz.missionId && dinoz.missionId !== mission?.missionId">
						{{ $t('missions.already') }}
					</p>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { missionsList } from '../../constants/index.js';
import { MissionList } from '@drpg/core/models/missions/missionList';
import { dinozStore } from '../../store/index.js';
import { MissionService } from '../../services/index.js';
import EventBus from '../../events/index.js';
import { errorHandler } from '../../utils/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

export default defineComponent({
	name: 'MissionInformationModal',
	data() {
		return {
			dinozStore: dinozStore()
		};
	},
	props: {
		mission: Object as PropType<MissionList>,
		enabled: Boolean
	},
	methods: {
		async updateMission(status: string) {
			const dinozId = this.$route.params.id as string;
			EventBus.emit('isLoading', true);
			const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;
			const dinozToUpdate = dinozList.find(dinoz => dinoz.id!.toString() === dinozId)!;
			try {
				await MissionService.updateMissions(dinozId, this.mission!.missionId, status);
				if (status === 'start') {
					dinozToUpdate.missionId = this.mission!.missionId;
				} else {
					dinozToUpdate.missionId = undefined;
				}
				this.dinozStore.setDinozList(dinozList);
				EventBus.emit('isLoading', false);
				this.$emit('reload');
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		}
	},
	computed: {
		missionName(): string {
			return missionsList[this.mission!.missionId];
		},
		dinoz(): DinozFiche {
			const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;
			return dinozList.find(dinozs => dinozs.id == parseInt(this.$route.params.id as string))!;
		}
	}
});
</script>

<style lang="scss" scoped>
.modal-background {
	position: fixed;
	background: transparentize(#09092d, 0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;

	.modal-box {
		background-image: url('../../assets/background/mission.webp');
		background-repeat: no-repeat;
		width: 394px;
		height: 296px;
		position: absolute;
		background-color: #fff0d1;
		border-radius: 3px;
		border: 1px solid #efbf86;
		box-shadow:
			0 0 0 1px #aa885f,
			0 0 5px 1px #aa885f;
		animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
		p {
			margin-bottom: 5px;
			line-height: 12pt;
			padding-left: 35px;
			padding-right: 40px;
			padding-top: 25px;
			color: #9d6523;
			text-align: justify;
			font-size: 10pt;
		}
		.option {
			margin-left: 35px;
			margin-right: 35px;
			padding-top: 10px;
			border-top: 1px solid #e6b778;
			font-weight: bold;
			p {
				margin-bottom: 0;
				padding-left: 0;
				padding-right: 0;
				padding-top: 0;
				color: #9d6523;
				text-align: justify;
				font-size: 10pt;
			}
		}
	}
}

.v-enter-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
	animation-delay: 0.35s;
}
.v-leave-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
}

.v-enter-from {
	bottom: 0;
	opacity: 0;
}
.v-leave-to {
	bottom: 0;
	opacity: 0;
}

.modal-close {
	min-width: 31px;
	cursor: pointer;
	position: absolute;
	text-align: center;
	right: 0;
	top: 0;
	padding: 5px;
	background-color: #fadcb0;
	color: transparentize(brown, 0.4);
	font-size: 0.85em;
	letter-spacing: 0.03em;
	text-decoration: none;
	font-variant: small-caps;
	transition: all 0.15s;

	&:hover,
	&:focus,
	&:active {
		color: black;
	}
}

@keyframes blowUpModal {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}
</style>
