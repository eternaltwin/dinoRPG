<template>
	<table>
		<tr>
			<th>Reporter</th>
			<th>Reason</th>
			<th>Target</th>
			<th>Comment</th>
			<th>Display</th>
			<th>Action</th>
		</tr>
		<template v-for="mod in moderationLogs" :key="mod.id">
			<tr>
				<td><DZUser :user="mod.reporter" /></td>
				<td>{{ $t(`report.reason.${mod.reason}`) }}</td>
				<td>
					<template v-if="mod.targetClan">
						<div class="clan-display">
							<span class="clan-tag">{{ mod.targetClan.name }}</span>
							<DZUser :user="mod.target" :leader="true" />
						</div>
					</template>
					<div v-else-if="isClanReason(mod.reason)" class="clan-display">
						<span class="clan-tag">{{ $t('report.reason.deleted') }}</span>
						<DZUser :user="mod.target" />
					</div>
					<DZUser v-else :user="mod.target" />
				</td>
				<td>
					<DZButton
						v-tippy="{
							content: mod.comment,
							theme: 'small'
						}"
						>Voir</DZButton
					>
				</td>
				<td>
					<DZButton
						v-tippy="{
							content: getDisplay(mod.id),
							theme: 'small'
						}"
						>Voir</DZButton
					>
				</td>
				<td>
					<div class="action-cell">
						{{ mod.sorted ? $t(`report.sorted.${mod.sorted}`) : $t(`report.sorted.open`) }}
						<select @change="onActionChange($event)">
							<option value="null">{{ $t('Select action') }}</option>
							<option v-for="action in ModerationAction" :key="action" :value="action">
								{{ action }}
							</option>
						</select>
						<DZButton @click="takeAction(mod.id)">Take Action</DZButton>
						<RouterLink v-if="mod.targetClan" :to="`/admin/clan?id=${mod.targetClan.id}`">
							<DZButton>EDIT CLAN</DZButton>
						</RouterLink>
					</div>
				</td>
			</tr>
		</template>
	</table>
	<button @click="page--" :disabled="page <= 1">Previous</button>
	<button @click="page++" :disabled="moderationLogs.length < 100">Next</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { errorHandler } from '../../utils/index.js';
import { AdminService } from '../../services/index.js';
import { ModerationType } from '@drpg/core/models/admin/ModerationType';
import { ModerationReason, ModerationAction } from '@drpg/prisma/enums';
import DZUser from '../common/DZUser.vue';
import DZButton from '../common/DZButton.vue';

export default defineComponent({
	components: { DZButton, DZUser },
	data() {
		return {
			moderationLogs: [] as ModerationType[],
			selectedAction: null as ModerationAction | null,
			page: 1,
			ModerationAction
		};
	},
	methods: {
		getDisplay(id: number) {
			const m = this.moderationLogs.find(i => i.id === id);
			if (!m) return '';
			switch (m.reason) {
				case ModerationReason.dinozName:
					return m.dinoz?.name ?? 'error_dinoz';
				case ModerationReason.accountName:
					return m.target.name;
				case ModerationReason.avatar:
					return 'noAvatarYet';
				case ModerationReason.customText:
					return m.target.customText;
				case ModerationReason.multi:
					return 'multi';
				case ModerationReason.other:
					return 'other';
				case ModerationReason.clanBanner:
				case ModerationReason.clanBehavior:
				case ModerationReason.clanPages:
					return m.targetClan?.name ?? 'Clan';
				default:
					return 'error';
			}
		},
		onActionChange(event: Event) {
			const action = (event.target as HTMLSelectElement).value;
			if (action === 'null') {
				this.selectedAction = null;
			} else {
				this.selectedAction = action as ModerationAction;
			}
		},
		isClanReason(reason: ModerationReason) {
			return (
				reason === ModerationReason.clanBanner ||
				reason === ModerationReason.clanBehavior ||
				reason === ModerationReason.clanPages
			);
		},
		selectAction(action: ModerationAction) {
			this.selectedAction = action;
		},
		async takeAction(modId: number) {
			const selectedAction = this.selectedAction;
			if (!selectedAction) {
				this.$toast.open({ message: this.$t('popup.selectAction'), type: 'error' });
				return;
			}
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirmBanAction'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				try {
					await AdminService.takeAction(modId, selectedAction);
					this.moderationLogs.forEach(l => {
						if (l.id === modId) {
							l.sorted = selectedAction;
						}
					});
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		}
	},
	async mounted() {
		try {
			this.moderationLogs = await AdminService.getAllModeration(1);
		} catch (e) {
			errorHandler.handle(e, this.$toast);
			return;
		}
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

/* Style pour le tag de clan */
.clan-tag {
	display: flex;
	justify-content: center;
	font-size: 12px;
	background-color: #72433a;
	color: white;
	padding: 4px;
}

/* Style pour la cellule d'action */
.action-cell {
	display: flex;
	flex-direction: column;
	gap: 5px;
}
</style>
