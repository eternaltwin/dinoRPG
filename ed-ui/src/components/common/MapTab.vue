<template>
	<div class="boxMap">
		<Map :placeMap="placeMap" :placeId="placeId" />
		<p class="placeName">
			{{ $t(`place.name.${getPlaceName(placeId)}`) }}
		</p>
	</div>
	<p class="placeDesc">
		{{ $t(`place.description.${getPlaceName(placeId)}`) }}
	</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dinoz, Place } from '@/models';
import Map from '@/components/common/map.vue';
import { placeList } from '@/constants';
import store from '@/store';

export default defineComponent({
	name: 'MapTab',
	components: {
		Map
	},
	data() {
		return {
			placeId: 1 as number,
			places: placeList,
			placeMap: [] as Array<Place>
		};
	},
	methods: {
		getPlaceName(placeId: number): string {
			return placeList.find(place => place.placeId === placeId)!.name;
		}
	},
	computed: {
		storePlace(): number {
			const dinozList: Array<Dinoz> = store.getters.getDinozList;
			const dinozToUpdate = dinozList.find(
				dinoz => dinoz.dinozId == this.$route.params.id
			)!;
			let placeUpdate: number = dinozToUpdate?.placeId;
			return placeUpdate;
		}
	},
	mounted(): void {
		const dinozList: Array<Dinoz> = store.getters.getDinozList;
		const dinozToUpdate = dinozList.find(
			dinoz => dinoz.dinozId == this.$route.params.id
		)!;
		let placeUpdate: number = dinozToUpdate.placeId;
		this.placeId = placeUpdate;

		this.places.forEach(place => {
			if (
				placeList.find(place => place.placeId === this.placeId)!.map ===
				place.map
			) {
				this.placeMap.push(place);
			}
		});
	},
	watch: {
		// Watch placeId in store. Each time placeId will change, the display will be updated
		storePlace: function(placeId: number) {
			this.placeId = placeId;
			//Clear the placeMap Array
			this.placeMap.splice(0, this.placeMap.length);
			// Fill placeMap Array with all the place in this map
			this.places.forEach(place => {
				if (
					placeList.find(place => place.placeId === this.placeId)?.map ===
					place.map
				) {
					this.placeMap.push(place);
				}
			});
		}
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
