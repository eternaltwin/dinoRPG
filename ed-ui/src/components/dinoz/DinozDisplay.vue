<template>
	<TitleHeader :title="`${$t('pageTitle.dinoz')}${dinozData.name}]`"></TitleHeader>
	<div class="navigation">
		<router-link v-if="getDinozId(-1)" :to="{ name: 'DinozPage', params: { id: getDinozId(-1) } }" class="see-button">
			<img :src="getImgURL('icons', 'left')" />
		</router-link>
		<span class="title">
			{{ dinozData.name }}
		</span>
		<router-link v-if="getDinozId(-1)" :to="{ name: 'DinozPage', params: { id: getDinozId(1) } }" class="see-button">
			<img :src="getImgURL('icons', 'right')" />
		</router-link>
	</div>

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
		getDinozId(shift: number): void | number {
			if (!this.dinozStore.getDinozList) return;

			const currentIndex = this.dinozStore.getDinozList.findIndex(dinoz => dinoz.id === this.dinozData?.id);
			if (currentIndex === -1) return;

			const newIndex = currentIndex + shift;
			if (newIndex < 0 || newIndex >= this.dinozStore.getDinozList.length) return 1;

			return this.dinozStore.getDinozList[newIndex].id;
		}
	}
});
</script>

<style lang="scss" scoped>
.navigation {
	grid-area: name;
	align-self: center;
	justify-self: center;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 33px;
	gap: 5px;
	.title {
		background: url('../../assets/background/name_box.webp') no-repeat;
		width: 222px;
		height: 33px;
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
}
#dinozVisual {
	grid-area: dinoz;
	align-self: center;
	justify-self: center;
	width: fit-content;
	height: fit-content;
	display: flex;
	align-items: center;
	justify-content: center;
	max-width: 150px;
	//margin-top: 40px;
}
</style>
