<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.welcome`)" />
	<div class="wrapper" v-if="myDojo">
		<div class="header df">
			<div class="buttons">
				<img
					@click="goToPage('DojoChallenge')"
					:src="getImgURL('icons', 'act_dojo')"
					v-tippy="{
						content: formatContent($t('dojo.accessChallenges')),
						theme: 'small'
					}"
				/>
				<img
					@click="goToPage('ChallengeFriend')"
					:src="getImgURL('design', 'dojo_test')"
					v-tippy="{
						content: formatContent($t('dojo.testDinoz')),
						theme: 'small'
					}"
				/>
				<img
					@click="goToPage('DojoHistory')"
					:src="getImgURL('design', 'dojo_history')"
					v-tippy="{
						content: formatContent($t('dojo.fightHistory')),
						theme: 'small'
					}"
				/>
				<!--			<img
					@click="goToPage('DojoTeam')"
					:src="getImgURL('icons', 'act_dojo')"
					v-tippy="{
						content: formatContent($t('dojo.team')),
						theme: 'small'
					}"
				/>
				<img
					@click="goToPage('DojoTournament')"
					:src="getImgURL('icons', 'act_dojo')"
					v-tippy="{
						content: formatContent($t('dojo.tournaments')),
						theme: 'small'
					}"
				/>
				<img
					:src="getImgURL('icons', 'act_dojo')"
					class="disabled"
					v-tippy="{
						content: formatContent($t('dojo.build')),
						theme: 'small'
					}"
				/>-->
			</div>
			<div class="header-text df jcsb">
				<p class="ttu">
					{{ $t('dojo.reputation') }} : {{ myDojo.reputation }} {{ $t('dojo.points') }} - {{ $t('dojo.worth') }} :
					{{ worth }}%
				</p>
				<p>{{ $t('dojo.ranking') }} : --</p>
			</div>
		</div>
	</div>
	<RouterView />
	<!--	<p class="subtitle">{{ $t('dojo.tidInProgress') }}</p>
	<DZButton @click="goToPage('DojoTournament')">{{ $t('dojo.accessTournament') }}</DZButton>
	<DZDisclaimer round help :content="$t('dojo.disclaimer')" />-->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { playerStore } from '../store/index.js';
import EventBus from '../events/index.js';
import { DojoBasic } from '@drpg/core/models/dojo/dojoBasic';
import { DojoService } from '../services/DojoService.js';
import { errorHandler } from '../utils/index.js';

export default defineComponent({
	name: 'DojoHome',
	components: {
		TitleHeader
	},
	data() {
		return {
			playerStore: playerStore(),
			myDojo: undefined as undefined | DojoBasic,
			worth: 0
		};
	},
	methods: {
		goToPage(pageName: string) {
			this.$router.push({ name: pageName });
		},
		async refresh() {
			EventBus.emit('isLoading', true);
			try {
				this.myDojo = await DojoService.getMyDojo();
				EventBus.emit('isLoading', false);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
			if (this.myDojo) {
				const totalVictory = this.myDojo.DojoChallengeHistory.filter(f => f.victory).length;
				const totalFight = this.myDojo.DojoChallengeHistory.length;
				const worth = Math.round((totalVictory / totalFight) * 100);
				this.worth = isNaN(worth) ? 0 : worth;
			}
		}
	},
	async mounted() {
		EventBus.on('refreshDojo', async e => {
			if (e) await this.refresh();
		});
		await this.refresh();
	},
	unmounted() {
		EventBus.off('refreshDojo');
	}
});
</script>

<style lang="scss" scoped>
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}

.wrapper {
	background-color: #4d2713;
	margin-bottom: 8px;
	border: 1px solid #bc683c;
	align-self: center;
	max-width: 530px;
	width: 95%;

	.header {
		background-image: url('../assets/background/home_dojo.webp');
		background-repeat: no-repeat;
		align-items: center;

		height: 288px;
		flex-direction: column-reverse;

		.header-text {
			width: 96%;
			padding: 4px;
			//background-color: rgba(0, 0, 0, 0.5);
			color: #fff;

			p:last-child {
				color: #aae59c;
			}
		}
	}

	.buttons {
		display: flex;
		gap: 8px;
		padding: 8px;
		height: 47px;
		align-self: baseline;

		img {
			display: block;
			cursor: pointer;
			flex-shrink: 0;
			flex-grow: 0;
			height: 50px;

			&.disabled {
				filter: grayscale(100%);
			}
		}
	}
}
</style>
