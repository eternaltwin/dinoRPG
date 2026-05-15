<template>
	<div id="boxMap">
		<WorldMap :dinozData="dinozData" :key="dinozData.borderPlace[0]" />
		<p class="placeName" v-if="dinozData">
			{{ $t(`place.name.${getPlaceName(dinozData.placeId)}`) }}
		</p>
	</div>
	<p class="placeDesc" v-if="dinozData">
		{{ $t(`place.description.${getPlaceName(dinozData.placeId)}`) }}
	</p>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { placeList } from '../../constants/index.js';
import WorldMap from '../../components/common/WorldMap.vue';
import dayjs from 'dayjs';
import { SWAMP_FLOODED_DAYS, SWAMP_FOG_DAYS } from '@drpg/core/models/place/PlaceList';

export default defineComponent({
	name: 'MapTab',
	props: { dinozData: { type: Object as PropType<DinozFiche>, required: true } },
	components: {
		WorldMap
	},
	methods: {
		getPlaceName(placeId: number): string {
			const place = placeList.find(place => place.placeId === placeId);
			if (!place) return '';

			if (place.placeId === 29) {
				const day = dayjs().utc().day();
				if (SWAMP_FLOODED_DAYS.includes(day)) {
					return 'marais_flood';
				} else if (SWAMP_FOG_DAYS.includes(day)) {
					return 'marais_fog';
				} else {
					return 'marais';
				}
			}
			return place.name;
		}
	}
});
</script>

<style lang="scss" scoped>
.placeDesc {
	padding: 0px;
	padding: 5px;
	font-size: 9pt;
	line-height: 10.5pt;
	font-style: italic;
	color: #fdf1c4;
	text-align: justify;
	cursor: help;
	background-color: #cd8956;
	border-radius: 10px;
	max-width: 95%;
}
#boxMap {
	display: block;
	width: 95%;
	border: 1px solid #874b2e;
	outline: 2px solid #cc8557;
	padding: 1px;
}
.placeName {
	display: block;
	height: 20px;
	padding-left: 8px;
	padding-top: 4px;
	color: #ffee92;
	font-size: 12pt;
	font-variant: small-caps;
	font-weight: bold;
	background-color: #bc683c;
	border-radius: 0px;
	text-align: justify;
}
</style>
