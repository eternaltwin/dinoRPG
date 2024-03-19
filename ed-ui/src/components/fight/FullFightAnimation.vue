<template>
	<div id="pixiCanvas"></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Fight } from '@drpg/dino-animation';
import { dinozStore } from '../../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { resolveFightingPlace, transpileFight } from '../../utils/transpileFight.js';

export default defineComponent({
	name: 'Fight',
	data() {
		return {
			dinoz: dinozStore().getDinoz(parseInt(this.$route.params.dinozId as string)) as DinozFiche,
			hidden: true
		};
	},
	props: {
		history: {
			type: Array as PropType<Array<FightStep>>
		},
		place: {
			type: Number,
			required: true
		}
	},
	mounted() {
		const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
		const allDinoz = [this.dinoz];
		if (this.dinoz.followers.length > 0) {
			this.dinoz.followers.forEach(d => allDinoz.push(dinozStore().getDinoz(d)));
		}
		/*
		const fighters = allDinoz.map(dino => {
			return {
				action: DinoAnim.Action.Add,
				fighter: {
					props: [],
					dino: true,
					life: dino.life,
					name: dino.name,
					side: true,
					scale: 1,
					fid: 0,
					gfx: dino.display
				}
			};
		});*/

		const nexFight = transpileFight(this.history!, this.$t);
		const initPlace = resolveFightingPlace(this.place);
		const fight2 = new Fight({
			...initPlace,
			history: nexFight.filter(n => n != undefined)
		});

		console.log(this.history);
		console.log(nexFight.filter(n => n != undefined));
		canvas.appendChild(fight2.getDisplay());
	}
});
</script>

<style scoped lang="scss">
#pixiCanvas {
	margin-left: 21px;
}
</style>
