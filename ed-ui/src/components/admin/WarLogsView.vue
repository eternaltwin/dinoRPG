<template>
	<div class="war-logs">
		<div class="filters">
			<input type="number" v-model.number="clanId" placeholder="Clan ID (empty = all)" />
			<select v-model="typeFilter">
				<option :value="null">All war events</option>
				<option v-for="t in warLogTypes" :key="t" :value="t">{{ typeLabel(t) }}</option>
			</select>
			<button class="clear-btn" @click="clearFilters">Clear</button>
		</div>

		<table>
			<thead>
				<tr>
					<th>Date</th>
					<th>Event</th>
					<th>Player</th>
					<th>Details</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="logs.length === 0">
					<td colspan="4" class="empty">No logs found.</td>
				</tr>
				<tr v-for="log in filteredLogs" :key="log.id">
					<td class="date">{{ formatDate(log.createdAt as unknown as string) }}</td>
					<td>
						<span class="badge" :class="badgeClass(log.type)">{{ typeLabel(log.type) }}</span>
					</td>
					<td class="player">{{ log.player?.name ?? log.playerId }}</td>
					<td class="details">{{ describe(log) }}</td>
				</tr>
			</tbody>
		</table>

		<div class="pagination">
			<button @click="page--" :disabled="page <= 1">Previous</button>
			<span>Page {{ page }}</span>
			<button @click="page++" :disabled="logs.length < 20">Next</button>
		</div>
	</div>
</template>

