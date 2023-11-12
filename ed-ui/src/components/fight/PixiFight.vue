<template>
	<canvas id="pixiCanvas"></canvas>
	<button @click="doAnimation('run')">Run</button>
	<button @click="doAnimation('stand')">Stand</button>
</template>

<script>
import { defineComponent } from 'vue';
import * as drpgAnim from './dinorpg-animations.js'; // eslint-disable-line

export default defineComponent({
	data() {
		return {
			pixiCanvas: {},
			allDinoz: []
		};
	},
	mounted() {
		const canvas = document.getElementById('pixiCanvas');

		this.pixiCanvas = new DinoAnim.Application({
			width: 150,
			height: 50,
			background: '#FBDAA0',
			view: canvas
		});

		this.addDinozToCanvas('09T1Yt9wqq4Rx000', 25, 25);
		this.addDinozToCanvas('17cbbjgep4hn580', 75, 25);
		this.addDinozToCanvas('29cbmkge54hn480', 125, 25);
	},
	methods: {
		/**
		 * @param {string} display
		 * @param {number} posX
		 * @param {number} posY
		 * @return {void}
		 */
		addDinozToCanvas(display, posX, posY) {
			const dinoz = new DinoAnim.sdino({
				data: display,
				flip: 1,
				pflag: true
			});

			this.pixiCanvas.stage.addChild(dinoz);

			dinoz.x = posX;
			dinoz.y = posY;

			this.allDinoz.push(dinoz);
		},
		/**
		 * @param {string} animationType
		 */
		doAnimation(animationType) {
			for (const dinoz of this.allDinoz) {
				dinoz.playAnim(animationType);
			}
		}
	}
});
</script>
