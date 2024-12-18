<template>
	<table>
		<tr>
			<th>Player</th>
			<th>When</th>
			<th>Until</th>
			<th>Reason</th>
			<th>Ban Type</th>
			<th>Action</th>
		</tr>
		<template v-for="player in listBanned" :key="player.id">
			<tr>
				<td><DZUser :user="player" /></td>
				<td>{{ player.banCase.banDate }}</td>
				<td>{{ player.banCase.banEndDate }}</td>
				<td>{{ $t(`report.reason.${player.banCase.reason}`) }}</td>
				<td>{{ $t(`report.reason.${player.banCase.sorted}`) }}</td>
				<td>
					<select>
						<option value="null">Update Ban</option>
						<option
							v-for="(action, index) in ActionTypes"
							:key="index"
							:value="action"
							@click="selectBanUpdate(action)"
						>
							{{ action }}
						</option>
					</select>
					<DZButton @click="updateBan(player.id)">Update Ban</DZButton>
					<DZButton @click="cancelBan(player.id)">Cancel Ban</DZButton>
				</td>
			</tr>
		</template>
	</table>
	<button @click="page--" :disabled="page <= 1">Previous</button>
	<button @click="page++" :disabled="listBanned.length < 100">Next</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { errorHandler } from '../../utils/index.js';
import { AdminService } from '../../services/index.js';
import { BannedPlayerType } from '@drpg/core/models/admin/BannedPlayerType';
import DZUser from '../common/DZUser.vue';
import DZButton from '../common/DZButton.vue';
import EventBus from '../../events/index.js';

const ActionTypes = ['closed', 'warning', 'shortBan', 'mediumBan', 'longBan', 'infiniteBan'];

export default defineComponent({
	components: { DZButton, DZUser },
	data() {
		return {
			listBanned: [] as BannedPlayerType[],
			selectedBanUpdateAction: null as string | null,
			page: 1 as number,
			ActionTypes
		};
	},
	methods: {
		async getBannedPlayers() {
			EventBus.emit('isLoading', true);
			try {
				this.listBanned = await AdminService.getBannedPlayers(this.page);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		changePage(i: number) {
			this.page += i;
			this.getBannedPlayers();
		},
		selectBanUpdate(action: string) {
			this.selectedBanUpdateAction = action;
		},
		async updateBan(playerId: string) {
			EventBus.emit('isLoading', true);
			try {
				// Only the action can be updated here
				await AdminService.updateBan(playerId, this.selectedBanUpdateAction!, undefined, undefined, undefined);
				await this.getBannedPlayers();
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async cancelBan(playerId: string) {
			EventBus.emit('isLoading', true);
			try {
				await AdminService.cancelBan(playerId);
				await this.getBannedPlayers();
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	},
	async mounted() {
		await this.getBannedPlayers();
	}
});
</script>

<style lang="scss" scoped>
/* Style de base pour le tableau */
table {
	width: 100%;
	border-collapse: collapse; /* Supprime les espaces entre les cellules */
	margin: 20px 0;
	text-align: left;
}

/* Style pour les cellules */
th,
td {
	padding: 0.2rem; /* Ajoute de l'espace à l'intérieur des cellules */
	border: 1px solid #ddd; /* Bordure grise autour des cellules */
}

/* Style pour l'en-tête */
th {
	background-color: #4caf50; /* Fond vert pour l'en-tête */
	color: white; /* Texte blanc pour l'en-tête */
}

/* Alternance de couleur pour les lignes */
tr:nth-child(even) {
	background-color: #f2f2f2; /* Fond gris clair pour les lignes paires */
}

/* Style pour une ligne au survol */
tr:hover {
	background-color: #ddd; /* Fond plus foncé au survol */
}
</style>
