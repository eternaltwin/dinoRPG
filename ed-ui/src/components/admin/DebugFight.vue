<template>
	<label for="dinoz1">Dinoz 1 </label>
	<input id="dinoz1" v-model="dinoz1" type="number" />
	<label for="dinoz2">Dinoz 2 </label>
	<input id="dinoz2" v-model="dinoz2" type="number" />
	<label for="seed">Seed </label>
	<input id="seed" v-model="seed" type="text" />
	<input type="radio" id="classic" value="classic" v-model="type" />
	<label for="classic">classic</label>
	<input type="radio" id="gameDinoz" value="gameDinoz" v-model="type" />
	<label for="gameDinoz">gameDinoz</label>
	<input type="radio" id="dojo" value="dojo" v-model="type" />
	<label for="dojo">dojo</label>
	<DZButton @click="sendToServer()">Send</DZButton>
	<template v-if="fightTransformed">
		<div v-show="loaded" class="content">
			<Suspense>
				<FullFightAnimation :fight="fightTransformed" />
				<template #fallback> <Loading /> </template>
			</Suspense>
		</div>
	</template>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import { AdminService } from '../../services/index.js';
import DZButton from '../common/DZButton.vue';
import { resolveFightingPlace, transpileFight } from '../../utils/transpileFight.js';
import { preFightLoader } from '@drpg/core/models/fight/transpiler';

export default defineComponent({
	name: 'debugFight',
	components: { DZButton, FullFightAnimation: defineAsyncComponent(() => import('../fight/FullFightAnimation.vue')) },
	data() {
		return {
			dinoz1: undefined as number | undefined,
			dinoz2: undefined as number | undefined,
			seed: undefined as string | undefined,
			type: 'classic' as 'classis' | 'gameDinoz' | 'dojo',
			fightTransformed: undefined as undefined | preFightLoader,
			loaded: false
		};
	},
	methods: {
		async sendToServer(): Promise<void> {
			this.fightTransformed = undefined;
			this.loaded = false;
			if (this.dinoz1 && this.dinoz2 && this.seed) {
				const fight = await AdminService.debugFight(this.dinoz1, this.dinoz2, this.seed, this.type);
				const nexFight = transpileFight(
					structuredClone(toRaw(fight.fighters)),
					fight.steps,
					this.$t,
					fight.winner,
					undefined,
					undefined,
					undefined,
					true
				);
				if (!nexFight) {
					return;
				}
				const initPlace = resolveFightingPlace(116);
				this.fightTransformed = {
					...initPlace,
					history: nexFight.filter(n => n != undefined)
				};
				this.loaded = true;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
form {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	border-spacing: 2px;
	padding: 5px;
	fieldset {
		border: 2px solid #bc683c;
		margin: 15px 0;
		padding: 20px;
		width: 90%;
	}
	legend {
		font-size: 13pt;
		text-shadow: 1px 1px 0px #356847;
		padding-left: 8px;
		padding-right: 8px;
		padding-bottom: 8px;
		height: 41px;
		color: #fffdba;
		text-transform: uppercase;
		font-weight: bold;
		letter-spacing: 1.5pt;
		text-align: left;
		border: 1px solid #356847;
		background-color: #c64e36;
		background-image: url('../../assets/background/table_header.webp');
		background-position: left bottom;
		width: 60%;
	}
	div {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
	}
	label {
		display: block;
		margin-bottom: 5px;
		color: #710;
		font-size: 9pt;
	}
	input[type='text'] {
		width: calc(100% - 20px);
		padding: 5px;
		margin-top: 5px;
		margin-bottom: 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
	}
	input[type='submit'] {
		margin-top: 20px;
		background-color: #c64e36;
		color: #fffdba;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		border-radius: 5px;
	}
}
input[type='text'],
select {
	padding: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
.title {
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 5px;
}
</style>
