<template>
	<TitleHeader :title="`${$t('pageTitle.dinoz')}${dinozData.name}]`"></TitleHeader>
	<div class="ml-[-20px] flex min-w-full items-center justify-center sm:ml-0 sm:block">
		<a
			class="h-[21px] w-[15px] cursor-pointer bg-transparent bg-[url('./assets/icons/left.webp')] sm:absolute sm:ml-[205px] sm:mt-[69px]"
			@click="goToDinozPage(-1)"
		/>
		<div
			class="flex h-[33px] w-[222px] items-center justify-center bg-[url('./assets/background/name_box.webp')] bg-no-repeat text-[15pt] font-bold uppercase tracking-wider text-[#fce3bc] sm:absolute sm:ml-[240px] sm:mt-[62px]"
			style="
				text-shadow:
					-1px -1px 0px #68361b,
					1px 1px 0px #ddad8c;
			"
		>
			{{ dinozData.name }}
		</div>
		<a
			class="h-[21px] w-[15px] cursor-pointer bg-transparent bg-[url('./assets/icons/right.webp')] sm:absolute sm:ml-[490px] sm:mt-[69px]"
			@click="goToDinozPage(1)"
		/>
	</div>

	<Tippy theme="normal" tag="div" class="ml-[-20px] flex min-w-full items-center justify-center sm:ml-0 sm:block">
		<Suspense>
			<DinozWithoutFlash
				:display="dinozData.display"
				:life="dinozData.life / dinozData.maxLife"
				:flip="-1"
				:race="dinozData.race.raceId"
				:key="dinozData.life || dinozData.display"
				:isFrozen="dinozData?.unavailableReason === UnavailableReasonFront.frozen"
				class="absolute mt-[180px] h-[165px] w-[200px] bg-[url('./assets/background/dinoz_bg_cut.webp')] bg-cover bg-no-repeat sm:mt-[40px] sm:bg-none"
				style="background-position: 0px 25px"
			/>
			<template #fallback> <Loading class="absolute mt-[130px] sm:ml-[80px]" /> </template>
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
