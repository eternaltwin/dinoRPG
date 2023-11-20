<template>
	<canvas id="pixiCanvas"></canvas>
	<button @click="doAnimation('stand')">Pause</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { sdino } from '@drpg/dinoAnimation';
import { Application, Sprite } from 'pixi.js';

export default defineComponent({
	data() {
		return {
			pixiCanvas: {} as Application,
			allDinoz: [] as Array<sdino>
		};
	},
	props: {
		dinoz: { type: Object, required: true },
		placeName: { type: String, required: true }
	},
	mounted(): void {
		const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;

		this.pixiCanvas = new Application({
			width: 420,
			height: 320,
			background: '#FBDAA0',
			view: canvas
		});

		this.pixiCanvas.stage.addChild(Sprite.from(this.getBackground(this.placeName)));

		this.addDinozToCanvas(this.dinoz.display, 50, 250);

		let elapsed = 0.0;

		this.pixiCanvas.ticker.add(delta => {
			elapsed += delta;
			this.allDinoz[0].x = 50.0 + Math.cos(elapsed / 100.0) * 15.0;
			this.allDinoz[0].y = 250.0 + Math.cos(elapsed / 100.0) * 15.0;
		});

		for (const dinoz of this.allDinoz) {
			dinoz.playAnim('walk');
		}
	},
	methods: {
		addDinozToCanvas(display: string, posX: number, posY: number): void {
			const dinoz = new sdino({
				data: display,
				flip: 1,
				pflag: true
			});
			const scale = 0.00428571 * this.dinoz.maxLife + 1.07143; // Calcul arbitraire pour que scale = 1.5 à 100HP et 3 à 450HP
			dinoz.setTransform(0, 0, scale, scale);

			this.pixiCanvas.stage.addChild(dinoz);

			dinoz.x = posX;
			dinoz.y = posY;

			this.allDinoz.push(dinoz);
		},
		doAnimation(animationType: string): void {
			for (const dinoz of this.allDinoz) {
				if (animationType === 'stand') {
					if (this.pixiCanvas.ticker.started) {
						dinoz.playAnim(animationType);
						this.pixiCanvas.ticker.stop();
					} else {
						this.pixiCanvas.ticker.start();
						dinoz.playAnim('walk');
					}
				}
			}
		},
		getBackground(imgName: string): string {
			return new URL(`/src/assets/battle/${imgName}.webp`, import.meta.url).toString();
		}
	}
});
</script>
