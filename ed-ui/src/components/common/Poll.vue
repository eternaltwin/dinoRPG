<template>
	<div class="poll-container">
		<div class="poll-title">{{ $t('poll.choose_option', { date: formatCreatedDate(poll.endDate) }) }}</div>

		<div
			v-for="option in poll.options"
			:key="option.id"
			class="vote-option"
			:class="{ selected: selectedOption === option.id, voted: hasVoted }"
			@click.stop="selectOption(option.id)"
		>
			<div class="progress-bar" :style="{ width: getPercentage(option.id) + '%' }"></div>
			<div class="vote-content">
				<div class="vote-icon"></div>
				<div class="vote-text">{{ option.optionText }}</div>
				<div class="vote-stats" v-if="!poll.isActive">
					<span class="vote-count">{{ getPercentage(option.id).toFixed(2) }} %</span>
				</div>
			</div>
		</div>
		<div class="poll-title">{{ $t('poll.total_participants', { qty: poll.votes.length }) }}</div>

		<button v-if="poll.isActive" class="vote-button" :disabled="!selectedOption" @click.stop="submitVote">
			{{ hasVoted ? $t('poll.choose_done') : selectedOption ? $t('poll.select') : $t('poll.select_option') }}
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { PollPublic } from '@drpg/core/models/news/Polls';
import { NewsService } from '../../services';
import { errorHandler } from '../../utils';
import { localStore, playerStore } from '../../store';
import { returnCode } from '@drpg/core/models/enums/returnCode';

export default defineComponent({
	name: 'Poll',
	props: {
		poll: {
			type: Object as PropType<PollPublic>,
			required: true
		},
		totalVote: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			selectedOption: undefined as number | undefined,
			playerId: playerStore().getPlayerId,
			localStore: localStore()
		};
	},
	computed: {
		hasVoted(): boolean {
			return this.poll.votes.some(o => o.playerId === this.playerId);
		}
	},
	methods: {
		selectOption(optionId: number) {
			this.selectedOption = optionId;
		},
		formatCreatedDate(stringDate: string): string {
			const date = new Date(stringDate);
			const options = { year: 'numeric', month: 'long', day: 'numeric' } as const;
			return date.toLocaleDateString(this.localStore.getLanguage, options);
		},
		getPercentage(optionId: number) {
			return isNaN((this.poll.votes.filter(o => o.pollOptionId === optionId)?.length ?? 0) / this.totalVote)
				? 0
				: ((this.poll.votes.filter(o => o.pollOptionId === optionId)?.length ?? 0) / this.totalVote) * 100;
		},
		async submitVote() {
			if (!this.selectedOption) return;
			try {
				const vote = await NewsService.votePoll(this.poll.id, this.selectedOption);
				if (vote.code === returnCode.OK) {
					this.$emit('voted');
				} else {
					this.$toast.error(this.$t(`toast.basicError`));
				}
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	}
});
</script>

<style scoped lang="scss">
.poll-container {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 12px;
	padding: 20px;
	border: 1px solid rgba(255, 215, 0, 0.2);
}

.poll-title {
	color: #ffd700;
	font-size: 1.1rem;
	font-weight: 600;
	margin-bottom: 15px;
	text-align: center;
}

.vote-option {
	position: relative;
	margin: 12px 0;
	cursor: pointer;
	transition: all 0.3s ease;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
	border: 2px solid rgba(255, 215, 0, 0.3);
	border-radius: 10px;
	padding: 16px 20px;
	backdrop-filter: blur(10px);
	overflow: hidden;
}

.vote-option:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
	border-color: rgba(255, 215, 0, 0.6);
}

.vote-option.selected {
	background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
	border-color: #ffd700;
	box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.vote-option.voted {
	cursor: default;
}

.vote-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	z-index: 2;
}

.vote-text {
	color: #f4e4bc;
	font-weight: 500;
	font-size: 1rem;
	flex: 1;
}

.vote-stats {
	display: flex;
	align-items: center;
	gap: 10px;
	min-width: 80px;
	justify-content: flex-end;
}

.vote-count {
	color: #ffd700;
	font-weight: bold;
	font-size: 0.9rem;
}

.vote-percentage {
	color: #d2b48c;
	font-size: 0.85rem;
	font-weight: 500;
}

.progress-bar {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	background: linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05));
	border-radius: 8px;
	transition: width 0.8s ease-in-out;
	width: 0%;
}

.vote-option.selected .progress-bar {
	background: linear-gradient(90deg, rgba(255, 215, 0, 0.25), rgba(255, 215, 0, 0.1));
}

.vote-icon {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	border: 2px solid rgba(255, 215, 0, 0.5);
	margin-right: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	flex-shrink: 0;
}

.vote-option.selected .vote-icon {
	background: #ffd700;
	border-color: #ffd700;
}

.vote-icon::after {
	content: '✓';
	color: #8b4513;
	font-weight: bold;
	font-size: 12px;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.vote-option.selected .vote-icon::after {
	opacity: 1;
}

.total-votes {
	text-align: center;
	margin-top: 20px;
	padding-top: 15px;
	border-top: 1px solid rgba(255, 215, 0, 0.2);
	color: #d2b48c;
	font-size: 0.9rem;
}

.vote-button {
	width: 100%;
	padding: 12px 20px;
	background: linear-gradient(135deg, #ffd700, #ffa500);
	color: #8b4513;
	border: none;
	border-radius: 8px;
	font-weight: bold;
	font-size: 1rem;
	cursor: pointer;
	transition: all 0.3s ease;
	margin-top: 15px;
	box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.vote-button:hover {
	transform: translateY(-1px);
	box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.vote-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.newsFooter {
	display: flex;
	justify-content: flex-end;
	margin-top: 20px;
	padding-top: 15px;
	border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.counter {
	display: flex;
	align-items: center;
	gap: 8px;
	color: #d2b48c;
	text-decoration: none;
	padding: 8px 12px;
	border-radius: 20px;
	background: rgba(0, 0, 0, 0.2);
	transition: all 0.3s ease;
}

.counter:hover {
	background: rgba(255, 215, 0, 0.1);
}

.counter img {
	width: 16px;
	height: 16px;
	filter: brightness(0.8);
}
</style>
