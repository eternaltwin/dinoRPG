<template>
	<TitleHeader :title="`${$t('pageTitle.dinoz')}${dinozData.name}]`"></TitleHeader>
	<a class="left" @click="goToDinozPage(-1)" />
	<div class="title">
		{{ dinozData.name }}
	</div>
	<a class="right" @click="goToDinozPage(1)" />
	<Tippy theme="normal" tag="div" id="dinozVisual">
		<Suspense>
			<DinozWithoutFlash
				:display="dinozData.display"
				:life="dinozData.life / dinozData.maxLife"
				:flip="-1"
				:race="dinozData.race.raceId"
				:key="dinozData.life || dinozData.display"
				:isFrozen="dinozData?.unavailableReason === UnavailableReasonFront.frozen"
			/>
			<template #fallback> <Loading /> </template>
		</Suspense>
		<template #content>
			<h1>{{ $t(`race.name.${dinozRace}`) }}</h1>
			<p>
				{{ $t(`race.description.${dinozRace}`) }}
			</p>
		</template>
	</Tippy>
	<DinozElements :dinozData="dinozData" :key="dinozData" />
	<DinozBars :dinozData="dinozData" :key="dinozData" />
	<DinozEquip :dinozData="dinozData" :key="dinozData" />
	<DinozStatus :dinozStatus="dinozData.status" :key="dinozData" />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { dinozPlacement, raceList } from '../../constants/index.js';
import { dinozStore } from '../../store/index.js';
import DinozElements from '../../components/dinoz/DinozElements.vue';
import DinozBars from '../../components/dinoz/DinozBars.vue';
import DinozEquip from '../../components/dinoz/DinozEquip.vue';
import DinozStatus from '../../components/dinoz/DinozStatus.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';

export default defineComponent({
	name: 'DinozDisplay',
	components: {
		DinozElements,
		DinozBars,
		DinozEquip,
		DinozStatus,
		TitleHeader,
		DinozWithoutFlash: defineAsyncComponent(() => import('../../components/dinoz/DinozWithoutFlash.vue'))
	},
	data() {
		return {
			UnavailableReasonFront,
			dinozStore: dinozStore(),
			nameChoosen: undefined as boolean | undefined,
			position: dinozPlacement
		};
	},
	props: { dinozData: { type: Object as PropType<DinozFiche>, required: true } },
	computed: {
		dinozRace(): string {
			return Object.entries(raceList).find(race => parseInt(race[0]) === this.dinozData!.race?.raceId)![1];
		}
	},
	methods: {
		style(dinoz: string): string {
			if (this.dinozRace === 'moueffe' || this.dinozRace === 'pigmou') {
				const taille = parseInt(dinoz[1] === 'A' ? '9' : dinoz[1]);
				const left =
					((dinozPlacement.fliped[dinoz[0]].adult.left - dinozPlacement.fliped[dinoz[0]].baby.left) / 9) * taille +
					dinozPlacement.fliped[dinoz[0]].baby.left;
				const top =
					((dinozPlacement.fliped[dinoz[0]].adult.top - dinozPlacement.fliped[dinoz[0]].baby.top) / 9) * taille +
					dinozPlacement.fliped[dinoz[0]].baby.top;
				return `position: absolute; left: ${left}px; top: ${top}px;`;
			}
			return 'top: -15px;';
		},
		goToDinozPage(shift: number): void {
			if (!this.dinozStore.getDinozList) return;

			const currentIndex = this.dinozStore.getDinozList.findIndex(dinoz => dinoz.id === this.dinozData?.id);
			if (currentIndex === -1) return;

			const newIndex = currentIndex + shift;
			if (newIndex < 0 || newIndex >= this.dinozStore.getDinozList.length) return;

			this.$router.push({ name: 'DinozPage', params: { id: this.dinozStore.getDinozList[newIndex].id } });
		}
	}
});
</script>

<style lang="scss" scoped>
#dinozVisual {
	width: 200px;
	height: 165px;
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 40px;
}
.left {
	position: absolute;
	margin-left: 205px;
	margin-top: 69px;
	background-image: url('../../assets/icons/left.webp');
	background-color: transparent;
	width: 15px;
	height: 21px;
	border-radius: 0px;
	cursor: pointer;
}
.title {
	position: absolute;
	margin-top: 62px;
	background: url('../../assets/background/name_box.webp') no-repeat;
	width: 222px;
	height: 33px;
	margin-left: 240px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 15pt;
	font-weight: bold;
	text-transform: uppercase;
	letter-spacing: 1pt;
	color: #fce3bc;
	text-shadow:
		-1px -1px 0px #68361b,
		1px 1px 0px #ddad8c;
}

.right {
	position: absolute;
	margin-left: 490px;
	margin-top: 69px;
	background-image: url('../../assets/icons/right.webp');
	background-color: transparent;
	width: 15px;
	height: 21px;
	border-radius: 0px;
	cursor: pointer;
}
</style>
