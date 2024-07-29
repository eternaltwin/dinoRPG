<template>
	<div class="page">
		<p style="white-space: pre-line">{{ page.content }}</p>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../../events/index.js';
import { ClanPage } from '@drpg/prisma';
import { ClanService } from '../../services/ClanService.js';
import { errorHandler } from '../../utils/errorHandler.js';

export default defineComponent({
	name: 'ClanPage',
	components: {},
	data() {
		return {
			page: {} as ClanPage
		};
	},
	methods: {
		async getClanPage() {
			EventBus.emit('isLoading', true);
			try {
				this.page = await ClanService.getClanPage(Number(this.$route.params.pageId));
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async deleteClanPage() {
			EventBus.emit('isLoading', true);
			try {
				this.page = await ClanService.deleteClanPage(Number(this.$route.params.pageId), Number(this.$route.params.id));
				EventBus.emit('isLoading', false);
				this.$router.push({ name: 'Clan', params: { id: Number(this.$route.params.id) } });
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async updateClanPage() {
			if (this.updatedPage) {
				EventBus.emit('isLoading', true);
				try {
					this.page = await ClanService.updateClanPage(
						Number(this.$route.params.pageId),
						this.updatedPage.name,
						this.updatedPage.content,
						this.updatedPage.public,
						Number(this.$route.params.id)
					);
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err, this.$toast, this.$t);
					return;
				}
			}
		}
	},
	async created() {
		this.getClanPage();
	}
});
</script>

<style lang="scss" scoped>
.page {
	margin: 10px;
}
</style>
