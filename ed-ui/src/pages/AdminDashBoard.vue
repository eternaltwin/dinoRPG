<template>
	<button>{{ $t('placeHolder') }}</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '@/events';
import { errorHandler } from '@/utils';
import { AdminService } from '@/services/AdminService';

export default defineComponent({
	name: 'AdminDashBoard',
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			await AdminService.getDashBoard();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>

<style lang="scss" scoped></style>
