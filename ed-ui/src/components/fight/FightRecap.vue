<template>
	<div class="wrapper">
		<div class="debrief" :class="lang">
			<img
				v-if="fight.result"
				:src="getImgURL('design', `large_fight_win`)"
				alt="win"
				v-tippy="{
					content: formatContent($t(`fight.win`)),
					theme: 'small'
				}"
			/>
			<img
				v-else
				:src="getImgURL('design', `large_fight_lose`)"
				alt="lose"
				v-tippy="{
					content: formatContent($t(`fight.lose`)),
					theme: 'small'
				}"
			/>
			<div class="results life">{{ fight.hpLost }}</div>
			<div class="results xp">
				{{ fight.xpEarned }}
				<img
					v-if="fight.result && fight.levelUp"
					:src="getImgURL('icons', `small_lup`)"
					alt="lup"
					v-tippy="{
						content: formatContent($t(`fight.lvlup`)),
						theme: 'small'
					}"
				/>
			</div>
			<div class="results money">{{ fight.goldEarned }}</div>
		</div>
		<a class="button" @click="returnToDinoz()">{{ $t(`fight.continue`) }}</a>
		<a class="button" v-if="isDevEnv()" @click="$emit('fightAgain')">[Dev] Fight again</a>
		<a class="button" @click="$emit('displayFight')">{{ $t(`fight.display`) }}</a>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { localStore } from '../../store/localStore.js';
import { FightResult } from '@drpg/core/models/fight/FightResult';

export default defineComponent({
	data() {
		return {
			lang: localStore().getLanguage ?? 'fr'
		};
	},
	props: {
		fight: {
			type: Object as PropType<FightResult>,
			required: true
		}
	},
	methods: {
		isDevEnv(): boolean {
			return import.meta.env.MODE === 'development';
		},
		returnToDinoz(): void {
			this.$router.go(-1);
		}
	}
});
</script>

<style lang="scss" scoped>
.results {
	position: absolute;
	padding-left: 20px;
	margin-top: 18px;
	width: 80px;
	text-align: left;
	font-size: 15pt;
	color: white;
}
.life {
	margin-left: 53px;
}
.xp {
	margin-left: 148px;
}

.money {
	margin-left: 243px;
}

.debrief {
	// position: absolute;
	flex: 1 1 100%;
	width: 377px;
	height: 56px;
	margin-left: 66px;
	padding-left: 10px;
	padding-right: 10px;
	color: #ffee92;
	img {
		margin-top: 10px;
		margin-left: 5px;
		position: absolute;
	}
}

.fr {
	background-image: url('../../assets/background/debriefing_fr.webp');
	background-repeat: no-repeat;
}
.es {
	background-image: url('../../assets/background/debriefing_es.webp');
	background-repeat: no-repeat;
}
.en {
	background-image: url('../../assets/background/debriefing_en.webp');
	background-repeat: no-repeat;
}
.de {
	background-image: url('../../assets/background/debriefing_de.webp');
	background-repeat: no-repeat;
}
.filler {
	height: 180px;
	width: 550px;
}
.wrapper {
	display: flex;
	justify-content: space-around;
	gap: 10px;
	flex-wrap: wrap;
}
</style>
