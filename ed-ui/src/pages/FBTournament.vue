<template>
	<div class="wrapper">
		<DZDisclaimer
			v-if="currentTournament"
			:content="$t('events.tournament.disclaimer', { level: currentTournament.level })"
		/>
		<div class="naming">
			<p class="name">{{ $t('chooseDinoz.nomDuDinoz') }}</p>
			<input type="text" v-model="name" />
			<DZButton @click="createDinoz()">{{ $t('button.name') }}</DZButton>
		</div>
		<div class="dinozList" v-if="dinoz.length > 0 && currentTournament">
			<template v-for="d in dinoz" :key="d.id">
				<div
					:class="{
						dinoz: true,
						levelup: d.level < currentTournament.level
					}"
					@click="levelUp(d.id)"
				>
					<DinozWithoutFlash :display="d.display" :life="1" flip />
					<div class="name">{{ d.name }}</div>
					<div class="dinozInfo">{{ $t(`myAccount.level`) }} {{ d.level }}</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { errorHandler } from '../utils/index.js';
import { FBService } from '../services/FBTournamentService.js';
import { FBParticipation, PublicFBTournament } from '@drpg/core/models/dojo/ForceBrute';
import DZButton from '../components/common/DZButton.vue';
import DinozWithoutFlash from '../components/dinoz/DinozWithoutFlash.vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import { formatText } from '../utils/formatText.js';

export default defineComponent({
	name: 'FBTournament',
	components: { DZDisclaimer, DinozWithoutFlash, DZButton },
	data() {
		return {
			currentTournament: undefined as undefined | PublicFBTournament,
			name: undefined as string | undefined,
			dinoz: [] as FBParticipation[]
		};
	},
	methods: {
		async getCurrentTournament() {
			try {
				this.currentTournament = await FBService.getCurrentTournament();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
			if (!this.currentTournament) {
				this.$toast.open({ message: formatText(this.$t(`toast.noFBTournament`)), type: 'error' });
				this.$router.push({
					name: 'News'
				});
			}
		},
		async myParticipation() {
			try {
				this.dinoz = await FBService.getTournamentParticipation();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async createDinoz() {
			if (!this.name) return;
			try {
				await FBService.createTournamentDinoz(this.name);
				await this.myParticipation();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		levelUp(dinozId: number) {
			const dinoz = this.dinoz.find(d => d.id === dinozId);
			const currentTournament = this.currentTournament;
			if (!dinoz || !currentTournament || dinoz.level >= currentTournament.level) return;
			this.$router.push({ name: 'Leveling', params: { id: dinoz.id }, query: { event: 'FBTournament' } });
		}
	},
	async mounted() {
		await this.getCurrentTournament();
		if (this.currentTournament) {
			await this.myParticipation();
		}
	}
});
</script>

<style scoped lang="scss">
.wrapper {
	display: flex;
	width: 90%;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}
.dinozList {
	display: flex;
	gap: 5px;
	justify-content: space-evenly;
	flex-wrap: wrap;
	.dinoz {
		width: 170px;
		height: 160px;
		background-color: #fbdba8;
		cursor: default;
		border: 1px solid #fce3bc;
		border-radius: 10px;
		-webkit-border-radius: 10px;
		&:hover {
			border: 1px solid #f1c98e;
		}
		img {
			width: 100%;
		}
		.name {
			text-align: center;
			font-weight: bold;
			line-height: 10pt;
			color: #52646b;
			background-color: transparent;
			margin-top: -25px;
		}
		.dinozInfo {
			text-align: center;
			font-size: 9pt;
			line-height: 10pt;
			color: #bc683c;
			width: 170px;
		}
	}

	.levelup {
		cursor: pointer;
		animation: blinker 1s linear infinite;
	}
}
@keyframes blinker {
	0% {
		border: 1px solid #f1c98e;
	}
	100% {
		border: 1px solid #bc683c;
	}
}
.naming {
	display: flex;
	align-items: center;
	max-width: 310px;
	flex-wrap: wrap;
	justify-content: center;
	gap: 10px;

	.name {
		width: 95px;
		text-align: center;
		font-variant: normal;
		font-weight: bold;
		font-size: 8pt;
		color: #ffee92;
		background-color: #e4aa69;
		border-radius: 10px;
		-webkit-border-radius: 10px;
		grid-column: 1;
		grid-row: 1;
	}
	input {
		width: 184px;
		height: 20px;
		padding-left: 8px;
		padding-right: 8px;
		padding-top: 2px;
		color: #ffee92;
		font-size: 9pt;
		font-weight: bold;
		border: none;
		background-image: url('../assets/design/form_field.webp');
		background-repeat: no-repeat;
		background-color: transparent;
		grid-column: 2 / 4;
		grid-row: 1;
	}
}
</style>
