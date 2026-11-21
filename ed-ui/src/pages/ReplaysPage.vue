<template>
	<TitleHeader :title="$t('pageTitle.replays')" :header="$t('topBar.rightMenu.replays')" />
	<div class="replays">
		<p class="retention">
			{{ $t('replays.retention', { months: FIGHT_ARCHIVE_RETENTION_MONTHS, max: MAX_FAVORITE_FIGHTS }) }}
		</p>
		<div class="tabs">
			<DZButton :off="tab !== 'favorites'" data-testid="tab-favorites" @click="selectTab('favorites')">
				{{ $t('replays.favorites') }} ({{ favorites.length }}/{{ MAX_FAVORITE_FIGHTS }})
			</DZButton>
			<DZButton :off="tab !== 'mine'" data-testid="tab-mine" @click="selectTab('mine')">
				{{ $t('replays.mine') }}
			</DZButton>
		</div>

		<template v-if="loaded">
			<p v-if="shown.length === 0" class="empty">
				{{ tab === 'favorites' ? $t('replays.emptyFavorites') : $t('replays.empty') }}
			</p>
			<DZTable v-else>
				<tr>
					<th>{{ $t('replays.date') }}</th>
					<th>{{ $t('replays.kind') }}</th>
					<th>{{ $t('replays.fighters') }}</th>
					<th>{{ $t('replays.result') }}</th>
					<th>{{ $t('replays.expires') }}</th>
					<th></th>
				</tr>
				<tr v-for="fight in shown" :key="fight.id" :data-testid="`replay-${fight.id}`">
					<td class="date">{{ formatDateTime(fight.createdDate) }}</td>
					<td>{{ $t(`replays.kinds.${fight.kind}`) }}</td>
					<td class="fighters">
						<div class="side">
							<span class="player">{{ sideName(fight, true) }}</span>
							<span class="dinoz">{{ dinozNames(fight, true) }}</span>
						</div>
						<span class="versus">VS</span>
						<div class="side">
							<span class="player">{{ sideName(fight, false) }}</span>
							<span class="dinoz">{{ dinozNames(fight, false) }}</span>
						</div>
					</td>
					<td :class="won(fight) ? 'victory' : 'defeat'">
						{{ won(fight) ? $t('replays.victory') : $t('replays.defeat') }}
					</td>
					<td class="date">{{ fight.expiresAt ? formatDate(fight.expiresAt) : $t('replays.kept') }}</td>
					<td class="icons">
						<img
							:class="{ star: true, off: !fight.favorite }"
							:src="getImgURL('icons', 'small_star')"
							:alt="fight.favorite ? $t('replays.removeFavorite') : $t('replays.addFavorite')"
							:data-testid="`favorite-${fight.id}`"
							@click="toggleFavorite(fight)"
							v-tippy="{
								content: fight.favorite ? $t('replays.removeFavorite') : $t('replays.addFavorite'),
								theme: 'small'
							}"
						/>
						<RouterLink :to="{ name: 'ReplayFight', params: { archive: fight.id } }">
							<img
								:src="getImgURL('icons', 'small_follow')"
								:alt="$t('replays.watch')"
								v-tippy="{ content: $t('replays.watch'), theme: 'small' }"
							/>
						</RouterLink>
					</td>
				</tr>
			</DZTable>
			<div v-if="tab === 'mine' && totalPages > 1" class="pagination-controls">
				<button @click="goToPage(page - 1)" :disabled="page === 1">
					<img class="left" :src="getImgURL('button', 'button-back-arrow')" />
				</button>
				<span>{{ page }} / {{ totalPages }}</span>
				<button @click="goToPage(page + 1)" :disabled="page === totalPages">
					<img class="right" :src="getImgURL('button', 'button-back-arrow')" />
				</button>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZTable from '../components/common/DZTable.vue';
import DZButton from '../components/common/DZButton.vue';
import { FightService } from '../services';
import { errorHandler } from '../utils/index.js';
import { formatDate, formatDateTime } from '../utils/formatDateTime';
import { playerStore } from '../store';
import { FighterType } from '@drpg/core/models/fight/DetailedFighter';
import {
	FIGHT_ARCHIVE_PAGE_SIZE,
	FIGHT_ARCHIVE_RETENTION_MONTHS,
	FightArchiveSummary,
	MAX_FAVORITE_FIGHTS
} from '@drpg/core/models/fight/FightArchiveList';

