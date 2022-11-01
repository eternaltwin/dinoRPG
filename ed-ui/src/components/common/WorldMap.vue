<template>
	<div class="map_container" @mousemove="parallax($event)">
		<div
			class="full_map"
			:style="{
				left: `${-left}px`,
				top: `${-top}px`,
				position: 'relative',
				float: 'left',
				transform: `translateX(${-translation.x}px)translateY(${-translation.y}px)`
			}"
		>
			<template v-for="(place, index) in placeMap" :key="index">
				<img
					class="icon"
					:class="{
						myPos: myPos(place.placeId),
						canGo: canGo(place.placeId)
					}"
					:src="getImgURL('map/icon', place.icon)"
					:alt="place.icon"
					:style="{ left: place.posLeft + 'px', top: place.posTop + 'px' }"
					@click="moveTo(place.placeId)"
					@mouseenter="isHover(place.name, place.placeId, true)"
					@mouseleave="isHover(place.name, place.placeId, false)"
					v-tippy="{
						content: formatContent($t(`place.name.${place.name}`)),
						theme: 'small'
					}"
				/>
			</template>
			<svg
				version="1.1"
				width="100%"
				height="100%"
				:viewBox="svgSize"
				xmlns="http://www.w3.org/2000/svg"
				style="z-index: 100; position: absolute"
				id="svgDraw"
			>
				<template v-for="(line, index) in svgLines" :key="index">
					<line :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" :id="line.name" class="svgLine" />
				</template>
			</svg>
			<img class="map-img" ref="carte" :src="getImgURL('map/map', getPlaceMap())" :alt="getPlaceMap()" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { placeList } from '@/constants';
import { Dinoz, FightResult, Place, svgLines } from '@/models';
import { sessionStore } from '@/store';
import EventBus from '@/events';
import { DinozService } from '@/services';
import { errorHandler } from '@/utils';

