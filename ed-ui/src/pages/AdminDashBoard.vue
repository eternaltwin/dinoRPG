<template>
	<TitleHeader :title="$t('pageTitle.admin')"></TitleHeader>

	<ul class="tabs" style="margin-top: 10px">
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/player"> Player Edit </RouterLink>
		</li>
		<li>
			<RouterLink to="/admin/news"> News </RouterLink>
		</li>
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/secret"> Secret </RouterLink>
		</li>
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/logs"> Logs </RouterLink>
		</li>
		<li>
			<RouterLink to="/admin/gamestat"> GameStats </RouterLink>
		</li>
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/moderation"> Moderation </RouterLink>
		</li>
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/bans"> Banned </RouterLink>
		</li>
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/game"> Game </RouterLink>
		</li>
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/debug"> Debug </RouterLink>
		</li>
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/jobs"> Jobs </RouterLink>
		</li>
		<li>
			<RouterLink to="/admin/poll"> Polls </RouterLink>
		</li>
		<li v-if="playerStore().getRole === AdminRoleFront.ADMIN">
			<RouterLink to="/admin/multi"> Multicomptes </RouterLink>
		</li>
	</ul>
	<RouterView />
</template>

<script lang="ts">
import TitleHeader from '../components/utils/TitleHeader.vue';
import { defineComponent } from 'vue';
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';
import { AdminService } from '../services/index.js';
import { playerStore } from '../store/index.js';
import { AdminRoleFront } from '@drpg/core/models/enums/AdminRoleFront';

export default defineComponent({
	name: 'AdminDashBoard',
	computed: {
		AdminRoleFront() {
			return AdminRoleFront;
		}
	},
	components: {
		TitleHeader
	},
	data() {
		return {
			tabSelected: 1 as number
		};
	},
	methods: {
		playerStore,
		async setTab(value: number): Promise<void> {
			this.tabSelected = value;
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);

		if (!(playerStore().getRole === AdminRoleFront.ADMIN || playerStore().getRole === AdminRoleFront.AMPHI)) {
			this.$router.push({
				name: 'News'
			});
		}
		try {
			await AdminService.getDashBoard();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.active {
	background-color: #f3ca92;
	color: #710;
	padding: 4px;
}
.red {
	color: red;
}
.tabs {
	height: auto;
}
input[type='text'],
select {
	padding: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
input[type='submit'] {
	margin-top: 20px;
	background-color: #c64e36;
	color: #fffdba;
	border: 1px solid #c64e36;
	padding: 5px 20px;
	cursor: pointer;
}
</style>
