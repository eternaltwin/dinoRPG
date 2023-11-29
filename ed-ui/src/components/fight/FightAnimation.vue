<template>
	<canvas id="pixiCanvas"></canvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Application, Sprite, Container } from 'pixi.js';
import { dinozStore } from '../../store/index.js';
import { placeList } from '../../constants/index.js';
import { sdino } from '@drpg/dino-animation';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

export default defineComponent({
	name: 'Fight',
	data() {
		return {
			dinoz: dinozStore().getDinoz(parseInt(this.$route.params.dinozId as string)) as DinozFiche,
			allDinoz: [] as Array<sdino>
		};
	},
	computed: {
		place(): string | null {
			if (!this.dinoz) return this.place;
			const place = Object.values(placeList).find(place => place.placeId === this.dinoz.placeId);
			if (!place) return this.place;
			return place.name;
		}
	},
	methods: {
		addDinozToCanvas(display: string, posX: number, posY: number): sdino {
			const dinoz = new sdino({
				data: display,
				flip: 1,
				pflag: true
			});
			const scale = 0.00428571 * this.dinoz.maxLife + 1.07143; // Calcul arbitraire pour que scale = 1.5 à 100HP et 3 à 450HP
			dinoz.setTransform(0, 0, scale, scale);
			dinoz.x = posX;
			dinoz.y = posY;
			dinoz.playAnim('walk');
			this.allDinoz.push(dinoz);
			return dinoz;
		}
	},
	mounted(): void {
		const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
		const display: Application = new Application({
			width: 420,
			height: 320,
			background: '#FBDAA0',
			view: canvas
		});
		const myStage = display.stage as Container;

		//Set background
		const background = new URL(`/src/assets/battle/${this.place}.webp`, import.meta.url).toString();
		const backSprite = Sprite.from(background);
		myStage.addChild(backSprite);

		//Add Dinoz
		myStage.addChild(this.addDinozToCanvas(this.dinoz.display, 50, 250));

		//Animate Dinoz
		let elapsed = 0.0;
		display.ticker.add(delta => {
			elapsed += delta;
			this.allDinoz[0].x = 50.0 + Math.cos(elapsed / 100.0) * 15.0;
			this.allDinoz[0].y = 250.0 + Math.cos(elapsed / 100.0) * 15.0;
		});
	}
});
</script>

<style scoped lang="scss"></style>
