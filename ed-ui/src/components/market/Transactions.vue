<template>
	<div class="disclaimer" v-html="formatContent($t('market.disclaimer'))" />
	<div>
		<DZButton>{{ $t('market.makeAnOffer') }}</DZButton>
	</div>
	<DZTable>
		<tr>
			<th class="dinoz">{{ $t('market.dinoz') }}</th>
			<th class="items">{{ $t('market.items') }}</th>
			<th class="bid"></th>
			<th class="see-more"></th>
		</tr>

		<tr v-for="offer in [{ id: 'test' }]" :key="offer.id">
			<td class="dinoz">🦖</td>
			<td class="items">{{ 0 }}</td>
		</tr>
	</DZTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZTable from '../common/DZTable.vue';

export default defineComponent({
	name: 'OfferList',
	data() {
		return {};
	},
	components: { DZButton, DZTable }
});
</script>

<style lang="scss" scoped>
.disclaimer {
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
}
</style>
