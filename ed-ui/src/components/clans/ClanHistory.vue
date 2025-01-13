<template>
	<div v-if="hasAccess" class="wrapper">
		<div class="history-container" v-for="evt in history" :key="evt.id">
			<div class="history-header">
				<img :src="getImgURL('icons', 'small_edit')" alt="Fil de discussion" />
				<div v-if="evt.author" class="author" @click="goToPlayer(evt.author.id)">{{ evt.author.name }}</div>
				<div v-else class="author">{{ evt.authorName }}</div>
				<div class="date">{{ DateToString(evt.date) }}</div>
			</div>

			<div class="message">{{ GetHistoryMessageFromType(evt.type) }}</div>
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
import EventBus from '../../events/index.js';
import { ClanService } from '../../services';
import { errorHandler } from '../../utils/index.js';

export default defineComponent({
	name: 'ClanHistory',
	components: {},
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
			return new Date(date).toLocaleString('fr-FR');
		},
		GetHistoryMessageFromType(type: ClanHistoryType) {
			return this.$t('clanHistory.type.' + type);
		},
		goToPlayer(id: string) {
			this.$router.push({ name: 'MyAccount', params: { id } });
		},
		async getClanHistory(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.history = await ClanService.getClanHistory(Number(this.$route.params.id), this.page);
				const historyCount = await ClanService.getClanHistoryCount(Number(this.$route.params.id));
				this.maxPage = Math.floor((historyCount.count + 19) / 20);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
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
