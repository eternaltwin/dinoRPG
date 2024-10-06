<template>
	<div class="ml-[-50px] mt-[40px] sm:ml-0 sm:mt-[20px]">
		<table class="min-w-full">
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
					<td><DZUser :user="mod.target" /></td>
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
					<td><DZButton>TODO</DZButton></td>
				</tr>
			</template>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { errorHandler } from '../../utils/index.js';
import { AdminService } from '../../services/index.js';
import { ModerationType } from '@drpg/core/models/admin/ModerationType';
import { ModerationReasonFront } from '@drpg/core/models/enums/ModerationReasonFront';
import DZUser from '../common/DZUser.vue';
import DZButton from '../common/DZButton.vue';

export default defineComponent({
	components: { DZButton, DZUser },
	data() {
		return {
			moderationLogs: [] as ModerationType[]
		};
	},
	methods: {
		getDisplay(id: number) {
			const m = this.moderationLogs.find(i => i.id === id);
			if (!m) return '';
			switch (m.reason) {
				case ModerationReasonFront.DINOZNAME:
					return m.dinoz?.name ?? 'error_dinoz';
				case ModerationReasonFront.ACCOUNTNAME:
					return m.target.name;
				case ModerationReasonFront.AVATAR:
					return 'noAvatarYet';
				case ModerationReasonFront.CUSTOMTEXT:
					return m.target.customText;
				case ModerationReasonFront.MULTI:
					return 'multi';
				default:
					return 'error';
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
