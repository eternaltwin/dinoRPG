<template>
	<div class="map_container" @mousemove="paralax($event)">
		<div
			class="full_map"
			:style="{
				left: -left + `px`,
				top: -top + `px`,
				position: 'relative',
				float: 'left',
				transform:
					'translateX( ' +
					-1 * translation.x +
					'px)' +
					'translateY( ' +
					-1 * translation.y +
					'px)'
			}"
		>
			<template v-for="(place, index) in placeMap" :key="index">
				<img
					class="icon"
					:src="getImg('map', 'icon', place.icon)"
					:style="{ left: place.posLeft + 'px', top: place.posTop + 'px' }"
					v-tippy="{ content: $t(`place.name.${place.name}`), theme: 'map' }"
				/>
			</template>
			<img
				class="map-img"
				ref="carte"
				:src="getImg('map', 'map', getPlaceMap(placeId))"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { placeList } from '@/constants';
import { Dinoz, Place } from '@/models';
import store from '@/store';

export default defineComponent({
	name: 'Map',
	props: {
		placeMap: Array as PropType<Array<Place>>,
		placeId: Number
	},
	data() {
		return {
			parallax: {
				x: 0,
				y: 0
			},
			translation: {
				x: 0,
				y: 0
			},
			left: 0,
			top: 0
		};
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}/${imgName}.webp`);
		},
		paralax(e: MouseEvent) {
			let rect: DOMRect = document
				.querySelector('.map_container')!
				.getBoundingClientRect(); //taille du wrapper (250*300)
			let mapImage = document
				.querySelector('.full_map')!
				.getBoundingClientRect(); //taille de l'image de la map
			let centerMapY = mapImage.height - rect.height;
			let centerMapX = mapImage.width - rect.width;
			let centerX = rect.width / 2;
			let centerY = rect.height / 2;
			let mouseX = e.clientX - rect.left;
			let mouseY = e.clientY - rect.top;
			this.translation.x = Math.floor((-1 * (centerX - mouseX)) / 10);
			this.translation.y = Math.floor((-1 * (centerY - mouseY)) / 10);

			// Protect the translation top overflow
			if (this.top + this.translation.y < 0) {
				this.translation.y = 0;
			} else if (this.top + this.translation.y > centerMapY) {
				this.translation.y = 0;
			}
			// Protect the translation left overflow
			if (this.left + this.translation.x < 0) {
				this.translation.x = 0;
			} else if (this.left + this.translation.x > centerMapX) {
				this.translation.x = 0;
			}
		},
		getPlaceMap(placeId: number): string {
			return placeList.find(place => place.placeId === placeId)!.map;
		},
		centerPos() {
			setTimeout(() => {
				const mapImage: DOMRect = (this.$refs
					.carte as Element).getBoundingClientRect();
				if (mapImage.width === 0) {
					this.centerPos();
				} else {
					let rect: DOMRect = document
						.querySelector('.map_container')!
						.getBoundingClientRect(); //taille du wrapper (250*300)
					let centerMapY = mapImage.height - rect.height;
					let centerMapX = mapImage.width - rect.width;
					let centerX = rect.width / 2;
					let centerY = rect.height / 2;
					placeList.forEach(places => {
						if (this.placeId === places.placeId) {
							this.left = places.posLeft - centerX;
							this.top = places.posTop - centerY;
						}
					});
					// Protect the initial top overflow
					if (this.top + this.translation.y < 0) {
						this.top = 0;
					} else if (this.top + this.translation.y > centerMapY) {
						this.top = centerMapY;
					}
					// Protect the initial left overflow
					if (this.left + this.translation.x < 0) {
						this.left = 0;
					} else if (this.left + this.translation.x > centerMapX) {
						this.left = centerMapX;
					}
				}
			}, 250);
		}
	},
	mounted(): void {
		this.centerPos();
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
	watch: {
		// Watch the place in store. Each time the dinoz change place, the display will be updated
		storePlace: function() {
			// Recenter the PoV each time the store is update when the dinoz change its place
			this.centerPos();
		}
	}
});
</script>

<style lang="scss" scoped>
.map_container {
	height: 250px;
	overflow: hidden;
	position: relative;
	width: 300px;
}
.full_map {
	position: relative;
	width: fit-content;
	height: auto;
	transition: top 1s, left 1s;
	pointer-events: none;
}
.icon {
	position: absolute;
	pointer-events: auto;

	&:hover {
		animation: blinker 1s linear infinite;
		filter: drop-shadow(0 0 2px white);
	}
	@keyframes blinker {
		50% {
			filter: brightness(150%) drop-shadow(0 0 2px white);
		}
	}
}
</style>
