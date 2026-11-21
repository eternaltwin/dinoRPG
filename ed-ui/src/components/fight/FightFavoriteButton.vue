<template>
	<div v-if="visible" class="fight-favorite">
		<DZButton :inactive="!favorite" data-testid="fight-favorite" @click="toggleFavorite">
			<img :src="getImgURL('icons', 'small_star')" :class="{ off: !favorite }" alt="" />
			{{ favorite ? $t('replays.removeFavorite') : $t('replays.addFavorite') }}
		</DZButton>
		<RouterLink v-if="showReplaysLink" :to="{ name: 'Replays' }">{{ $t('topBar.rightMenu.replays') }}</RouterLink>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import { isPvPFight } from '@drpg/core/models/fight/FightArchiveList';
import DZButton from '../common/DZButton.vue';
import { FightService } from '../../services';
import { playerStore } from '../../store';
import { errorHandler } from '../../utils/index.js';

/** Adds the fight to the player's favorites. Shown only for archived PvP fights, to a logged-in player. */
const props = withDefaults(
	defineProps<{
		archiveId?: string | null;
		fighters?: Pick<FighterRecap, 'type' | 'attacker'>[];
		showReplaysLink?: boolean;
	}>(),
	{ archiveId: null, fighters: () => [], showReplaysLink: false }
);

const { t } = useI18n();
const toast = useToast();
const player = playerStore();

const favorite = ref(false);
// The server has the last word: it checks the archived fighters
const serverPvP = ref(false);
const pending = ref(false);

const loggedIn = computed(() => !!player.getPlayerId);
const pvp = computed(() => isPvPFight(props.fighters));
const visible = computed(() => loggedIn.value && !!props.archiveId && pvp.value && serverPvP.value);

async function loadState() {
	favorite.value = false;
	serverPvP.value = false;
	if (!loggedIn.value || !props.archiveId || !pvp.value) return;
	const archiveId = props.archiveId;
	try {
		const state = await FightService.isFavorite(archiveId);
		if (archiveId !== props.archiveId) return;
		favorite.value = state.favorite;
		serverPvP.value = state.pvp;
	} catch (e) {
		errorHandler.handle(e, toast);
	}
}

async function toggleFavorite() {
	if (pending.value || !props.archiveId) return;
	pending.value = true;
	try {
		const res = await FightService.setFavorite(props.archiveId, !favorite.value);
		favorite.value = res.favorite;
		toast.success(res.favorite ? t('replays.favoriteAdded') : t('replays.favoriteRemoved'));
	} catch (e) {
		errorHandler.handle(e, toast);
	} finally {
		pending.value = false;
	}
}

watch(() => [props.archiveId, pvp.value, loggedIn.value], loadState, { immediate: true });
</script>

<style lang="scss" scoped>
.fight-favorite {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	gap: 12px;
	margin: 6px 0;
	img {
		vertical-align: middle;
		margin-right: 4px;
		&.off {
			filter: grayscale(100%);
		}
	}
}
</style>
