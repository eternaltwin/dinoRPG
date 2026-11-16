<template>
	<div class="monitoring">
		<div class="toolbar">
			<DZButton @click="refresh()" :disabled="loading">Rafraîchir</DZButton>
			<label><input type="checkbox" v-model="autoRefresh" /> Auto (5 s)</label>
			<input type="text" v-model="filter" placeholder="Filtrer : joueur, clan, IP, canal, id…" />
			<span v-if="data" class="muted">Instantané : {{ formatTime(data.generatedAt) }}</span>
		</div>

		<template v-if="data">
			<p v-if="!data.wsServerRunning" class="warning">Le serveur WebSocket n'est pas démarré.</p>

			<div class="cards">
				<div class="card">
					<strong>{{ data.ws.total }}</strong>
					<span>WebSockets</span>
				</div>
				<div class="card" v-for="(count, state) in data.ws.byState" :key="state">
					<strong :class="stateClass(state)">{{ count }}</strong>
					<span>{{ state }}</span>
				</div>
				<div class="card">
					<strong>{{ data.ws.uniquePlayers }}</strong>
					<span>Joueurs WS</span>
				</div>
				<div class="card">
					<strong>{{ data.ws.channels.length }}</strong>
					<span>Canaux WS</span>
				</div>
				<div class="card">
					<strong>{{ data.sse.total }}</strong>
					<span>SSE ({{ data.sse.uniquePlayers }} joueurs)</span>
				</div>
				<div class="card">
					<strong>{{ data.pendingTickets.websocket }} / {{ data.pendingTickets.sse }}</strong>
					<span>Tickets en attente WS / SSE</span>
				</div>
			</div>

			<p v-if="anomalies.length" class="warning">
				<span v-for="anomaly in anomalies" :key="anomaly">⚠ {{ anomaly }}<br /></span>
			</p>

			<h3>Canaux WebSocket</h3>
			<DZTable>
				<tr>
					<th>Canal</th>
					<th>Clan</th>
					<th>Connexions</th>
					<th>Joueurs</th>
					<th>Fantômes</th>
				</tr>
				<tr v-for="channel in data.ws.channels" :key="channel.channel">
					<td>
						<a href="#" @click.prevent="filter = channel.channel">{{ channel.channel }}</a>
					</td>
					<td>
						<RouterLink v-if="channel.clanId" :to="{ name: 'AdminClan', query: { id: channel.clanId } }">
							{{ channel.clanName ?? `#${channel.clanId}` }}
						</RouterLink>
					</td>
					<td>{{ channel.members }}</td>
					<td>{{ channel.players }}</td>
					<td :class="{ bad: channel.ghostMembers > 0 }">{{ channel.ghostMembers }}</td>
				</tr>
				<tr v-if="data.ws.channels.length === 0">
					<td colspan="5">Aucun canal ouvert.</td>
				</tr>
			</DZTable>

			<h3>Connexions WebSocket ({{ filteredWs.length }})</h3>
			<DZTable>
				<tr>
					<th>État</th>
					<th>Joueur</th>
					<th>Canal / clan</th>
					<th>Ouverte depuis</th>
					<th>Dernier pong</th>
					<th>Msg reçus</th>
					<th>Msg envoyés</th>
					<th>Tampon</th>
					<th>IP</th>
					<th>Navigateur</th>
					<th>Id</th>
				</tr>
				<tr v-for="(ws, index) in filteredWs" :key="ws.connectionId ?? `pending-${index}`">
					<td>
						<span :class="stateClass(ws.readyState)">{{ ws.readyState }}</span>
						<span v-if="!ws.isAlive" class="bad" title="Ping sans réponse : coupée au prochain battement"> · muet</span>
						<span v-if="ws.orphan" class="bad" title="Hors de tout canal : ne reçoit rien"> · orpheline</span>
						<span v-if="!ws.connectionId" class="muted"> · ticket en cours</span>
					</td>
					<td>
						<RouterLink v-if="ws.playerId" :to="{ name: 'Player', query: { id: ws.playerId } }">
							{{ ws.playerName ?? ws.playerId }}
						</RouterLink>
					</td>
					<td>
						<RouterLink v-if="ws.clanId" :to="{ name: 'AdminClan', query: { id: ws.clanId } }">
							{{ ws.clanName ?? `#${ws.clanId}` }}
						</RouterLink>
						<span v-else>{{ ws.channel }}</span>
					</td>
					<td :title="formatTime(ws.connectedAt)">{{ since(ws.connectedAt) }}</td>
					<td :title="`Dernier ping : ${formatTime(ws.lastPingAt)}`" :class="{ bad: isPongLate(ws) }">
						{{ ws.lastPongAt ? since(ws.lastPongAt) : '—' }}
					</td>
					<td :title="formatTime(ws.lastMessageInAt)">
						{{ ws.messagesIn }}<span v-if="ws.lastMessageInAt" class="muted"> ({{ since(ws.lastMessageInAt) }})</span>
					</td>
					<td :title="formatTime(ws.lastMessageOutAt)">
						{{ ws.messagesOut
						}}<span v-if="ws.lastMessageOutAt" class="muted"> ({{ since(ws.lastMessageOutAt) }})</span>
					</td>
					<td :class="{ bad: ws.bufferedAmount > 0 }">{{ formatBytes(ws.bufferedAmount) }}</td>
					<td>
						<a v-if="ws.ip" href="#" @click.prevent="filter = ws.ip">{{ ws.ip }}</a>
					</td>
					<td class="ua" :title="ws.userAgent ?? ''">{{ shortUserAgent(ws.userAgent) }}</td>
					<td class="id" :title="ws.connectionId ?? ''">{{ ws.connectionId?.slice(0, 8) }}</td>
				</tr>
				<tr v-if="filteredWs.length === 0">
					<td colspan="11">Aucune connexion.</td>
				</tr>
			</DZTable>

			<h3>Connexions SSE ({{ filteredSse.length }})</h3>
			<DZTable>
				<tr>
					<th>État</th>
					<th>Joueur</th>
					<th>Canal</th>
					<th>Ouverte depuis</th>
					<th>Msg envoyés</th>
					<th>IP</th>
					<th>Navigateur</th>
				</tr>
				<tr v-for="(sse, index) in filteredSse" :key="`${sse.playerId}-${index}`">
					<td>
						<span :class="sse.open ? 'good' : 'bad'">{{ sse.open ? 'OPEN' : 'CLOSED' }}</span>
					</td>
					<td>
						<RouterLink :to="{ name: 'Player', query: { id: sse.playerId } }">
							{{ sse.playerName ?? sse.playerId }}
						</RouterLink>
					</td>
					<td>{{ sse.channel }}</td>
					<td :title="formatTime(sse.connectedAt)">{{ since(sse.connectedAt) }}</td>
					<td :title="formatTime(sse.lastMessageOutAt)">
						{{ sse.messagesOut
						}}<span v-if="sse.lastMessageOutAt" class="muted"> ({{ since(sse.lastMessageOutAt) }})</span>
					</td>
					<td>
						<a v-if="sse.ip" href="#" @click.prevent="filter = sse.ip">{{ sse.ip }}</a>
					</td>
					<td class="ua" :title="sse.userAgent ?? ''">{{ shortUserAgent(sse.userAgent) }}</td>
				</tr>
				<tr v-if="filteredSse.length === 0">
					<td colspan="7">Aucune connexion.</td>
				</tr>
			</DZTable>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService } from '../../services';
