<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<dialog ref="dialogRef">
		<div class="modal-title">{{ $t(`report.header`) }}</div>
		<form v-if="player" method="dialog">
			<div class="modal-content">
				<p class="small bold">{{ $t(`report.player`) }}</p>
				<p class="small">
					<span class="text-white">
						{{ $t(`report.specify`) }}
					</span>
					<template v-for="moderation in ModerationReasonFront" :key="moderation">
						<label class="block">
							<input type="radio" name="report_reason" v-model="reportedReason" :value="moderation" />
							{{ $t(`report.reason.${moderation}`) }}
						</label>
					</template>
					<select name="dinoz" v-model="selectedDinoz" v-if="reportedReason === ModerationReasonFront.DINOZNAME">
						<template v-for="(dinoz, index) in player.dinoz" :key="index">
							<option :value="dinoz">{{ dinoz.name }}</option>
						</template>
					</select>
				</p>
				<p class="small">
					<span class="text-white">
						{{ $t(`report.arguments`) }}
					</span>
					<textarea id="reportedArgument" v-model="reportedArgument" class="editTexte" />
				</p>
			</div>
		</form>
		<div class="buttons">
			<DZButton @click="reports">Send</DZButton>
			<DZButton @click="close">Close</DZButton>
		</div>
	</dialog>
</template>

<script lang="ts">
import EventBus from '../../events/index.js';
import { defineComponent } from 'vue';
import { Player, Dinoz } from '@drpg/prisma';
import { ReportService } from '../../services/index.js';
import DZButton from '../common/DZButton.vue';
import { ModerationReasonFront } from '@drpg/core/models/enums/ModerationReasonFront';
import { formatText } from '../../utils/formatText.js';
import { errorHandler } from '../../utils/index.js';

export default defineComponent({
	name: 'Report',
	components: { DZButton },
	data() {
		return {
			dialogRef: null as HTMLDialogElement | null,
			ModerationReasonFront: ModerationReasonFront,
			reportedArgument: undefined as undefined | string,
			selectedDinoz: undefined as undefined | Pick<Dinoz, 'id' | 'name'>,
			reportedReason: undefined as undefined | string,
			player: undefined as
				| undefined
				| (Pick<Player, 'id' | 'name' | 'customText'> & { dinoz: Pick<Dinoz, 'id' | 'name'>[] })
		};
	},
	methods: {
		dismiss(): void {
			EventBus.emit('report', undefined);
		},
		close(): void {
			if (this.dialogRef) {
				this.dialogRef.close();
			}
		},
		async reports(): Promise<void> {
			if (!this.reportedArgument || !this.reportedReason) {
				this.$toast.open({
					message: formatText(this.$t('report.error')),
					type: 'info'
				});
				return;
			}
			if (this.reportedReason === ModerationReasonFront.DINOZNAME && !this.selectedDinoz) {
				this.$toast.open({
					message: formatText(this.$t('report.errorDinoz')),
					type: 'info'
				});
				return;
			}
			if (!this.player) {
				this.$toast.open({
					message: formatText('No player found.'),
					type: 'info'
				});
				return;
			}

			try {
				await ReportService.reportPlayer(
					this.player?.id,
					this.reportedReason,
					this.reportedArgument,
					this.selectedDinoz?.id
				);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
			this.$toast.open({
				message: formatText(this.$t('report.success')),
				type: 'info'
			});
			this.close();
		}
	},
	mounted(): void {
		EventBus.on('report', async e => {
			this.player = await ReportService.getPlayer(e);
			if (this.dialogRef) {
				this.dialogRef.showModal();
			}
		});
		console.log(this.player);
		this.dialogRef = this.$refs.dialogRef as HTMLDialogElement;
	}
});
</script>

<style lang="scss" scoped>
dialog {
	background-color: #5c2b20;
	border: 1px solid #b37c4a;
	color: wheat;
	max-height: 100%;
	max-width: 500px;
	min-width: 200px;
	outline: 2px solid #000;
	overflow: auto;
	overflow: visible;
	padding: 0;
	width: auto;
	z-index: 1;
	position: fixed;
	&::backdrop {
		background: linear-gradient(0deg, rgba(107, 32, 17, 0.2), rgba(107, 32, 17, 0.4) 70%, rgba(0, 0, 0, 0.7));
	}
}
.modal-title {
	background-color: rgba(0, 0, 0, 0.25);
	font-size: 18px;
	font-weight: 700;
	line-height: 3rem;
	padding: 0 4rem 0 1rem;
}
.modal-content {
	min-height: 5rem;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
}
.block {
	display: block;
	line-height: 2rem;
}
.small {
	color: #ddab76;
	font-size: 1.1rem;
	display: flex;
	flex-direction: column;
}
.editTexte {
	min-height: 70px;
	max-height: 120px;
	height: 70px;
	overflow: auto;
	position: relative;
	font-size: 1.2rem;
	background-color: #9a4029;
	border: 1px solid #fbdfba;
	color: #fce3bb;
	line-height: 2rem;
	padding-left: 0.5rem;
}
.buttons {
	display: flex;
	justify-content: space-evenly;
	padding-bottom: 1rem;
}
</style>
