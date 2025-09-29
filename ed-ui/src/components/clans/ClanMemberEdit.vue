<template>
	<div class="wrapper">
		<DZDisclaimer
			help
			v-if="clanMember"
			:content="$t('clansMembers.edit.disclaimer', { name: clanMember.player.name })"
		/>
		<div class="rights-panel">
			<div class="right-line" v-for="right in rights" :key="right.name">
				<input type="checkbox" v-model="right.selected" />
				{{ $t('clansMembers.edit.right.' + right.name) }}
			</div>
		</div>
		<div class="nickname-container" v-if="clanMember">
			<label for="nickname">{{ $t('clansMembers.edit.nickname') }}</label>
			<input id="nickname" type="text" v-model="clanMember.nickname" />
		</div>
		<a class="button" @click="updateClanMember()">{{ $t('clansMembers.edit.save') }}</a>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanMember } from '@drpg/core/models/clan/clanMember';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import EventBus from '../../events/index.js';
import { ClanService } from '../../services/ClanService.js';
import { errorHandler } from '../../utils/errorHandler.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';

export default defineComponent({
	name: 'ClanMemberEdit',
	components: { DZDisclaimer },
	data() {
		return {
			clanMember: undefined as ClanMember | undefined,
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
	.rights-panel {
		margin: 0 20px;
		.right-line {
			margin-bottom: 5px;
		}
	}
}
/*.disclaimer {
	display: flex;
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
	flex-grow: 2;
	strong {
		color: #ffee92;
	}
}*/
</style>
