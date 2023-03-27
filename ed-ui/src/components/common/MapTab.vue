<template>
	<div class="boxMap">
		<WorldMap :dinozData="dinozData" />
		<p class="placeName">
			{{ $t(`place.name.${getPlaceName(placeId)}`) }}
		</p>
	</div>
	<p class="placeDesc">
		{{ $t(`place.description.${getPlaceName(placeId)}`) }}
	</p>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { Dinoz } from '../../models';
import { placeList } from '../../constants';

export default defineComponent({
	name: 'MapTab',
	data() {
		return {
			placeId: undefined as number | undefined
		};
	},
	props: { dinozData: Object as PropType<Dinoz> },
	components: {
		WorldMap: defineAsyncComponent(() => import('../../components/common/WorldMap.vue'))
	},
	methods: {
		getPlaceName(placeId: number): string {
			return placeList.find(place => place.placeId === placeId)!.name;
		}
	},
	created(): void {
		this.placeId = this.dinozData!.placeId;
	}
});
</script>

<style lang="scss" scoped>
.placeDesc {
	margin: 0px;
	padding: 0px;
	margin-top: 5px;
	padding: 5px;
	font-size: 9pt;
	line-height: 10.5pt;
	font-style: italic;
	color: #fdf1c4;
	text-align: justify;
	cursor: help;
	background-color: #cd8956;
	border-radius: 10px;
	margin-left: 5px;
	max-width: 295px;
}
.boxMap {
	display: block;
	width: 300px;
	border: 1px solid #874b2e;
	outline: 2px solid #cc8557;
	padding: 1px;
	margin-left: 5px;
}
.placeName {
	display: block;
	height: 20px;
	padding-left: 8px;
	color: #ffee92;
	font-size: 12pt;
	font-variant: small-caps;
	font-weight: bold;
	background-color: #bc683c;
	border-radius: 0px;
	text-align: justify;
}
</style>
