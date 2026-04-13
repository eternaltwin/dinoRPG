<template>
	<Transition>
		<div v-if="missionReward" class="modal-background">
			<div class="modal-box">
				<div class="result">
					{{ $t(`missions.status.over`, { mission: $t(`missions.name.${missionName}`) }) }}
				</div>
				<p>{{ $t(`missions.dialog.${missionName}.${validator}`) }}</p>
				<ul>
					<template v-for="reward in missionReward" :key="reward">
						<li v-if="reward.rewardType === rewardEnum.EXPERIENCE">
							<img :src="getImgURL('icons', 'small_xp')" alt="xp" /> {{ reward.value }} {{ $t('missions.xp') }}
						</li>
						<li v-if="reward.rewardType === rewardEnum.GOLD">
							<img :src="getImgURL('icons', 'small_gold')" alt="or" /> {{ reward.value }} {{ $t('missions.gold') }}
						</li>
						<li v-if="reward.rewardType === rewardEnum.ITEM">
							<Tippy
								theme="normal"
								tag="img"
								:src="getImgURL('item', `item_${itemNameList[reward.value]}`)"
								:alt="itemNameList[reward.value]"
							>
								<template #content>
									<h1 v-html="formatContent($t(`item.name.${itemNameList[reward.value]}`))" />
									<p v-html="formatContent($t(`item.description.${itemNameList[reward.value]}`))" />
								</template>
							</Tippy>
							{{ $t(`item.name.${itemNameList[reward.value]}`) }} x {{ reward.quantity }}
						</li>
						<li v-if="reward.rewardType === rewardEnum.EPIC">
							<Tippy
								theme="normal"
								tag="img"
								:src="getImgURL('epicRewards', `collec_${rewardList[reward.value].name}`)"
								:alt="rewardList[reward.value].name"
							>
								<template #content>
									<h1 v-html="formatContent($t(`rewards.name.${rewardList[reward.value].name}`))" />
									<p v-html="formatContent($t(`rewards.description.${rewardList[reward.value].name}`))" />
								</template>
							</Tippy>
							{{ $t(`rewards.name.${rewardList[reward.value].name}`) }}
						</li>
						<li v-if="reward.rewardType === rewardEnum.STATUS && statusList.displayed[reward.value]">
							<img
								:src="getImgURL('status', `fx_${statusList.imgName[reward.value]}`)"
								:alt="statusList.imgName[reward.value]"
							/>
							{{ $t(`status.name.${reward.value}`) }}
						</li>
					</template>
				</ul>
				<div class="option">
					<a class="button" @click="$emit('close')">
						{{ $t('missions.continue') }}
					</a>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { missionsList, statusList } from '../../constants/index.js';
import { playerStore } from '../../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { rewardList } from '@drpg/core/models/reward/RewardList';

export default defineComponent({
	name: 'MissionRewardModal',
	data() {
		return {
			playerStore: playerStore(),
			rewardEnum: RewardEnum,
			itemNameList: itemNameList,
			rewardList: rewardList,
			statusList: statusList
		};
	},
	props: {
		missionReward: { type: Object as PropType<Array<Rewarder>>, required: true }
	},
	computed: {
		missionName(): string {
			const dinozId = this.$route.params.id as string;
			const dinozList: Array<DinozFiche> = useDinozStore().getDinozList;
			const myDinoz = dinozList.find(dinoz => dinoz.id.toString() === dinozId);
			const missionId = myDinoz?.missionId;
			return missionsList[missionId ?? -1];
		},
		validator(): string {
			const dinozId = this.$route.params.id as string;
			const dinozList: Array<DinozFiche> = useDinozStore().getDinozList;
			const myDinoz = dinozList.find(dinoz => dinoz.id.toString() === dinozId);
			return typeof myDinoz?.missionHUD?.target === 'string'
				? myDinoz.missionHUD?.target
				: typeof myDinoz?.missionHUD?.target[0] === 'string'
					? myDinoz.missionHUD?.target[0]
					: myDinoz?.missionHUD?.target[0].name || '';
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
		.result {
			font-size: 10pt;
			text-align: justify;
			line-height: 12pt;
			padding-bottom: 5px;
			margin: 25px 40px 5px 35px;
			color: black;
			font-weight: bold;
			border-bottom: 1px solid #e6b778;
		}
		p {
			margin-bottom: 5px;
			line-height: 12pt;
			padding-left: 35px;
			padding-right: 40px;
			color: #9d6523;
			text-align: justify;
			font-size: 10pt;
		}
		ul {
			width: 250px;
			list-style: none;
			margin-bottom: 15px;
			padding-left: 35px;
			padding-right: 40px;
			li {
				color: #ffee92;
				padding-left: 10px;
				padding-top: 1px;
				padding-bottom: 1px;
				margin-bottom: 2px;
				font-size: 10pt;
				background-color: #bc683c;
				border-radius: 10px;
				-webkit-border-radius: 10px;
			}
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
