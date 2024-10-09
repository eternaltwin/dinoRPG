<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="w-full p-3">
		<div class="mb-[10px]">{{ editMode ? $t('clanPages.creation.edit') : $t('clanPages.creation.new') }}</div>
		<div class="mb-[20px] flex flex-col gap-6">
			<div class="flex flex-wrap gap-3">
				<p>{{ $t('clanPages.creation.title') }}</p>
				<input class="name" type="text" v-model="page.name" />
			</div>
			<div class="flex flex-wrap gap-3">
				<p>{{ $t('clanPages.creation.content') }}</p>
				<textarea class="content" type="text" v-model="page.content"></textarea>
			</div>
			<div class="flex flex-wrap">
				<p>{{ $t('clanPages.creation.public') }}</p>
				<input class="public" type="checkbox" v-model="page.public" :disabled="page.home" />
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
				errorHandler.handle(err, this.$toast, this.$t);
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
				errorHandler.handle(err, this.$toast, this.$t);
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
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
p {
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
	padding-left: 8px;
	padding-right: 8px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	width: 200px;
	height: 25px;
	background-image: url('../../assets/design/form_field.webp');
	background-repeat: no-repeat;
	background-color: transparent;
}
textarea {
	padding-left: 8px;
	padding-right: 8px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	min-height: 150px;
	width: 280px;
	background-color: #bc683c;
	resize: vertical;
}
</style>