import { errorHandler } from '../../utils';
import DZTable from '../common/DZTable.vue';
import DZButton from '../common/DZButton.vue';
import {
	ServerEventsMonitoring,
	SseConnectionMonitoring,
	WsConnectionMonitoring
} from '@drpg/core/models/admin/ServerEventsMonitoring';

const REFRESH_MS = 5000;
/** The server pings every 30 s: a pong older than two rounds means the client stopped answering. */
const PONG_LATE_MS = 65_000;

export default defineComponent({
	name: 'ServerEventsMonitoring',
	components: { DZButton, DZTable },
	data() {
		return {
			data: null as ServerEventsMonitoring | null,
			loading: false,
			autoRefresh: true,
			filter: '',
			timer: undefined as ReturnType<typeof setInterval> | undefined
		};
	},
	computed: {
		filteredWs(): WsConnectionMonitoring[] {
			if (!this.data) return [];
			return this.data.ws.connections
				.filter(ws =>
					this.matches([ws.playerName, ws.playerId, ws.clanName, ws.channel, ws.ip, ws.connectionId, ws.readyState])
				)
				.sort((a, b) => (a.connectedAt ?? '').localeCompare(b.connectedAt ?? ''));
		},
		filteredSse(): SseConnectionMonitoring[] {
			if (!this.data) return [];
			return this.data.sse.connections.filter(sse => this.matches([sse.playerName, sse.playerId, sse.channel, sse.ip]));
		},
		anomalies(): string[] {
			if (!this.data) return [];
			const result: string[] = [];
			const connections = this.data.ws.connections;
			const orphans = connections.filter(ws => ws.orphan).length;
			if (orphans) result.push(`${orphans} connexion(s) hors de tout canal : elles ne reçoivent aucun message.`);
			const ghosts = this.data.ws.channels.reduce((sum, channel) => sum + channel.ghostMembers, 0);
			if (ghosts) result.push(`${ghosts} membre(s) de canal sans connexion vivante (fuite mémoire).`);
			const mute = connections.filter(ws => !ws.isAlive).length;
			if (mute) result.push(`${mute} connexion(s) sans réponse au dernier ping.`);
			const buffered = connections.filter(ws => ws.bufferedAmount > 0).length;
			if (buffered) result.push(`${buffered} connexion(s) avec des données en attente d'envoi.`);
			const closedSse = this.data.sse.connections.filter(sse => !sse.open).length;
			if (closedSse) result.push(`${closedSse} SSE fermée(s) pas encore nettoyée(s).`);
			const oldestTicket = this.data.pendingTickets.oldestAgeMs;
			if (oldestTicket !== null && oldestTicket > 60_000) result.push('Des tickets de plus d’une minute traînent.');
			return result;
		}
	},
	watch: {
		autoRefresh() {
			this.schedule();
		}
	},
	methods: {
		async refresh(): Promise<void> {
			if (this.loading) return;
			this.loading = true;
			try {
				this.data = await AdminService.getServerEventsMonitoring();
			} catch (e) {
				this.autoRefresh = false;
				errorHandler.handle(e, this.$toast);
			} finally {
				this.loading = false;
			}
		},
		schedule(): void {
			clearInterval(this.timer);
			this.timer = this.autoRefresh ? setInterval(() => this.refresh(), REFRESH_MS) : undefined;
		},
		matches(values: (string | null | undefined)[]): boolean {
			const needle = this.filter.trim().toLowerCase();
			if (!needle) return true;
			return values.some(value => value?.toLowerCase().includes(needle));
		},
		/** Relative to the snapshot, so that a page left open does not drift. */
		since(date: string | null): string {
			if (!date || !this.data) return '—';
			const seconds = Math.max(0, Math.round((Date.parse(this.data.generatedAt) - Date.parse(date)) / 1000));
			if (seconds < 60) return `${seconds} s`;
			const minutes = Math.floor(seconds / 60);
			if (minutes < 60) return `${minutes} min ${seconds % 60} s`;
			const hours = Math.floor(minutes / 60);
			if (hours < 24) return `${hours} h ${minutes % 60} min`;
			return `${Math.floor(hours / 24)} j ${hours % 24} h`;
		},
		formatTime(date: string | null): string {
			return date ? new Date(date).toLocaleString('fr-FR') : '—';
		},
		formatBytes(bytes: number): string {
			if (bytes < 1024) return `${bytes} o`;
			if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
			return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
		},
		isPongLate(ws: WsConnectionMonitoring): boolean {
			if (!this.data || !ws.connectedAt) return false;
			const reference = ws.lastPongAt ?? ws.connectedAt;
			return Date.parse(this.data.generatedAt) - Date.parse(reference) > PONG_LATE_MS;
		},
		stateClass(state: string): string {
			if (state === 'OPEN') return 'good';
			if (state === 'CONNECTING') return 'muted';
			return 'bad';
		},
		shortUserAgent(userAgent: string | null): string {
			if (!userAgent) return '';
			const browser = /(Firefox|Edg|OPR|Chrome|Safari)\/[\d.]+/.exec(userAgent)?.[0] ?? '';
			const os = /(Windows|Android|iPhone|iPad|Mac OS X|Linux)/.exec(userAgent)?.[0] ?? '';
			return [browser.replace('Edg/', 'Edge/'), os].filter(Boolean).join(' · ') || userAgent.slice(0, 30);
		}
	},
	async mounted() {
		await this.refresh();
		this.schedule();
	},
	unmounted() {
		clearInterval(this.timer);
	}
});
</script>

<style scoped lang="scss">
.monitoring {
	display: flex;
	flex-direction: column;
	color: #710;
}
.toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
	margin-top: 10px;
	input[type='text'] {
		padding: 5px;
		min-width: 220px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
	}
}
.cards {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 10px;
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 90px;
		padding: 6px 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		strong {
			font-size: 14pt;
		}
		span {
			font-size: 8pt;
		}
	}
}
h3 {
	margin: 14px 0 0;
}
.warning {
	margin-top: 10px;
	padding: 6px;
	border: 1px solid #c64e36;
	background-color: #fbe0c4;
	color: #a11;
}
.good {
	color: #2a7a3a;
	font-weight: bold;
}
.bad {
	color: #c11;
	font-weight: bold;
}
.muted {
	color: #a07040;
	font-size: 8pt;
}
.ua {
	max-width: 160px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.id {
	font-family: monospace;
}
</style>
