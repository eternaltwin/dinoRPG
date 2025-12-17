<template>
	<div class="dinozList">
		<Tippy class="dinoz" tag="div" v-for="(dinoz, index) in sortedDinozList" :key="index" theme="small">
			<Suspense>
				<DinozWithoutFlash :display="dinoz.display" :life="1" flip :isFrozen="dinoz.isFrozen" />
				<template #fallback><Loading /></template>
			</Suspense>
			<div class="name" @click="goToDinoz(dinoz.id)" :class="myAccount ? 'link' : ''">
				{{ dinoz.name }}
			</div>
			<div class="dinozInfo">
				{{ $t(`race.name.${raceList[dinoz.race.raceId]}`) }}
				{{ $t(`myAccount.level`) }} {{ dinoz.level }}
			</div>
			<template v-if="dinoz.status && dinoz.status.length > 0" #content>
				<template v-for="(status, index) in dinoz.status" :key="index">
					<img
						v-if="statusList.displayed[status]"
						:src="getImgURL('status', `fx_${statusList.imgName[status]}`)"
						:alt="statusList.imgName[status]"
					/>
				</template>
			</template>
		</Tippy>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { raceList, statusList } from '../../constants/index.js';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { DinozPublicFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { dinozPlacement } from '../../constants/index.js';
import { playerStore } from '../../store/index.js';
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';

export default defineComponent({
	name: 'MyDinoz',
	components: {
		DinozWithoutFlash: defineAsyncComponent(() => import('../../components/dinoz/DinozWithoutFlash.vue'))
	},
	props: {
		accountData: {
			type: Object as PropType<PlayerInfo>
		}
	},
	data() {
		return {
			UnavailableReasonFront,
			raceList: raceList,
			statusList: statusList,
			position: dinozPlacement,
			sortedDinozList: [] as DinozPublicFiche[]
		};
	},
	methods: {
		style(dinoz: DinozPublicFiche): string {
			const race = Object.entries(raceList).find(race => parseInt(race[0]) === dinoz.race.raceId)?.[1];
			//TODO it's disabled because we disabled the vue dinoz
			if (race === 'moueffeDisabled' || race === 'pigmouDisabled') {
				const taille = parseInt(dinoz.display[1] === 'A' ? '9' : dinoz.display[1]);
				const left =
					((dinozPlacement.noFliped[dinoz.display[0]].adult.left -
						dinozPlacement.noFliped[dinoz.display[0]].baby.left) /
						9) *
						taille +
					dinozPlacement.noFliped[dinoz.display[0]].baby.left;
				const top =
					((dinozPlacement.noFliped[dinoz.display[0]].adult.top - dinozPlacement.noFliped[dinoz.display[0]].baby.top) /
						9) *
						taille +
					dinozPlacement.noFliped[dinoz.display[0]].baby.top;
				return `position: absolute; left: ${left}px; top: ${top}px;`;
			}
			return 'top: -15px; left: -15px;';
		},
		goToDinoz(dinozId: number) {
			if (!this.myAccount) return;
			this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
		},
		updateSortedDinozList() {
			this.sortedDinozList =
				this.accountData?.dinoz
					.slice()
					.sort((a, b) => {
						if (a.order === null) {
							a.order = a.id;
						}
						if (b.order === null) {
							b.order = b.id;
						}
						if (a.order === b.order) {
							return a.name.localeCompare(b.name);
						}
						return a.order - b.order;
					})
					.sort((a, b) => {
						if (a.isFrozen && !b.isFrozen) {
							return 1;
						} else if (!a.isFrozen && b.isFrozen) {
							return -1;
						}
						return 0;
					}) ?? [];
		}
	},
	computed: {
		myAccount(): boolean {
			return playerStore().getPlayerId === (this.$route.params.id as string);
		}
	},
	watch: {
		accountData: {
			immediate: true,
			handler() {
				this.updateSortedDinozList();
			}
		}
	},
	mounted() {
		this.updateSortedDinozList();
	}
});
</script>
<style lang="scss" scoped>
.dinozList {
	display: flex;
	gap: 5px;
	justify-content: space-evenly;
	flex-wrap: wrap;
	.dinoz {
		width: 170px;
		background-color: #fbdba8;
		cursor: default;
		border: 1px solid #fce3bc;
		border-radius: 10px;
		-webkit-border-radius: 10px;
		&:hover {
			border: 1px solid #f1c98e;
		}
		img {
			width: 100%;
		}
	}
}
.name {
	text-align: center;
	font-weight: bold;
	line-height: 10pt;
	color: #52646b;
	background-color: transparent;
}
.dinozInfo {
	text-align: center;
	font-size: 9pt;
	line-height: 10pt;
	color: #bc683c;
	width: 170px;
	margin-bottom: 8px;
}
.link:hover {
	text-decoration: underline;
	cursor: pointer;
}
</style>
