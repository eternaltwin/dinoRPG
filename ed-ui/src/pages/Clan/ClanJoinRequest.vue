<template>
	<DZDisclaimer class="join-request" v-if="joinRequest">
		<p>
			{{ $t('clanPages.request.info') }}
			<a @click="goToClan(joinRequest.clan.id)" class="clan-name"> {{ joinRequest.clan.name }} </a>.
		</p>
		<DZButton class="cancel-button" @click="cancelRequest(joinRequest)">{{ $t('clanPages.request.cancel') }}</DZButton>
	</DZDisclaimer>
</template>

<script setup lang="ts">
import { PlayerClanJoinRequest } from '@drpg/core/models/clan/clan';
import { useRouter } from 'vue-router';
import { ClanService } from '../../services';
import { refreshGold } from '../../mixin/mixin';
import { errorHandler } from '../../utils';
import { useToast } from 'vue-toast-notification';
import DZButton from '../../components/common/DZButton.vue';
import DZDisclaimer from '../../components/common/DZDisclaimer.vue';

type Props = {
	joinRequest: PlayerClanJoinRequest | null | undefined;
};

const router = useRouter();
const $toast = useToast();

const emit = defineEmits<{
	(e: 'cancel', requestId: number): void;
}>();

defineProps<Props>();

const goToClan = (clanId: number) => {
	router.push({ name: 'Clan', params: { id: clanId } });
};
const cancelRequest = async (request: PlayerClanJoinRequest) => {
	try {
		await ClanService.denyJoinClanRequest(request.id);
		emit('cancel', request.id);
		await refreshGold();
	} catch (err) {
		errorHandler.handle(err, $toast);
		return;
	}
};
</script>

<style lang="scss" scoped>
.join-request {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 10px;
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px;
	padding-left: 5px;
	padding-left: 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;

	.clan-name {
		color: #fff192;
		cursor: pointer;
		text-decoration: underline;
	}

	.cancel-button {
		flex-shrink: 0;
	}
}
</style>