export default defineComponent({
	name: 'WorldMap',
	props: {
		dinozData: Object as PropType<Dinoz>
	},
	data() {
		return {
			sessionStore: sessionStore(),
			placeMap: [] as Array<Place>,
			translation: {
				x: 0 as number,
				y: 0 as number
			},
			left: undefined as number | undefined,
			top: undefined as number | undefined,
			svgLines: [] as Array<svgLines>,
			svgSize: undefined as string | undefined
		};
	},
	methods: {
		parallax(e: MouseEvent) {
			const rect: DOMRect = document.querySelector('.map_container')!.getBoundingClientRect(); //taille du wrapper (250*300)
			const mapImage = document.querySelector('.full_map')!.getBoundingClientRect(); //taille de l'image de la map
			const xFactor = placeList.find(place => place.placeId === this.dinozData!.placeId)!.xFactor;
			const yFactor = placeList.find(place => place.placeId === this.dinozData!.placeId)!.yFactor;
			const centerMapY = mapImage.height - rect.height;
			const centerMapX = mapImage.width - rect.width;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			this.translation.x = Math.floor((-1 * (centerX - mouseX)) / xFactor);
			this.translation.y = Math.floor((-1 * (centerY - mouseY)) / yFactor);

			// Protect the translation top overflow
			if (this.top! + this.translation.y < 0) {
				this.translation.y = -this.top!;
			} else if (this.top! + this.translation.y > centerMapY) {
				this.translation.y = 0;
			}
			// Protect the translation left overflow
			if (this.left! + this.translation.x < 0) {
				this.translation.x = -this.left!;
			} else if (this.left! + this.translation.x > centerMapX) {
				this.translation.x = 0;
			}
		},
		getPlaceMap(): string {
			return placeList.find(place => place.placeId === this.dinozData!.placeId)!.map;
		},
		centerPos(mapImage: DOMRect) {
			const rect: DOMRect = document.querySelector('.map_container')!.getBoundingClientRect(); // taille du wrapper (250*300)
			const centerMapY: number = mapImage.height - rect.height;
			const centerMapX: number = mapImage.width - rect.width;
			const centerX: number = rect.width / 2;
			const centerY: number = rect.height / 2;
			const actualPlace = placeList.find(place => place.placeId === this.dinozData!.placeId)!;

			this.left = actualPlace.posLeft - centerX;
			this.top = actualPlace.posTop - centerY;
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
		},
		async moveTo(placeId: number): Promise<void> {
			if (!this.dinozData!.borderPlace?.includes(placeId)) {
				return;
			}

			EventBus.emit('isLoading', true);
			try {
				const moveTry: FightResult = await DinozService.betaMove(this.dinozData!.id!, placeId);
				moveTry.dinozId = this.dinozData!.id!;
				this.sessionStore.setFightResult(moveTry);
				// Update Dinoz Place in the store if fight is win
				if (moveTry.result) {
					const dinozList: Array<Dinoz> = this.sessionStore.getDinozList!;
					const dinozToUpdate = dinozList.find(dinozs => dinozs.id == this.dinozData!.id!)!;
					if (placeList.find(place => place.placeId === placeId)?.alias) {
						placeId = placeList.find(place => place.placeId === placeId)!.alias!;
					}
					dinozToUpdate.placeId = placeId;
					this.sessionStore.setDinozList(dinozList);
				}
				EventBus.emit('isLoading', false);
				this.$router.push({
					name: 'Fight'
				});
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		},
		myPos(placeId: number): boolean {
			return placeId === this.dinozData!.placeId;
		},
		canGo(placeId: number): boolean {
			return this.dinozData!.borderPlace!.includes(placeId);
		},
		svgMagic(mapImage: DOMRect): void {
			let mapX = 0;
			let mapY = 0;
			if (mapImage.height > mapImage.width) {
				this.svgSize = `0 0 ${(mapImage.width / mapImage.height) * 100} 100`;
				mapY = 100;
				mapX = (mapImage.width / mapImage.height) * 100;
			} else {
				this.svgSize = `0 0 100 ${(mapImage.height / mapImage.width) * 100}`;
				mapY = (mapImage.height / mapImage.width) * 100;
				mapX = 100;
			}
			const actualPlace: Place | undefined = placeList.find(place => place.placeId === this.dinozData!.placeId);
			const x1 = ((actualPlace!.posLeft + 8.5) / mapImage.width) * mapX;
			const y1 = ((actualPlace!.posTop + 8.5) / mapImage.height) * mapY;

			this.dinozData!.borderPlace!.forEach(closePlace => {
				const place: Place = placeList.find(place => place.placeId === closePlace)!;
				const x2: number = ((place.posLeft! + 8.5) / mapImage.width) * mapX;
				const y2: number = ((place.posTop! + 8.5) / mapImage.height) * mapY;
				this.svgLines.push({ x1, y1, x2, y2, name: place.name });
			});
		},
		isHover(placeName: string, placeId: number, state: boolean): void {
			const line: Element | null = document.querySelector(`#${placeName}`);
			if (this.canGo(placeId)) {
				state ? line!.classList.add('isHover') : line!.classList.remove('isHover');
			}
		},
		waitForImageToLoad(): void {
			setTimeout(() => {
				const mapImage: DOMRect = (this.$refs.carte as Element).getBoundingClientRect();
				if (mapImage.width === 0) {
					this.waitForImageToLoad();
				} else {
					this.centerPos(mapImage);
					this.svgMagic(mapImage);
				}
			}, 100);
		}
	},
	mounted(): void {
		const map = placeList.find(place => place.placeId === this.dinozData!.placeId)!.map;
		// We only keep places that belong to the current map and places that dinoz can reach (useful for hidden ones)
		this.placeMap = placeList.filter(
			place => place.map === map && (!place.hidden || this.dinozData!.borderPlace!.includes(place.placeId) || place.placeId === this.dinozData?.placeId)
		);

		this.waitForImageToLoad();
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
.myPos {
	filter: drop-shadow(1px 1px 2px white) drop-shadow(-1px -1px 2px white);
}
.canGo {
	cursor: pointer;
}
.imgHidden {
	display: none;
}
.icon {
	position: absolute;
	pointer-events: auto;
	z-index: 200;
	&:hover {
		animation: blinker 1s linear infinite;
		filter: drop-shadow(0 0 2px white);
	}
}
.isHover {
	stroke-dasharray: 1;
	animation: svgAnime 20s linear infinite;
}
.svgLine {
	stroke: gray;
	stroke-width: 1px;
}
@keyframes blinker {
	50% {
		filter: brightness(150%) drop-shadow(0 0 2px white);
	}
}

@keyframes svgAnime {
	0% {
		stroke-dashoffset: 100;
	}
	100% {
		stroke-dashoffset: 0;
	}
}
</style>
