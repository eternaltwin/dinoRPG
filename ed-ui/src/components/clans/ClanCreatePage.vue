<template>
	<div class="page">
		<div>{{ editMode ? $t('clanPages.creation.edit') : $t('clanPages.creation.new') }}</div>
		<div class="box">
			<div class="middle-content">
				<div class="grid">
					<p>{{ $t('clanPages.creation.title') }}</p>
					<input class="name" type="text" v-model="page.name" />

					<p>{{ $t('clanPages.creation.content') }}</p>
					<textarea class="content" type="text" v-model="page.content"></textarea>

					<p>{{ $t('clanPages.creation.public') }}</p>
					<input class="public" type="checkbox" v-model="page.public" :disabled="page.home" />
				</div>
			</div>
		</div>
		<a class="button" @click="createClanPage()" v-if="!editMode">{{ $t('clanPages.creation.action.create') }}</a>
		<a class="button" @click="updateClanPage()" v-if="editMode">{{ $t('clanPages.creation.action.edit') }}</a>
		<a class="button" @click="cancel()">{{ $t('clanPages.creation.action.cancel') }}</a>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../../events/index.js';
import { ClanService } from '../../services/ClanService.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { ClanPage } from '@drpg/prisma';

export default defineComponent({
	name: 'ClanCreatePage',
	components: {},
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
			EventBus.emit('isLoading', true);
			try {
				const page = await ClanService.createClanPage(
					this.page.name,
					this.page.content,
					this.page.public,
					Number(this.$route.params.id)
				);
				EventBus.emit('isLoading', false);
				this.$router.push({ name: 'ClanPage', params: { pageId: page.id } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async updateClanPage() {
			EventBus.emit('isLoading', true);
			try {
				await ClanService.updateClanPage(
					Number(this.$route.params.pageId),
					this.page.name,
					this.page.content,
					this.page.public,
					Number(this.$route.params.id)
				);
				EventBus.emit('isLoading', false);
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
			EventBus.emit('isLoading', true);
			try {
				this.page = await ClanService.getClanPage(Number(this.$route.params.pageId));
				EventBus.emit('isLoading', false);
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
}

.grid {
	display: inline-grid;
	column-gap: 5px;
	row-gap: 5px;

	p {
		grid-column: 1;
		font-variant: normal;
		font-weight: bold;
		font-size: 8pt;
		color: #ffee92;
		width: 150px;
		text-align: center;
		background-color: #e4aa69;
		border-radius: 10px;
		-webkit-border-radius: 10px;
	}

	input {
		grid-column: 2;
		padding-left: 8px;
		padding-right: 8px;
		color: #ffee92;
		font-size: 9pt;
		font-weight: bold;
		border: none;
		width: 184px;
		height: 20px;
		background-image: url('../../assets/design/form_field.webp');
		background-repeat: no-repeat;
		background-color: transparent;
	}

	textarea {
		grid-column: 2;
		padding-left: 8px;
		padding-right: 8px;
		color: #ffee92;
		font-size: 9pt;
		font-weight: bold;
		border: none;
		height: 100px;
		width: 300px;
		background-color: #bc683c;
		resize: vertical;
	}
}
</style>