type Tab = 'favorites' | 'mine';

export default defineComponent({
	name: 'ReplaysPage',
	components: { TitleHeader, DZTable, DZButton },
	data() {
		return {
			tab: 'favorites' as Tab,
			favorites: [] as FightArchiveSummary[],
			mine: [] as FightArchiveSummary[],
			page: 1,
			total: 0,
			loaded: false,
			pending: false,
			playerStore: playerStore(),
			FIGHT_ARCHIVE_RETENTION_MONTHS,
			MAX_FAVORITE_FIGHTS
		};
	},
	computed: {
		shown(): FightArchiveSummary[] {
			return this.tab === 'favorites' ? this.favorites : this.mine;
		},
		totalPages(): number {
			return Math.max(1, Math.ceil(this.total / FIGHT_ARCHIVE_PAGE_SIZE));
		},
		myId(): string {
			return String(this.playerStore.getPlayerId);
		}
	},
	methods: {
		formatDate,
		formatDateTime,
		/** Fights I was the defender of are shown from my side. */
		iAmRight(fight: FightArchiveSummary): boolean {
			return fight.rightPlayer?.id === this.myId && fight.leftPlayer?.id !== this.myId;
		},
		won(fight: FightArchiveSummary): boolean {
			return this.iAmRight(fight) ? !fight.result : fight.result;
		},
		/** `mine` is the reader's side (the left one when they did not fight). */
		dinozNames(fight: FightArchiveSummary, mine: boolean): string {
			const attacker = mine !== this.iAmRight(fight);
			return fight.fighters
				.filter(f => f.type === FighterType.DINOZ && f.attacker === attacker)
				.map(f => f.name)
				.join(', ');
		},
		sideName(fight: FightArchiveSummary, mine: boolean): string {
			const left = mine !== this.iAmRight(fight);
			if (left) return fight.leftPlayer?.name ?? '???';
			return fight.rightPlayer?.name ?? fight.rightClanName ?? '';
		},
		async selectTab(tab: Tab) {
			this.tab = tab;
			await this.load();
		},
		async goToPage(page: number) {
			if (page < 1 || page > this.totalPages) return;
			this.page = page;
			await this.load();
		},
		async load() {
			try {
				if (this.tab === 'favorites') {
					this.favorites = (await FightService.getFavorites()).fights;
				} else {
					const res = await FightService.getMyArchives(this.page);
					this.mine = res.fights;
					this.total = res.total;
				}
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.loaded = true;
			}
		},
		async toggleFavorite(fight: FightArchiveSummary) {
			if (this.pending) return;
			this.pending = true;
			try {
				const res = await FightService.setFavorite(fight.id, !fight.favorite);
				this.$toast.success(res.favorite ? this.$t('replays.favoriteAdded') : this.$t('replays.favoriteRemoved'));
				this.favorites = (await FightService.getFavorites()).fights;
				if (this.tab === 'mine') {
					const res = await FightService.getMyArchives(this.page);
					this.mine = res.fights;
					this.total = res.total;
				}
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.pending = false;
			}
		}
	},
	async mounted() {
		// The favorites count shows on its tab whichever tab is open
		await this.load();
	}
});
</script>

<style lang="scss" scoped>
.replays {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	width: 100%;
}
.retention,
.empty {
	text-align: center;
	margin: 4px 16px;
}
.tabs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
}
.date {
	white-space: nowrap;
}
.fighters {
	display: flex;
	align-items: center;
	gap: 6px;
	.side {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.player {
		font-weight: bold;
	}
	.dinoz {
		font-size: 9pt;
	}
	.versus {
		font-weight: bold;
		font-size: 8pt;
	}
}
.victory {
	color: #2e7d32;
	font-weight: bold;
}
.defeat {
	color: #b71c1c;
	font-weight: bold;
}
.icons {
	text-align: center;
	white-space: nowrap;
	img {
		padding: 3px;
		vertical-align: middle;
		cursor: pointer;
	}
	.star.off {
		filter: grayscale(100%);
		opacity: 0.5;
	}
}
.pagination-controls {
	display: flex;
	justify-content: center;
	align-items: center;
	button {
		background-color: transparent;
		margin: 0 10px;
		padding: 5px 10px;
		border: none;
		cursor: pointer;
		&:disabled {
			cursor: not-allowed;
		}
		.left,
		.right {
			width: 10px;
		}
		.right {
			transform: rotate(180deg);
		}
	}
}
</style>
