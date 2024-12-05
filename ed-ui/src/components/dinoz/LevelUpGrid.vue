<template>
	<div class="container" ref="grid">
		<template v-for="(cell, index) in levelUpGrid" :key="index">
			<div class="box" :class="isSelected(index) && isSpinning ? 'active' : ''">
				<img :src="getImgURL('elements', `elem_${cell}`)" :alt="cell" :id="index" />
				<div class="effect" v-if="isSelected(index) && isSpinOver">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ElementType } from '@drpg/core/models/enums/ElementType';

export default defineComponent({
	name: 'LevelUpGrid',
	props: {
		grid: {
			type: Object as PropType<{
				fire: number;
				wood: number;
				water: number;
				lightning: number;
				air: number;
			}>,
			required: true
		},
		element: { type: Number, required: true }
	},
	data() {
		return {
			levelUpGrid: [] as Array<string>,
			selectedIndex: -1 as number,
			increment: 0 as number,
			isSpinOver: false as boolean,
			speed: 50 as number,
			isSpinning: false as boolean
		};
	},
	computed: {
		isSelected(): { (cellIndex: number): boolean } {
			return (cellIndex: number) => {
				return this.increment % 20 === cellIndex;
			};
		}
	},
	methods: {
		spin(): void {
			this.isSpinning = true;
			this.isSpinOver = false;
			const totalDuration = 6000;
			const startTime = Date.now();

			const animateSpin = () => {
				const elapsedTime = Date.now() - startTime;
				if (elapsedTime >= totalDuration && this.increment % 20 === this.selectedIndex) {
					this.isSpinOver = true;
					this.isSpinning = false;
					this.$emit('spinOver');
					return;
				}

				this.increment++;

				this.speed = this.calculateSpeed(elapsedTime, totalDuration);
				setTimeout(animateSpin, this.speed);
			};

			animateSpin();
		},
		calculateSpeed(elapsedTime: number, totalDuration: number): number {
			const progress = elapsedTime / totalDuration;
			const minSpeed = 50; // Vitesse maximale
			const maxSpeed = 200; // Vitesse minimale

			return minSpeed + (maxSpeed - minSpeed) * Math.pow(progress, 2);
		}
	},
	mounted(): void {
		const fire = new Array(this.grid.fire).fill('fire');
		const wood = new Array(this.grid.wood).fill('wood');
		const water = new Array(this.grid.water).fill('water');
		const lightning = new Array(this.grid.lightning).fill('lightning');
		const air = new Array(this.grid.air).fill('air');

		this.levelUpGrid = this.levelUpGrid.concat(fire).concat(wood).concat(water).concat(lightning).concat(air);

		const selectElement = this.levelUpGrid.reduce((a: Array<number>, e: string, i: number) => {
			if (e === ElementType[this.element].toLowerCase()) a.push(i);
			return a;
		}, []);
		this.selectedIndex = selectElement[Math.floor(Math.random() * selectElement.length)];
		this.isSpinning = !this.isSpinning;
		this.spin();
	}
});
</script>

<style lang="scss" scoped>
.container {
	width: 50%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	cursor: pointer;
}

.box {
	position: relative;
	width: 30px;
	height: 30px;
	margin: 0.15em;
	border: 2px solid #cb8354;
	border-radius: 4px;
	background: linear-gradient(180deg, #4f250d 0%, #a75532 10%, #cb8354 100%);
	box-shadow: 1px 3px 1px #622c0d;
	img {
		margin-top: 5px;
	}
}

.active {
	position: relative;
	z-index: 10;
	transform-style: preserve-3d;

	&:after {
		content: '';
		display: block;
		opacity: 1;
		position: absolute;
		top: -2px;
		left: -2px;
		width: 30px;
		height: 30px;
		border: 2px solid white;
		border-radius: 4px;
		box-shadow:
			0 0 6px white,
			0 0 12px white,
			0 0 16px white,
			0 0 6px 4px inset white;
	}
}
@keyframes fadeIn {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
.effect {
	transform: translateZ(-100px);
	top: -7px;
	left: -36px;
	right: 0;
	bottom: 0;
	position: absolute;
	z-index: 9;
	opacity: 1;
	width: 100px;
	height: 50px;

	div {
		position: absolute;
		width: 100px;
		height: 50px;
		background: rgb(255, 255, 255);
		background: radial-gradient(circle, rgba(255, 255, 255, 1) 10%, rgba(255, 255, 255, 0.2) 100%);
		border-radius: 50%;
		filter: blur(10px);

		animation-duration: 6s;
		animation-timing-function: cubic-bezier(0.25, 0, 0.75, 1);
		animation-iteration-count: infinite;
		animation-direction: alternate;

		&:nth-child(1) {
			animation-name: glow1;
			animation-duration: 8s;
		}
		&:nth-child(2) {
			animation-name: glow2;
			animation-duration: 12s;
		}
		&:nth-child(3) {
			animation-name: glow3;
			animation-duration: 16s;
		}
		&:nth-child(4) {
			animation-name: rev-glow1;
			animation-duration: 16s;
		}
		&:nth-child(5) {
			animation-name: rev-glow2;
			animation-duration: 12s;
		}
		&:nth-child(6) {
			animation-name: rev-glow3;
			animation-duration: 8s;
		}
	}
}

@keyframes glow1 {
	from {
		transform: rotate(65deg) scale(1.6, 0.3);
	}
	to {
		transform: rotate(245deg) scale(1.6, 0.3);
	}
}

@keyframes glow2 {
	from {
		transform: rotate(125deg) scale(1.3, 0.3);
	}
	to {
		transform: rotate(305deg) scale(1.3, 0.3);
	}
}

@keyframes glow3 {
	from {
		transform: rotate(15deg) scale(1.5, 0.3);
	}
	to {
		transform: rotate(195deg) scale(1.5, 0.3);
	}
}

@keyframes rev-glow1 {
	from {
		transform: rotate(105deg) scale(1.6, 0.3);
	}
	to {
		transform: rotate(-75deg) scale(1.6, 0.3);
	}
}

@keyframes rev-glow2 {
	from {
		transform: rotate(40deg) scale(1.3, 0.3);
	}
	to {
		transform: rotate(-140deg) scale(1.3, 0.3);
	}
}

@keyframes rev-glow3 {
	from {
		transform: rotate(170deg) scale(1.5, 0.3);
	}
	to {
		transform: rotate(-10deg) scale(1.5, 0.3);
	}
}
</style>
