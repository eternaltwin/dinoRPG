<template>
	<article class="msg-card" :class="{ 'is-self': isSelf }">
		<header class="msg-card__header">
			<button class="avatar" @click="author ? emit('openProfile', author.id) : undefined">
				<img v-if="author?.avatarUrl" :src="author.avatarUrl" alt="avatar" />
				<span v-else class="avatar--stub">{{ author?.name?.[0]?.toUpperCase() ?? 'Unknown' }}</span>
			</button>

			<div class="meta">
				<div class="name-row">
					<button class="author" @click="author ? emit('openProfile', author.id) : undefined">
						<img
							src="\src\assets\icons\crown.png"
							alt="rank"
							v-if="props.itsLeader"
							v-tippy="{ content: t('clan.icons.crown'), theme: 'small' }"
						/>
						{{ author?.name ?? 'Unknown' }}
					</button>
					<span v-if="author?.isLeader" class="badge badge--leader">{{ t('clan.icons.crown') }}</span>
					<span class="badge">{{ topItem }}</span>
				</div>
				<div class="date">{{ formatShortDate(date) }}</div>
			</div>
		</header>

		<div class="msg-card__content">
			<p v-html="contentHtml"></p>
			<div class="actions divide-x">
				<button class="btn" @click="emit('reply')">{{ t('messagerie.responseConv') }}</button>
				<button v-if="canDelete" class="btn btn--danger" @click="emit('delete')">
					{{ t('messagerie.deletedConv') }}
				</button>
			</div>
		</div>
	</article>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { formatDateTime } from '../../utils/formatDateTime';

type Author = { id: string; name: string; avatarUrl?: string; isLeader?: boolean };

const props = defineProps<{
	author?: Author | null;
	itsLeader?: boolean;
	contentHtml: string;
	date: string | Date;
	isSelf?: boolean;
	canDelete?: boolean;
	topItem?: string;
}>();

const emit = defineEmits<{
	(e: 'delete'): void;
	(e: 'reply'): void;
	(e: 'openProfile', id: string): void;
}>();

const { t } = useI18n();

function formatShortDate(iso: string | Date): string {
	return formatDateTime(iso instanceof Date ? iso.toString() : iso);
}
</script>

<style scoped lang="scss">
.msg-card {
	position: relative;
	background: #f6d19a;
	color: #1b140c;
	border: 1px solid #d7c3a0;
	border-radius: 9px 9px 2px 2px;
	display: grid;
	margin-bottom: 20px;

	.msg-card__header {
		background: #b15f25;
		background: linear-gradient(270deg, #b15f25 0%, #9f5621 40%, #96501f 80%);
		background: -webkit-linear-gradient(270deg, #b15f25 0%, #9f5621 40%, #96501f 80%);
		background: -moz-linear-gradient(270deg, #b15f25 0%, #9f5621 40%, #96501f 80%);
		border-radius: 8px;
		padding-left: 8px;
		padding-right: 8px;
		-webkit-box-shadow: 1px 5px 3px -4px #171717;
		box-shadow: 1px 5px 3px -4px #171717;
	}

	&.is-self {
	}

	&__header {
		display: grid;
		align-items: center;
		gap: 8px;
	}

	.avatar {
		position: absolute;
		width: 55px;
		height: 55px;
		overflow: hidden;
		display: grid;
		place-items: center;
		border: 1px solid #6d3b16;
		font-size: 3.5rem;
		background: #b87941;
		color: #f4f0e6;
		font-weight: 700;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.meta {
		width: auto;
		margin-left: 48px;
		padding: 4px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		.name-row {
			padding-left: 8px;
			display: flex;
			align-items: start;
			flex-direction: column;
		}
		.author {
			font-weight: 700;
			color: #fae2c8;
			background: none;
			border: 0;
			cursor: pointer;
			text-transform: capitalize;
		}
		.date {
			font-size: 11px;
			opacity: 0.8;
			color: #d19f6a;
		}
	}

	.actions {
		display: flex;
		width: 100%;
		align-items: end;
		justify-content: end;
		flex-direction: row;
		gap: 2px;
		margin-top: 30px;

		.btn {
			background: transparent;
			text-decoration: underline;
			color: #8e3e25;
			border: 0;
			font-size: 1rem;
			cursor: pointer;
		}
		.btn--danger {
		}
	}
	.divide-x > * + * {
		border-left: 1px solid #8e3e25 !important;
	}

	&__content {
		white-space: pre-line;
		overflow-wrap: break-word;
		word-break: break-all;
	}
	.badge {
		color: #ffee92;
		padding: 0 6px;
		font-size: 11px;
	}
	.badge--leader {
		background: #ca9957;
	}
}
.msg-card__content {
	-webkit-box-shadow: 1px 5px 3px -4px #949494;
	box-shadow: 1px 5px 3px -4px #949494;
	padding: 14px 8px 8px 8px;
	color: #33464c;
	a {
		color: #0645ad;
		text-decoration: underline;
	}
}
</style>
