<template>
	<DZTable v-if="current">
		<tr>
			<th class="dinoz-header">ID</th>
			<th class="items-header">Phase</th>
			<th class="items-header">Début des inscriptions</th>
			<th class="items-header">Fin des inscriptions</th>
			<th class="items-header">Clans inscrits</th>
			<th class="items-header">Fin</th>
		</tr>
		<tr>
			<td>{{ current.id }}</td>
			<td>{{ current.phase }}</td>
			<td>{{ new Date(current.registrationStart).toLocaleString($i18n.locale) }}</td>
			<td>{{ new Date(current.registrationEnd).toLocaleString($i18n.locale) }}</td>
			<td>{{ current.registrations.length }}</td>
			<td>{{ new Date(current.endDate).toLocaleString($i18n.locale) }}</td>
		</tr>
	</DZTable>
	<div v-if="current && current.phase === 'registration'" class="championship-actions">
		<button v-if="!registrationsOpen" type="button" :disabled="submitting" @click="openRegistrations">
			Ouvrir les inscriptions maintenant
		</button>
		<button v-else type="button" :disabled="submitting" @click="startMatches">
			Clore les inscriptions et démarrer les matchs
		</button>
	</div>
	<form @submit.prevent="handleSubmit">
		<fieldset>
			<legend>Championnat des clans</legend>
			<div>
				<label>Date de début (un lundi)</label>
				<input type="date" v-model="form.start" required />
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

		<input type="submit" value="Lancer le championnat" :disabled="submitting" />
	</form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService, ClanChampionshipService } from '../../services';
import { errorHandler } from '../../utils';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { ChampionshipForm, ClanChampionshipDTO } from '@drpg/core/models/clan/clanChampionship';
import DZTable from '../common/DZTable.vue';

export default defineComponent({
	name: 'ChampionshipCreation',
	components: { DZTable },
	data() {
		return {
			placesList: Object.values(placeList).filter(r => r.warPlace),
			form: { start: '', places: [] } as ChampionshipForm,
			current: null as ClanChampionshipDTO | null,
			submitting: false as boolean
		};
	},
	computed: {
		registrationsOpen(): boolean {
			return !!this.current && new Date(this.current.registrationStart).getTime() <= Date.now();
		}
	},
	methods: {
		async runAction(message: string, action: () => Promise<void>) {
			if (this.submitting) return;
			const confirmed: boolean = await this.$confirm({
				message,
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-exclamation-triangle'
			});
			if (!confirmed) return;
			this.submitting = true;
			try {
				await action();
				await this.loadCurrent();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.submitting = false;
			}
		},
		async openRegistrations() {
			await this.runAction('Ouvrir dès maintenant les inscriptions du championnat ?', () =>
				AdminService.openChampionshipRegistrations()
			);
		},
		async startMatches() {
			await this.runAction(
				'Clore les inscriptions et démarrer la première journée immédiatement ? Cette action est définitive.',
				() => AdminService.startChampionshipMatches()
			);
		},
		async loadCurrent() {
			try {
				this.current = await ClanChampionshipService.getCurrent();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async handleSubmit() {
			if (this.submitting) return;
			this.submitting = true;
			try {
				await AdminService.startClanChampionship({ start: this.form.start, places: this.form.places });
				await this.loadCurrent();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.submitting = false;
			}
		}
	},
	async mounted() {
		await this.loadCurrent();
	}
});
</script>

<style lang="scss" scoped>
.championship-actions {
	margin-top: 10px;
	button {
		background-color: #c64e36;
		color: #fffdba;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		border-radius: 5px;
	}
}
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
		padding: 0 8px 8px;
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
	input[type='date'] {
		width: calc(100% - 20px);
		padding: 5px;
		margin: 5px 0 10px;
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
.statuses {
	align-items: center;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 5px;
	margin-bottom: 5px;
}
</style>
