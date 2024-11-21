<template>
	<div class="wrapper">
		<div class="disclaimer" v-if="clanMember?.player?.name">
			<img :src="getImgURL('icons', 'small_question')" alt="question_mark" style="margin-right: 5px" />
			<p
				class="text"
				v-html="$t('clansMembers.edit.disclaimer', { name: clanMember.player.name })"
				@click="goToPlayer(clanMember.player.id)"
			></p>
		</div>
		<div class="rights-panel">
			<div class="right-line" v-for="right in rights" :key="right.name">
				<input type="checkbox" v-model="right.selected" />
				{{ $t('clansMembers.edit.right.' + right.name) }}
			</div>
		</div>
		<div class="nickname-container">
			<label for="nickname">{{ $t('clansMembers.edit.nickname') }}</label>
			<input id="nickname" type="text" v-model="clanMember.nickname" />
		</div>
		<a class="button" @click="updateClanMember()">{{ $t('clansMembers.edit.save') }}</a>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanMember } from '@drpg/prisma';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import EventBus from '../../events/index.js';
import { ClanService } from '../../services/ClanService.js';
import { errorHandler } from '../../utils/errorHandler.js';
export default defineComponent({
	name: 'ClanMemberEdit',
	components: {},
	data() {
		return {
			clanMember: {} as ClanMember,
			rights: [] as { name: string; selected: boolean }[]
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
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async updateClanMember(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.clanMember.rights = this.rights.filter(r => r.selected).map(r => r.name.toString());
				await ClanService.updateClanMember(Number(this.$route.params.id), this.clanMember);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		fillRights() {
			this.rights = [];
			for (const right in ClanMemberRight) {
				if (Number(right) || Number(right) == 0) {
					this.rights.push({
						name: ClanMemberRight[right],
						selected: this.clanMember.rights.findIndex(r => r == ClanMemberRight[right]) != -1
					});
				}
			}
		},
		goToPlayer(id: number) {
			this.$router.push({ name: 'MyAccount', params: { id } });
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
