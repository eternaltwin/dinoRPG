<template>
	<div class="wrapper">
		<DZDisclaimer
			help
			v-if="clanMember"
			:content="$t('clansMembers.edit.disclaimer', { name: clanMember.player.name })"
		/>
		<div class="panel dz-box">
			<div class="right-line" v-for="right in rights" :key="right.name">
				<DZCheckbox :id="right.name" :label="$t(`clansMembers.edit.right.${right.name}`)" v-model="right.selected" />
			</div>
			<DZInput
				v-if="clanMember"
				id="nickname"
				v-model="clanMember.nickname"
				:placeholder="$t('clansMembers.edit.nickname')"
			/>
		</div>
		<a class="button" @click="updateClanMember()">{{ $t('clansMembers.edit.save') }}</a>
	</div>
</template>

<script lang="ts">
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { GetClanMemberResponse } from '@drpg/core/returnTypes/Clan';
import { defineComponent } from 'vue';
import DZInput from '../../components/common/DZInput.vue';
import EventBus from '../../events/index.js';
import { ClanService } from '../../services/ClanService.js';
import { errorHandler } from '../../utils/errorHandler.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import DZCheckbox from '../common/DZCheckbox.vue';

export default defineComponent({
	name: 'ClanMemberEdit',
	components: {
		DZDisclaimer,
		DZInput,
		DZCheckbox
	},
	data() {
		return {
			clanMember: null as GetClanMemberResponse,
			rights: [] as { name: ClanMemberRight; selected: boolean }[]
		};
	},
	methods: {
		async getClanMember(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.clanMember = await ClanService.getClanMember(
					Number(this.$route.params.id),
					Number(this.$route.params.memberId)
				);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async updateClanMember(): Promise<void> {
			if (!this.clanMember) return;
			EventBus.emit('isLoading', true);
			try {
				this.clanMember.rights = this.rights.filter(r => r.selected).map(r => r.name.toString());
				await ClanService.updateClanMember(Number(this.$route.params.id), this.clanMember);
				EventBus.emit('isLoading', false);

				this.$toast.open({
					message: this.$t('clansMembers.edit.saved'),
					type: 'success'
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		fillRights() {
			this.rights = [];
			if (!this.clanMember) return;
			for (const right of Object.values(ClanMemberRight)) {
				this.rights.push({
					name: right,
					selected: this.clanMember.rights.findIndex(r => r == right) != -1
				});
			}
		}
	},
	async created() {
		await this.getClanMember();
		this.fillRights();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	display: flex;
	flex-direction: column;
	.panel {
		margin: 0 20px;
		padding: 26px 8px 8px 8px;
		color: #ffee92;
		.right-line {
			margin-bottom: 5px;
		}
	}
}
</style>
