<template>
	<TitleHeader :title="$t('pageTitle.selectDinoz')" />
	<div class="section">
		<div class="titlePage">{{ $t(`selectDinoz.selectChampions`) }}</div>
	</div>
	<p class="subtitle">{{ $t('selectDinoz.selectTeam') }}</p>
	<DZDisclaimer :content="$t('selectDinoz.disclaimer')" />
	<div class="wrapper">
		<div
			v-for="dinoz in dinozList"
			:key="dinoz.id"
			:class="['dinoz-button', { 'not-selected': !selectedDinoz.includes(dinoz.id) }]"
			@click="toggleDinoz(dinoz.id)"
		>
			<DinozMini :display="dinoz.display" class="background" />
			<div class="textbox">
				<p class="name">{{ dinoz.name }}</p>
				<p class="level">{{ $t('myAccount.level') }} {{ dinoz.level }}</p>
			</div>
		</div>
	</div>
	<div class="df jcc mt-1" v-if="selectedDinoz.length">
		<DZButton @click="validate">{{ $t('selectDinoz.validate') }}</DZButton>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import EventBus from '../../events/index.js';
import { dinozStore, playerStore } from '../../store/index.js';
import { errorHandler } from '../../utils/index.js';
import DZButton from '../../components/common/DZButton.vue';
import DinozMini from '../../components/dinoz/DinozMini.vue';
import DZDisclaimer from '../../components/common/DZDisclaimer.vue';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

export default defineComponent({
	name: 'SelectDinoz',
	components: {
		DinozMini,
		TitleHeader,
		DZButton,
		DZDisclaimer
	},
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			dinozList: [] as DinozFiche[],
			selectedDinoz: [] as number[]
		};
	},
	methods: {
		toggleDinoz(dinozId: number) {
			if (this.selectedDinoz.includes(dinozId)) {
				this.selectedDinoz = this.selectedDinoz.filter(id => id !== dinozId);
			} else {
				// Max 10
				if (this.selectedDinoz.length >= 10) {
					EventBus.emit('toast', { type: 'error', message: 'maxDinozSelected' });
					return;
				}

				this.selectedDinoz.push(dinozId);
			}
		},
		async validate() {
			// Do nothing if no dinoz selected
			if (this.selectedDinoz.length === 0) {
				EventBus.emit('toast', { type: 'error', message: 'noDinozSelected' });
				return;
			}

			try {
				// TODO
				// await DojoService.selectDinoz(this.selectedDinoz);
				// this.$router.push({ name: 'DojoChallenge' });
			} catch (error) {
				errorHandler.handle(error);
			}
		}
	},
	async mounted() {
		if (!this.dinozStore.dinozList) {
			EventBus.emit('toast', { type: 'error', message: 'dinozListMissing' });
			return;
		}
		this.dinozList = this.dinozStore.dinozList;
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
	display: flex;
	flex-wrap: wrap;
	justify-content: center;

	.dinoz-button {
		width: 96px;
		margin: 4px;
		border-radius: 5px;
		text-align: center;
		border: 1px solid #874b2e;
		cursor: pointer;
		user-select: none;

		.background {
			background-image: url('../../assets/battle/forcebrut.webp');
			background-repeat: no-repeat;
			background-size: cover;
		}

		.textbox {
			background: rgb(255 249 0);
			background: linear-gradient(180deg, rgb(255 249 0) 0%, rgb(176 153 20) 100%);
			border-top: 1px solid #874b2e;
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			font-size: 10px;
			font-weight: bold;

			.name {
				color: #874b2e;
			}

			.level {
				color: #fce3bc;
			}
		}

		&.not-selected {
			filter: grayscale(100%);
		}
	}
}
</style>
