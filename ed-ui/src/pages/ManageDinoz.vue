<template>
	<TitleHeader :title="$t('pageTitle.manageDinoz')" />
	<div class="section">
		<div class="titlePage">{{ $t(`manageDinoz.title`) }}</div>
	</div>
	<div class="disclaimer">
		{{ $t('manageDinoz.disclaimer') }}
	</div>
	<table>
		<tbody>
			<tr>
				<th class="dinoz">{{ $t('manageDinoz.dinoz') }}</th>
				<th class="elements">{{ $t('manageDinoz.elements') }}</th>
			</tr>

			<Tippy
				theme="normal"
				tag="tr"
				v-for="(dinoz, index) in dinozList"
				:key="dinoz.id"
				:class="{
					even: (index + 1) % 2 == 0
				}"
			>
				<td class="dinoz">{{ dinoz.name }}</td>
				<td class="elements">TODO</td>

				<template #content> TEST </template>
			</Tippy>
		</tbody>
	</table>
</template>

<script lang="ts">
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import EventBus from '../events/index.js';
import { dinozStore, playerStore } from '../store/index.js';

export default defineComponent({
	name: 'ManageDinoz',
	components: {
		TitleHeader
	},
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			dinozList: [] as DinozFiche[]
		};
	},
	async mounted(): Promise<void> {
		// Redirect to last page if no PDA
		if (!this.playerStore.playerOptions.hasPDA) {
			EventBus.emit('toast', { type: 'error', message: 'noPDA' });
			this.$router.back();
			return;
		}

		if (!this.dinozStore.getDinozList) {
			EventBus.emit('toast', { type: 'error', message: 'dinozListMissing' });
			return;
		}

		this.dinozList = this.dinozStore.getDinozList;

		console.log(this.dinozList);
	}
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
table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		cursor: help;
		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;
			&.dinoz {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
			}
			&.elements {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
			}
		}
		td {
			font-size: 16px;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
			&.dinoz {
				padding: 1px 5px;
				max-width: 222px;
			}
			&.elements {
				padding: 1px 5px;
				width: 52px;
			}
		}
		&.even td {
			background-image: url('../assets/background/table_cell_even.webp');
			background-position: -10px 0px;
		}
	}
}
</style>
