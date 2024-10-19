<template>
	<dialog class="max-w-[80%] sm:max-w-[500px]" ref="dialogRef">
		<div class="bg-[#ae6139] pl-4 pr-16 text-[18px] font-bold leading-[3rem]">{{ $t(`report.header`) }}</div>
		<form v-if="player" method="dialog">
			<div class="flex min-h-20 flex-col gap-[1.2rem] p-4">
				<p class="text-[1.2rem] font-bold">{{ $t(`report.player`) }}</p>
				<p class="text-[1.2rem]">
					<span class="text-2xl font-bold text-white">
						{{ $t(`report.specify`) }}
					</span>
					<template v-for="moderation in ModerationReasonFront" :key="moderation">
						<label class="block leading-8">
							<input type="radio" name="report_reason" v-model="reportedReason" :value="moderation" />
							{{ $t(`report.reason.${moderation}`) }}
						</label>
					</template>
					<select
						class="bg-[#ae6139] p-2"
						name="dinoz"
						v-model="selectedDinoz"
						v-if="reportedReason === ModerationReasonFront.DINOZNAME"
					>
						<template v-for="(dinoz, index) in player.dinoz" :key="index">
							<option :value="dinoz">{{ dinoz.name }}</option>
						</template>
					</select>
				</p>
				<div class="flex flex-col">
					<span class="font-bold text-white">
						{{ $t(`report.arguments`) }}
					</span>
					<textarea
						id="reportedArgument"
						v-model="reportedArgument"
						class="relative h-[70px] max-h-[120px] min-h-[70px] overflow-auto border-2 border-[#fff0c5] bg-[#ae6139] pl-2 text-[1.2rem] leading-8 text-[#ffee92]"
					/>
				</div>
			</div>
		</form>
		<div class="flex justify-evenly pb-4">
			<DZButton @click="reports">{{ $t(`report.send`) }}</DZButton>
			<DZButton @click="close">{{ $t(`report.close`) }}</DZButton>
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
		openDialog() {
			if (this.dialogRef && !this.dialogRef.open) {
				this.dialogRef.showModal();
			}
		},
		close(): void {
			if (this.dialogRef) {
				this.dialogRef.close();
			}
			this.resetForm();
		},
		resetForm() {
			this.reportedArgument = '';
			this.reportedReason = '';
			this.selectedDinoz = undefined;
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
			this.openDialog();
		});
		this.dialogRef = this.$refs.dialogRef as HTMLDialogElement;
	}
});
</script>

<style lang="scss" scoped>
dialog {
	background-color: #cb7c49;
	border: 3px solid #cb7c49;
	color: #ffee92;
	max-height: 100%;
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
</style>
