<template>
	<TitleHeader :title="$t('pageTitle.fight')" />
	<div class="section">
		<div class="titlePage">{{ $t(`fight.pageName`) }}</div>
	</div>
	{{ fightText }}
	{{ fightHistory }}
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
					v-if="fight.result && fight.xpEarned === 0"
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
		<a class="button" @click="returnToDinoz()">Continuer</a>
		<a class="button" v-if="isDevEnv()" @click="processFight()">Combattre de nouveau</a>
		<a class="button" @click="displayFight()">{{ $t(`fight.display`) }}</a>
	</div>
</template>

<script lang="ts">
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { FightService } from '../services/index.js';
import { localStore, sessionStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { errorHandler } from '../utils/index.js';
import EventBus from '../events/index.js';
import { defineComponent } from 'vue';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

export default defineComponent({
	name: 'Fight',
	components: {
		TitleHeader
	},
	data() {
		return {
			sessionStore: sessionStore(),
			fight: {} as FightResult,
			dinozId: undefined as number | undefined,
			lang: localStore().getLanguage ?? 'fr',
			fightText: undefined as string | undefined,
			fightHistory: undefined as string | undefined
		};
	},
	methods: {
		returnToDinoz() {
			this.$router.go(-1);
		},
		async processFight() {
			EventBus.emit('isLoading', true);
			try {
				const result: FightResult = await FightService.processFight(this.dinozId!);
				this.sessionStore.setFightResult(result);
				this.fight = this.sessionStore.getFightResult!;
				if (result.result) {
					const newMoney: number = this.sessionStore.getMoney! + this.fight.goldEarned;
					this.sessionStore.setMoney(newMoney);
					const dinozInStore: Array<DinozFiche> = this.sessionStore.getDinozList!;
					const dinoz: DinozFiche = dinozInStore.find(dinoz => dinoz.id! === this.dinozId)!;
					dinoz.experience! += this.fight.xpEarned;
				}
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		},
		isDevEnv(): boolean {
			return import.meta.env.MODE === 'development';
		},
		displayFight(): void {
			this.fightText = this.$t(`fight.resume`, { enemy: this.$t(`missions.target.${this.fight.opponent}`) });
			this.fightHistory = this.fight.history;
		}
	},
	created(): void {
		this.dinozId = parseInt(this.$router.currentRoute.value.query.dinozId as string);
		if (this.sessionStore.getFightResult) {
			this.fight = this.sessionStore.getFightResult;
			this.sessionStore.setMoney(this.sessionStore.getMoney! + this.fight.goldEarned);
		}
	},
	unmounted(): void {
		this.sessionStore.setFightResult(undefined);
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
	background-image: url('../assets/background/debriefing_fr.webp');
	background-repeat: no-repeat;
}
.es {
	background-image: url('../assets/background/debriefing_es.webp');
	background-repeat: no-repeat;
}
.en {
	background-image: url('../assets/background/debriefing_en.webp');
	background-repeat: no-repeat;
}
.de {
	background-image: url('../assets/background/debriefing_de.webp');
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
