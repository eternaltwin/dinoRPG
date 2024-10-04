<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<TitleHeader :title="$t('pageTitle.dojo')" />
	<div class="section">
		<div class="titlePage">{{ $t(`dojo.welcome`) }}</div>
	</div>
	<div class="wrapper">
		<div class="header flex">
			<div class="header-text flex justify-between">
				<p class="ttu">{{ $t('dojo.reputation') }} : 0 {{ $t('dojo.points') }} - {{ $t('dojo.worth') }} : 0%</p>
				<p>{{ $t('dojo.ranking') }} : 29</p>
			</div>
		</div>
		<div class="buttons">
			<img
				@click="goToPage('DojoChallenges')"
				:src="getImgURL('icons', 'act_dojo')"
				v-tippy="{
					content: formatContent($t('dojo.accessChallenges')),
					theme: 'small'
				}"
			/>
			<img
				@click="goToPage('DojoTestDinoz')"
				:src="getImgURL('icons', 'act_dojo')"
				v-tippy="{
					content: formatContent($t('dojo.testDinoz')),
					theme: 'small'
				}"
			/>
			<img
				@click="goToPage('DojoHistory')"
				:src="getImgURL('icons', 'act_dojo')"
				v-tippy="{
					content: formatContent($t('dojo.fightHistory')),
					theme: 'small'
				}"
			/>
			<img
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
			/>
		</div>
	</div>
	<p class="subtitle">{{ $t('dojo.tidInProgress') }}</p>
	<DZButton @click="goToPage('DojoTournament')">{{ $t('dojo.accessTournament') }}</DZButton>
	<DZDisclaimer round help :content="$t('dojo.disclaimer')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { playerStore } from '../../store/index.js';
import DZButton from '../../components/common/DZButton.vue';
import DZDisclaimer from '../../components/common/DZDisclaimer.vue';

export default defineComponent({
	name: 'DojoHome',
	components: {
		TitleHeader,
		DZButton,
		DZDisclaimer
	},
	data() {
		return {
			playerStore: playerStore()
		};
	},
	methods: {
		goToPage(pageName: string) {
			this.$router.push({ name: pageName });
		}
	},
	async mounted() {}
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

	.header {
		background-image: url(https://placehold.co/530x250);
		background-repeat: no-repeat;
		height: 250px;
		align-items: end;

		.header-text {
			width: 100%;
			padding: 4px;
			background-color: rgba(0, 0, 0, 0.5);
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

		img {
			display: block;
			cursor: pointer;

			&.disabled {
				filter: grayscale(100%);
			}
		}
	}
}
</style>
