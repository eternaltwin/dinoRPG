<template>
	<div v-if="hasAccess" class="wrapper">
		<div class="history-container" v-for="evt in history" :key="evt.id">
			<div class="history-header">
				<img :src="getImgURL('icons', 'small_edit')" alt="Fil de discussion" />
				<DZUser v-if="evt.author" :user="evt.author" />
				<div v-else class="author">{{ evt.authorName }}</div>
				<div class="date">{{ DateToString(evt.date) }}</div>
			</div>

			<div class="message">
				<RouterLink
					v-if="evt.type === ClanHistoryType.WAR_PLAYER_ATTACKED || evt.type === ClanHistoryType.WAR_PLAYER_ATTACK"
					:to="`/replay/${JSON.parse(evt.authorMessage).archiveId}`"
				>
					<img :src="getImgURL('icons', 'small_right')" alt="right" />
				</RouterLink>
				{{ GetHistoryMessageFromType(evt.type, evt.authorMessage) }}
			</div>
		</div>
		<div class="switch-page-container">
			<div class="arrow-button">
				<img src="\src\assets\icons\left.webp" alt="left" @click="changePage(-1)" v-if="page > 1" />
			</div>

			<p>{{ $t('clanDiscussion.pagination.page') }} {{ page }} / {{ maxPage }}</p>

			<div class="arrow-button">
				<img src="\src\assets\icons\right.webp" alt="right" @click="changePage(1)" v-if="history.length >= 20" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanHistory } from '@drpg/core/models/clan/clanHistory';
import { ClanHistoryType } from '@drpg/core/models/enums/ClanHistoryType';
import { playerStore } from '../../store';
import { ClanService } from '../../services';
import { errorHandler } from '../../utils/index.js';
import DZUser from '../common/DZUser.vue';

export default defineComponent({
	name: 'ClanHistory',
	computed: {
		ClanHistoryType() {
			return ClanHistoryType;
		}
	},
	components: { DZUser },
	data() {
		return {
			playerStore: playerStore(),
			hasAccess: false as boolean,
			history: {} as ClanHistory[],
			page: 1 as number,
			maxPage: 1 as number
		};
	},
	methods: {
		DateToString(date: Date): string {
			return new Date(date).toLocaleString('fr-FR', { timeZone: 'GMT' });
		},
		GetHistoryMessageFromType(type: ClanHistoryType, message: string) {
			let formated;
			switch (type) {
				case ClanHistoryType.WAR_ATTACKED:
				case ClanHistoryType.WAR_START:
				case ClanHistoryType.WAR_FORFEIT:
				case ClanHistoryType.WAR_PLAYER_ATTACKED:
				case ClanHistoryType.WAR_PLAYER_ATTACK:
				case ClanHistoryType.WAR_LOSE:
				case ClanHistoryType.WAR_LOSED:
				case ClanHistoryType.WAR_DEFENDED:
				case ClanHistoryType.WAR_WON:
					if (message.length < 1) {
						formated = {};
					} else {
						formated = JSON.parse(message);
					}
					return this.$t('clanHistory.type.' + type, { ...formated });
				default:
					return this.$t('clanHistory.type.' + type);
			}
		},
		async getClanHistory(): Promise<void> {
			try {
				const { history, count } = await ClanService.getClanHistory(Number(this.$route.params.id), this.page);
				this.history = history;
				this.maxPage = Math.floor((count + 19) / 20);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async changePage(n: number) {
			this.page += n;
			await this.getClanHistory();
		}
	},
	mounted(): void {
		this.hasAccess = this.playerStore.clanId == Number(this.$route.params.id);
		if (!this.hasAccess) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
	},
	async created() {
		await this.getClanHistory();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 15px;
	padding: 8px 0;
	.history-container {
		background-color: #fbd7a2;
		border-radius: 5px;
		padding: 5px;
		width: 100%;
		.history-header {
			display: flex;
			gap: 4px;
			align-items: center;
			.date {
				background-color: #bc683c;
				padding: 2px 8px;
				border-radius: 16px;
				color: #fff8ed;
				font-size: 12px;
			}
			.author {
				font-weight: bold;
				padding: 0 4px;
				&:hover {
					cursor: pointer;
					color: white;
				}
			}
		}
		.message {
			font-size: 14px;
			color: #bc683c;
		}
	}
}

.switch-page-container {
	width: 100%;
	display: flex;
	padding: 8px 16px;
	justify-content: center;
	align-items: center;
	gap: 16px;

	.arrow-button {
		width: 20px;
		height: 20px;

		&:hover {
			filter: brightness(120%);
			cursor: pointer;
		}
	}
}
</style>
