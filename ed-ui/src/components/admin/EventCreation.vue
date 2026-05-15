<template>
	<DZTable>
		<tr>
			<th class="dinoz-header">ID</th>
			<th class="items-header">type</th>
			<th class="items-header">endDate</th>
			<th class="items-header">Config</th>
		</tr>
		<tr v-for="event in ongoing" :key="event.id">
			<td>{{ event.id }}</td>
			<td>{{ event.eventType }}</td>
			<td>{{ event.endDate }}</td>
			<td>{{ event.config }}</td>
		</tr>
	</DZTable>
	<form @submit.prevent="handleSubmit">
		<fieldset>
			<legend>Details</legend>
			<div>
				<label>Date de début</label>
				<input type="date" v-model="form.start" required />
			</div>
			<div>
				<label>Durée (semaines)</label>
				<input type="number" v-model.number="form.duration" min="1" required />
			</div>
		</fieldset>

		<fieldset>
			<legend>Places</legend>
			<div class="statuses">
				<label v-for="(value, key) in placesList" :key="key">
					<input type="checkbox" class="radio" :value="value.placeId" v-model="form.places" />
					{{ $t(`place.name.${value.name}`) }}
				</label>
			</div>
		</fieldset>

		<fieldset>
			<legend>Récompenses</legend>

			<div>
				<span class="title">Vainqueur</span>
				<select v-model="form.winner" multiple size="5">
					<option v-for="(value, key) in rewardsList" :key="key" :value="value.id">
						{{ $t(`rewards.name.${value.name}`) }}
					</option>
				</select>
			</div>

			<div>
				<span class="title">Podium</span>
				<select v-model.number="form.podium" multiple size="5">
					<option v-for="(value, key) in rewardsList" :key="key" :value="value.id">
						{{ $t(`rewards.name.${value.name}`) }}
					</option>
				</select>
			</div>

			<div>
				<span class="title">Participant</span>
				<select v-model.number="form.participant" size="5">
					<option v-for="(value, key) in rewardsList" :key="key" :value="value.id">
						{{ $t(`rewards.name.${value.name}`) }}
					</option>
				</select>
			</div>
		</fieldset>

		<input type="submit" value="Créer l'événement" />
	</form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService } from '../../services';
import { errorHandler } from '../../utils';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { RewardType } from '@drpg/core/models/reward/EpicReward';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { EventForm, OngoingEvent } from '@drpg/core/models/clan/clanEventConfig';
import DZTable from '../common/DZTable.vue';

export default defineComponent({
	name: 'EventCreation',
	components: { DZTable },
	data() {
		return {
			rewardsList: Object.values(rewardList).filter(r => r.type === RewardType.WAR),
			placesList: Object.values(placeList).filter(r => r.warPlace),
			form: {
				start: '',
				duration: 1,
				places: [],
				winner: null,
				podium: null,
				participant: null
			} as EventForm,
			ongoing: [] as OngoingEvent[]
		};
	},
	methods: {
		async handleSubmit() {
			try {
				if (!this.form.winner || !this.form.podium || !this.form.participant) {
					alert('Veuillez sélectionner toutes les récompenses.');
					return;
				}
				await AdminService.startClanWarEvent({
					start: this.form.start,
					duration: this.form.duration,
					places: this.form.places,
					winner: this.form.winner,
					podium: this.form.podium,
					participant: this.form.participant
				});
				this.ongoing = await AdminService.getOngoingEvent();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		try {
			this.ongoing = await AdminService.getOngoingEvent();
		} catch (e) {
			errorHandler.handle(e, this.$toast);
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
	input[type='text'],
	input[type='number'],
	input[type='date'],
	select {
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
.radio {
	padding-right: 10px;
	margin-left: 3px;
	margin-top: 3px;
}
.canChangeName,
.unavailableReason,
.statuses,
.skills {
	align-items: center;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 5px;
	margin-bottom: 5px;
}
.unlockable_skills {
	align-items: center;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 5px;
	margin-bottom: 5px;
}
.title {
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 5px;
}
</style>
