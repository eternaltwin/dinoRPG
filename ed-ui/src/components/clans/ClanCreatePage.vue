<template>
	<div class="page">
		<h3>{{ editMode ? $t('clanPages.creation.edit') : $t('clanPages.creation.new') }}</h3>
		<div class="box">
			<div class="middle-content">
				<div class="grid">
					<p>{{ $t('clanPages.creation.title') }}</p>
					<DZInput v-model="page.name" />

					<p>{{ $t('clanPages.creation.content') }}</p>
					<textarea class="dz-golden-box no-shadow" type="text" v-model="page.content"></textarea>

					<p>{{ $t('clanPages.creation.public') }}</p>
					<input class="public" type="checkbox" v-model="page.public" :disabled="page.home" />
				</div>
			</div>
		</div>
		<div class="df">
			<a class="button" @click="createClanPage()" v-if="!editMode">{{ $t('clanPages.creation.action.create') }}</a>
			<a class="button" @click="updateClanPage()" v-if="editMode">{{ $t('clanPages.creation.action.edit') }}</a>
			<a class="button" @click="cancel()">{{ $t('clanPages.creation.action.cancel') }}</a>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanService } from '../../services/ClanService.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { ClanPage } from '@drpg/prisma';
import DZInput from '../common/DZInput.vue';
import { useLoadingStore } from '../../store';

export default defineComponent({
	name: 'ClanCreatePage',
	components: {
		DZInput
	},
	data() {
		return {
			page: {
				name: '',
				content: '',
				public: false
			} as ClanPage,
			editMode: false as boolean
		};
	},
	methods: {
		async createClanPage() {
			useLoadingStore().setLoaderOn();
			try {
				const page = await ClanService.createClanPage(
					this.page.name,
					this.page.content,
					this.page.public,
					Number(this.$route.params.id)
				);
				useLoadingStore().setLoaderOff();
				this.$router.push({ name: 'ClanPage', params: { pageId: page.id } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async updateClanPage() {
			useLoadingStore().setLoaderOn();
			try {
				await ClanService.updateClanPage(
					Number(this.$route.params.pageId),
					this.page.name,
					this.page.content,
					this.page.public,
					Number(this.$route.params.id)
				);
				useLoadingStore().setLoaderOff();
				this.$router.push({ name: 'ClanPage', params: { pageId: Number(this.$route.params.pageId) } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		cancel() {
			if (this.editMode) {
				this.$router.push({ name: 'ClanPage', params: { pageId: Number(this.$route.params.pageId) } });
			} else {
				this.$router.push({ name: 'Clan', params: { id: Number(this.$route.params.id) } });
			}
		}
	},
	async mounted() {
		this.editMode = this.$route.name == 'ClanEditPage';
		if (this.editMode) {
			useLoadingStore().setLoaderOn();
			try {
				this.page = await ClanService.getClanPage(Number(this.$route.params.pageId));
				useLoadingStore().setLoaderOff();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.page {
	padding: 10px;

	h3 {
		font-variant-caps: small-caps;
		font-weight: 400;
		color: #e4aa69;
		margin-bottom: 8px;
	}

	.grid {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 8px;
		align-items: stretch;

		p {
			font-variant: normal;
			font-weight: bold;
			font-size: 8pt;
			color: #ffee92;
			text-align: center;
			background-color: #e4aa69;
			border-radius: 10px;
			-webkit-border-radius: 10px;
		}

		textarea {
			padding: 4px 8px;
			color: #ffee92;
			font-size: 9pt;
			font-weight: bold;
			height: 100px;
			resize: vertical;
		}
	}

	.df {
		margin-top: 8px;
		gap: 4px;
	}
}
</style>
