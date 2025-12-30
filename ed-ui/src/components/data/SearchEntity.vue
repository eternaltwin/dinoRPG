<template>
	<div class="search">
		<DZSelect
			id="entity-search"
			v-model="searchedEntityId"
			:search="searchEntity"
			@change="selectEntity"
			:placeholder="placeHolder ? $t(placeHolder) : ''"
		/>
	</div>
</template>

<script lang="ts">
import { EntitySearch } from '@drpg/core/models/rankings/EntitySearch';
import { defineComponent } from 'vue';
import { ClanService, PlayerService } from '../../services/index.js';
import DZSelect, { SelectOption } from '../common/DZSelect.vue';

export default defineComponent({
	components: { DZSelect },
	name: 'SearchEntity',
	props: {
		entityType: { type: String, required: true }, // 'player' or 'clan'
		placeHolder: { type: String, required: true },
		background: { type: Boolean, default: false }
	},
	data() {
		return {
			searchValue: undefined as string | undefined,
			entityList: [] as Array<EntitySearch>,
			awaitingSearch: false,
			searchedEntityId: ''
		};
	},
	emits: ['entity'],
	methods: {
		async searchEntity(query: string) {
			if (query.length < 3) {
				return [];
			}
			let fetcher: (query: string) => Promise<Array<{ id: string | number; name: string }>>;
			if (this.entityType === 'player') {
				fetcher = PlayerService.searchPlayers;
			} else if (this.entityType === 'clan') {
				fetcher = ClanService.searchClans;
			} else {
				return [];
			}

			const results = await fetcher(query);
			return results.map(player => ({
				value: player.id.toString(),
				label: `${player.name} (${player.id.toString().slice(0, 6)})`
			}));
		},
		selectEntity(entity?: SelectOption<string>) {
			if (!entity) {
				return;
			}
			this.$emit('entity', entity);
		}
	}
});
</script>

<style scoped lang="scss">
.search {
	display: flex;
	flex-direction: column;
	width: max-content;
	height: auto;
	position: relative;
	margin: 0 auto;
}
</style>
