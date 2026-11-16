<template>
	<span
		v-if="online !== null"
		class="online-dot"
		:class="{ online }"
		role="img"
		:aria-label="label"
		:title="label"
		:data-online="online"
		data-testid="online-dot"
	/>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { clanSocket } from '../../services/clanSocket';

/** Whether a member of the player's clan has the game open. Hidden while the clan socket is not connected. */
const props = defineProps<{ playerId: string | undefined }>();

const { t } = useI18n();
const online = computed(() => (props.playerId === undefined ? null : clanSocket.isOnline(props.playerId)));
const label = computed(() => t(online.value ? 'clan.presence.online' : 'clan.presence.offline'));
</script>

<style lang="scss" scoped>
.online-dot {
	display: inline-block;
	flex: none;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #9a8a7a;
	box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
	&.online {
		background: #3cb043;
	}
}
</style>