<script lang="ts">
import { LogListResponse } from '@drpg/core/returnTypes/Log';
import { LogType } from '@drpg/prisma/enums';
import { defineComponent } from 'vue';
import { mixin } from '../../mixin/mixin.js';
import { LogsService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';

const warLogTypes = [
	LogType.ClanWarCastleBuilt,
	LogType.ClanWarDeclared,
	LogType.ClanWarForfeited,
	LogType.ClanWarDefenderAdded,
	LogType.ClanWarDefenderRemoved,
	LogType.ClanWarDefenseOrderUpdated,
	LogType.ClanWarCastleAttacked,
	LogType.ClanWarCastleRepaired,
	LogType.ClanWarResolved
] as const;

type WarLogType = (typeof warLogTypes)[number];

const TYPE_LABELS: Record<WarLogType, string> = {
	[LogType.ClanWarCastleBuilt]: 'Castle Built',
	[LogType.ClanWarDeclared]: 'War Declared',
	[LogType.ClanWarForfeited]: 'War Forfeited',
	[LogType.ClanWarDefenderAdded]: 'Defender Added',
	[LogType.ClanWarDefenderRemoved]: 'Defender Removed',
	[LogType.ClanWarDefenseOrderUpdated]: 'Defense Order',
	[LogType.ClanWarCastleAttacked]: 'Castle Attacked',
	[LogType.ClanWarCastleRepaired]: 'Castle Repaired',
	[LogType.ClanWarResolved]: 'War Resolved'
};

const BADGE_CLASSES: Record<WarLogType, string> = {
	[LogType.ClanWarCastleBuilt]: 'badge-orange',
	[LogType.ClanWarDeclared]: 'badge-blue',
	[LogType.ClanWarForfeited]: 'badge-gray',
	[LogType.ClanWarDefenderAdded]: 'badge-green',
	[LogType.ClanWarDefenderRemoved]: 'badge-green',
	[LogType.ClanWarDefenseOrderUpdated]: 'badge-green',
	[LogType.ClanWarCastleAttacked]: 'badge-red',
	[LogType.ClanWarCastleRepaired]: 'badge-yellow',
	[LogType.ClanWarResolved]: 'badge-blue'
};

function describe(log: LogListResponse[number]): string {
	const v = log.values;
	switch (log.type) {
		case LogType.ClanWarCastleBuilt:
			return `Clan #${v[0]} — ${v[1]}`;
		case LogType.ClanWarDeclared:
			return `War #${v[0]}: Clan #${v[1]} vs Clan #${v[2]}, ends ${new Date(v[3]).toLocaleString()}`;
		case LogType.ClanWarForfeited:
			return `Clan #${v[1]} forfeited War #${v[0]}`;
		case LogType.ClanWarDefenderAdded:
			return `Dinoz #${log.dinozId} added as defender for Clan #${v[0]}`;
		case LogType.ClanWarDefenderRemoved:
			return `Dinoz #${log.dinozId} removed from defense of Clan #${v[0]}`;
		case LogType.ClanWarDefenseOrderUpdated:
			return `Clan #${v[0]} updated defense order: [${v[1]}]`;
		case LogType.ClanWarCastleAttacked:
			return `Dinoz #${log.dinozId} attacked War #${v[0]} (Clan #${v[1]}) — dealt ${v[2]} dmg, castle at ${v[3]} HP`;
		case LogType.ClanWarCastleRepaired:
			return `Clan #${v[0]} repair #${v[1]}: +${v[2]} HP/tick, freq ${v[3]}s (tick ${v[4]})`;
		case LogType.ClanWarResolved:
			return `War #${v[0]} resolved — Winner: Clan #${v[1]}, reason: ${v[2]}`;
		default:
			return v.join(', ');
	}
}

export default defineComponent({
	name: 'WarLogsView',
	data() {
		return {
			logs: [] as LogListResponse,
			page: 1,
			clanId: null as number | null,
			typeFilter: null as WarLogType | null,
			warLogTypes,
			describe
		};
	},
	computed: {
		filteredLogs(): LogListResponse {
			if (this.typeFilter === null) return this.logs;
			return this.logs.filter(l => l.type === this.typeFilter);
		}
	},
	methods: {
		typeLabel(type: string): string {
			return TYPE_LABELS[type as WarLogType] ?? type;
		},
		badgeClass(type: string): string {
			return BADGE_CLASSES[type as WarLogType] ?? 'badge-gray';
		},
		clearFilters() {
			this.clanId = null;
			this.typeFilter = null;
			this.page = 1;
		},
		async reload() {
			try {
				this.logs = await LogsService.listWarLogs(this.page, this.clanId);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		}
	},
	mixins: [errorHandler, mixin],
	async mounted() {
		await this.reload();
	},
	watch: {
		page() {
			this.reload();
		},
		clanId() {
			this.page = 1;
			this.reload();
		}
	}
});
</script>

<style lang="scss" scoped>
.war-logs {
	padding: 10px 0;
}

.filters {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 12px;
	flex-wrap: wrap;

	input[type='number'],
	select {
		padding: 2px 6px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
	}
}

.clear-btn {
	background-color: #c64e36;
	color: #fffdba;
	border: 1px solid #c64e36;
	padding: 3px 14px;
	cursor: pointer;
}

table {
	width: 100%;
	border-collapse: collapse;

	th {
		text-align: left;
		font-size: 11px;
		text-transform: uppercase;
		color: #710;
		border-bottom: 1px solid #c88f44;
		padding: 4px 6px;
	}

	td {
		font-family: monospace;
		font-size: 12px;
		padding: 3px 6px;
		vertical-align: top;
		border-bottom: 1px solid #e8c880;
	}
}

.date {
	white-space: nowrap;
	width: 120px;
	color: #777;
}

.player {
	width: 140px;
	font-weight: bold;
}

.details {
	color: #333;
}

.empty {
	color: #999;
	font-style: italic;
	padding: 12px 6px;
}

.badge {
	display: inline-block;
	padding: 1px 7px;
	border-radius: 3px;
	font-size: 11px;
	font-weight: bold;
	white-space: nowrap;
	color: #fff;

	&.badge-blue {
		background-color: #3a6ea8;
	}
	&.badge-red {
		background-color: #b83232;
	}
	&.badge-green {
		background-color: #3a8a4a;
	}
	&.badge-yellow {
		background-color: #a87c1a;
	}
	&.badge-orange {
		background-color: #c86020;
	}
	&.badge-gray {
		background-color: #777;
	}
}

.pagination {
	margin-top: 14px;
	display: flex;
	align-items: center;
	gap: 10px;

	button {
		background-color: #c64e36;
		color: #fffdba;
		border: 1px solid #c64e36;
		padding: 4px 18px;
		cursor: pointer;

		&:disabled {
			opacity: 0.4;
			cursor: default;
		}
	}

	span {
		font-size: 13px;
		color: #710;
	}
}
</style>
