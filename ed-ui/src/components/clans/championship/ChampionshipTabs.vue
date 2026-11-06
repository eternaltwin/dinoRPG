<template>
	<div class="cdc-tabs">
		<ul class="tab-list">
			<li v-for="t in tabs" :key="t" :class="{ active: tab === t }">
				<button type="button" :data-testid="`tab-${t}`" @click="tab = t">{{ $t(`clanChampionship.tabs.${t}`) }}</button>
			</li>
		</ul>

		<div v-if="tab === 'mine'" class="tab-body">
			<p class="place">{{ $t('clanChampionship.matchPlace', { place: placeName }) }}</p>
			<template v-if="!finished">
				<ul v-if="eligible.length" class="list">
					<li v-for="d in eligible" :key="d.id">
						<DinozIcon :display="d.display" :size="32" />
						<span class="name">{{ d.name }}</span>
						<span class="muted">{{ $t('clanChampionship.level', { level: d.level }) }}</span>
						<DZButton :off="pending" :data-testid="`enter-${d.id}`" @click="emit('enter', d.id)">{{
							$t('clanChampionship.enter')
						}}</DZButton>
					</li>
				</ul>
				<p v-else class="muted">{{ $t('clanChampionship.noEligible') }}</p>
				<ul v-if="blocked.length" class="list">
					<li v-for="b in blocked" :key="b.dinoz.id" class="grey">
						<DinozIcon :display="b.dinoz.display" :size="32" />
						<span class="name">{{ b.dinoz.name }}</span>
						<span class="muted">{{ $t(`clanChampionship.reason.${b.reason}`) }}</span>
					</li>
				</ul>
				<p v-if="elsewhere > 0" class="muted">{{ $t('clanChampionship.elsewhere', { count: elsewhere }) }}</p>
			</template>
			<h4>{{ $t('clanChampionship.onBoard') }}</h4>
			<ul v-if="myPieces.length" class="list">
				<li
					v-for="p in myPieces"
					:key="p.dinozId"
					class="clickable"
					:class="{ selected: p.dinozId === selectedDinozId }"
					@click="emit('select', p.dinozId)"
				>
					<DinozIcon :display="p.display" :size="32" />
					<span class="name">{{ p.name }}</span>
					<span class="muted">{{ $t('clanChampionship.level', { level: p.level }) }}</span>
					<span class="muted">({{ p.x }}, {{ p.y }})</span>
				</li>
			</ul>
			<p v-else class="muted">{{ $t('clanChampionship.noneOnBoard') }}</p>
		</div>

		<div v-else-if="tab === 'selection'" class="tab-body">
			<template v-if="selected">
				<div class="sel">
					<DinozIcon :display="selected.display" :size="48" />
					<div>
						<strong>{{ selected.name }}</strong>
						<div>{{ $t('clanChampionship.level', { level: selected.level }) }}</div>
						<div v-if="selected.life !== undefined" data-testid="selection-hp">
							<span v-html="formatContent($t('clanChampionship.hp'))" /> : {{ selected.life }}/{{ selected.maxLife }}
						</div>
						<div v-if="selected.actionPoints !== undefined">
							{{ $t('clanChampionship.ap') }} : {{ selected.actionPoints }}
						</div>
					</div>
					<template v-if="!finished">
						<DinozEquip :dinozId="selected.dinozId" />
						<div class="inventory-panel" data-testid="selection-inventory">
							<InventoryTab :dinozId="selected.dinozId" healOnly @itemUsed="emit('itemUsed', $event)" />
						</div>
					</template>
				</div>
				<DZButton v-if="canLeave" :off="pending" @click="emit('leave', selected.dinozId)">{{
					$t('clanChampionship.leave')
				}}</DZButton>
			</template>
			<p v-else class="muted">{{ $t('clanChampionship.noSelection') }}</p>
		</div>

		<div v-else class="tab-body">
			<ul v-if="journal.length" class="list">
				<li v-for="f in journal" :key="f.id" class="fight">
					<span class="muted">{{ formatDate(f.createdAt) }}</span>
					<span>{{
						$t('clanChampionship.journalEntry', {
							clan: clanName(f.attackerClanId),
							outcome: $t(f.attackerWon ? 'clanChampionship.won' : 'clanChampionship.lost'),
							count: f.participantCount,
							dead: f.deadDinozIds.length
						})
					}}</span>
					<RouterLink
						v-if="f.archiveId !== null"
						:to="{ name: 'ReplayFight', params: { archive: f.archiveId }, query: { back: route.fullPath } }"
						>{{ $t('clanChampionship.replay') }}</RouterLink
					>
				</li>
			</ul>
			<p v-else class="muted">{{ $t('clanChampionship.noFights') }}</p>
			<DZButton v-if="canLoadMore" :off="loadingMore" data-testid="more-fights" @click="loadMore">{{
				$t('clanChampionship.moreFights')
			}}</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import {
	BOARD_SIZE,
	JOURNAL_PAGE_SIZE,
	journalPagesDisconnected,
	mergeFightJournal,
	type FightJournalEntryDTO,
	type MatchBoardDTO
} from '@drpg/core/models/clan/clanChampionship';
import { placeList } from '@drpg/core/models/place/PlaceList';
import type { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { useDinozStore } from '../../../store';
import { ClanChampionshipService } from '../../../services';
import { errorHandler } from '../../../utils';
import DZButton from '../../common/DZButton.vue';
import DinozIcon from './DinozIcon.vue';
import DinozEquip from '../../dinoz/DinozEquip.vue';
import InventoryTab from '../../common/InventoryTab.vue';

const props = defineProps<{ board: MatchBoardDTO; selectedDinozId: number | null; pending: boolean }>();
const emit = defineEmits<{
	enter: [dinozId: number];
	leave: [dinozId: number];
	select: [dinozId: number];
	itemUsed: [dinozId: number];
}>();

const tabs = ['mine', 'selection', 'journal'] as const;
const tab = ref<(typeof tabs)[number]>('mine');
const { locale, t } = useI18n();
const route = useRoute();
const dinozStore = useDinozStore();
const $toast = useToast();

const older = ref<FightJournalEntryDTO[]>([]);
const exhausted = ref(false);
const loadingMore = ref(false);

watch(
	() => props.board.matchId,
	() => {
		older.value = [];
		exhausted.value = false;
		loadingMore.value = false;
	}
);

watch(
	() => props.board.fights,
	(next, prev) => {
		if (older.value.length && journalPagesDisconnected(prev, next)) {
			older.value = [];
			exhausted.value = false;
		}
	}
);

const journal = computed(() => mergeFightJournal(props.board.fights, older.value));
const canLoadMore = computed(
	() => journal.value.length > 0 && !exhausted.value && props.board.fights.length === JOURNAL_PAGE_SIZE
);

async function loadMore(): Promise<void> {
	if (loadingMore.value) return;
	const matchId = props.board.matchId;
	loadingMore.value = true;
	try {
		const before = journal.value[journal.value.length - 1].id;
		const page = await ClanChampionshipService.getFights(matchId, before);
		if (matchId !== props.board.matchId) return;
		older.value = [...older.value, ...page];
		if (page.length < JOURNAL_PAGE_SIZE) exhausted.value = true;
	} catch (e) {
		errorHandler.handle(e, $toast);
	} finally {
		if (matchId === props.board.matchId) loadingMore.value = false;
	}
}

const finished = computed(() => props.board.status === 'finished');
const myPieces = computed(() => props.board.pieces.filter(p => p.mine));
const selected = computed(() => myPieces.value.find(p => p.dinozId === props.selectedDinozId) ?? null);

watch(
	() => props.selectedDinozId,
	id => {
		if (id !== null) tab.value = 'selection';
	}
);

const placeName = computed(() => {
	const place = Object.values(placeList).find(p => p.placeId === props.board.placeId);
	return place ? t(`place.name.${place.name}`) : '?';
});

type Reason = 'dead' | 'deadInMatch' | 'wrongPlace' | 'inGroup' | 'busy';

function reasonOf(d: DinozFiche): Reason | null {
	if (d.life <= 0) return 'dead';
	if (props.board.deadDinozIds.includes(d.id)) return 'deadInMatch';
	if (d.placeId !== props.board.placeId) return 'wrongPlace';
	if (d.leaderId || d.followers?.length) return 'inGroup';
	if (d.unavailableReason !== null) return 'busy';
	return null;
}

const candidates = computed(() => {
	const onBoard = new Set(myPieces.value.map(p => p.dinozId));
	return (dinozStore.getDinozList ?? []).filter(d => !onBoard.has(d.id)).map(d => ({ dinoz: d, reason: reasonOf(d) }));
});
const eligible = computed(() => candidates.value.filter(c => c.reason === null).map(c => c.dinoz));
const blocked = computed(() => candidates.value.filter(c => c.reason !== null && c.reason !== 'wrongPlace'));
const elsewhere = computed(() => candidates.value.filter(c => c.reason === 'wrongPlace').length);

const canLeave = computed(() => {
	const s = selected.value;
	if (!s || finished.value) return false;
	return s.x === (s.clanId === props.board.west.clanId ? 0 : BOARD_SIZE - 1);
});

function clanName(clanId: number): string {
	const { west, east } = props.board;
	return west.clanId === clanId ? west.name : east.clanId === clanId ? east.name : '?';
}

function formatDate(d: Date | string): string {
	return new Date(d).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' });
}
</script>

<style lang="scss" scoped>
.cdc-tabs {
	border: 1px solid #9f5841;
	background: #fbe7c5;
	color: #4a2a1a;
}
.tab-list {
	display: flex;
	margin: 0;
	padding: 0;
	list-style: none;
	background: #d19860;
	li {
		cursor: pointer;
		button {
			display: block;
			padding: 5px 12px;
			border: 0;
			background: transparent;
			font: inherit;
			cursor: pointer;
			color: white;
		}
		&.active button {
			background: #fbe7c5;
			color: #4a2a1a;
		}
	}
}
.tab-body {
	padding: 8px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.list {
	list-style: none;
	margin: 0;
	padding: 0;
	li {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 2px 4px;
		flex-wrap: wrap;
		.name {
			font-weight: bold;
		}
		&.grey {
			opacity: 0.55;
		}
		&.clickable {
			cursor: pointer;
		}
		&.selected {
			background: rgba(43, 108, 176, 0.2);
		}
	}
}
.muted {
	opacity: 0.75;
	font-size: 0.9em;
}
.place,
h4 {
	margin: 0;
	font-weight: bold;
}
.sel {
	display: flex;
	gap: 10px;
	align-items: center;
	flex-wrap: wrap;
	strong {
		color: inherit;
	}
	// Same background as the dinoz page tab panel: the inventory rows use white text
	.inventory-panel {
		flex: 1 1 240px;
		min-width: 0;
		height: 150px;
		overflow: auto;
		background-color: #d19860;
	}
}
</style>
