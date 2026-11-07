<template>
	<div class="clan_wrapper" v-if="championship">
		<DZDisclaimer round :content="$t(`clanChampionship.phase.${championship.phase}`)" />
		<p v-if="championship.phase === 'registration' && !registrationStarted">
			{{ $t('clanChampionship.registrationStart', { date: formatDate(championship.registrationStart) }) }}
		</p>
		<p v-else-if="championship.phase === 'registration'">
			{{ $t('clanChampionship.registrationEnd', { date: formatDate(championship.registrationEnd) }) }}
		</p>
		<p v-if="championship.phase === 'running' || championship.phase === 'finished'">
			{{ $t('clanChampionship.endDate', { date: formatDate(championship.endDate) }) }}
		</p>

		<RouterLink v-if="canViewBoard && nextMatch?.status !== 'live'" :to="{ name: 'ClanChampionshipMatch' }">
			<DZButton>{{ $t('clanChampionship.viewBoard') }}</DZButton>
		</RouterLink>

		<template v-if="nextMatchVisible">
			<h3>{{ $t('clanChampionship.nextMatch') }}</h3>
			<ChampionshipNextMatch v-if="nextMatch" :match="nextMatch" :clanId="viewedClanId" />
			<p v-else>{{ $t('clanChampionship.noNextMatch') }}</p>
		</template>

		<div v-if="canRegister">
			<DZButton v-if="championship.myClanRegistered" :off="loading" @click="unregister">{{
				$t('clanChampionship.unregister')
			}}</DZButton>
			<DZButton v-else :off="loading" @click="register">{{ $t('clanChampionship.register') }}</DZButton>
		</div>

		<h3>{{ $t('clanChampionship.registeredClans', { count: championship.registrations.length }) }}</h3>
		<p v-if="championship.registrations.length === 0">{{ $t('clanChampionship.noRegistration') }}</p>
		<ul v-else class="registrations">
			<li v-for="(r, i) in championship.registrations" :key="i" :class="{ mine: r.clanId === viewedClanId }">
				<RouterLink v-if="r.clanId !== null" :to="{ name: 'Clan', params: { id: r.clanId } }">{{
					r.clanName
				}}</RouterLink>
				<span v-else>{{ r.clanName }}</span>
			</li>
		</ul>

		<template v-if="rounds.length > 0">
			<h3>{{ $t('clanChampionship.calendar') }}</h3>
			<DZTable v-for="round in rounds" :key="round.round">
				<tr>
					<th class="dinoz-header" colspan="4">{{ $t('clanChampionship.round', { round: round.round + 1 }) }}</th>
				</tr>
				<tr v-for="m in round.matches" :key="m.id" :class="{ mine: isMine(m) }">
					<td>
						<RouterLink v-if="m.homeClan.id !== null" :to="{ name: 'Clan', params: { id: m.homeClan.id } }">{{
							m.homeClan.name
						}}</RouterLink>
						<span v-else>{{ m.homeClan.name }}</span>
						{{ $t('clanChampionship.versus') }}
						<RouterLink v-if="m.awayClan.id !== null" :to="{ name: 'Clan', params: { id: m.awayClan.id } }">{{
							m.awayClan.name
						}}</RouterLink>
						<span v-else>{{ m.awayClan.name }}</span>
						<div v-if="isMine(m) && m.placeId !== null" class="place">{{ placeName(m.placeId) }}</div>
					</td>
					<td>{{ formatDate(m.startsAt) }}</td>
					<td>{{ formatDate(m.endsAt) }}</td>
					<td>
						<span>{{ $t(`clanChampionship.status.${m.status}`) }}</span>
						<span v-if="m.status !== 'scheduled'"> · {{ m.homeScore }} – {{ m.awayScore }}</span>
					</td>
				</tr>
			</DZTable>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import DZTable from '../common/DZTable.vue';
import ChampionshipNextMatch from './championship/ChampionshipNextMatch.vue';
import ChampionshipStandings from './championship/ChampionshipStandings.vue';
import { ClanChampionshipService } from '../../services';
import { clanSocket } from '../../services/clanSocket';
import { errorHandler } from '../../utils';
import { playerStore } from '../../store';
import { ClanChampionshipDTO, ClanChampionshipMatchDTO } from '@drpg/core/models/clan/clanChampionship';
import { placeList } from '@drpg/core/models/place/PlaceList';

export default defineComponent({
	name: 'ClanChampionship',
	components: { ChampionshipNextMatch, ChampionshipStandings, DZButton, DZDisclaimer, DZTable },
	data() {
		return {
			playerStore: playerStore(),
			championship: null as ClanChampionshipDTO | null,
			loading: false as boolean,
			stopListening: undefined as (() => void) | undefined,
			stopWaitingForReady: undefined as (() => void) | undefined
		};
	},
	computed: {
		viewedClanId(): number {
			return +this.$route.params.id;
		},
		registrationStarted(): boolean {
			return !!this.championship && new Date() >= new Date(this.championship.registrationStart);
		},
		canRegister(): boolean {
			return (
				!!this.championship &&
				this.championship.canManageRegistration &&
				this.championship.phase === 'registration' &&
				this.registrationStarted &&
				this.playerStore.clanId === this.viewedClanId
			);
		},
		canViewBoard(): boolean {
			return (
				!!this.championship &&
				(this.championship.phase === 'running' || this.championship.phase === 'finished') &&
				this.playerStore.clanId === this.viewedClanId
			);
		},
		nextMatchVisible(): boolean {
			return (
				!!this.championship && this.championship.phase === 'running' && this.playerStore.clanId === this.viewedClanId
			);
		},
		nextMatch(): ClanChampionshipMatchDTO | null {
			return (
				(this.championship?.matches ?? [])
					.filter(m => this.isMine(m) && m.status !== 'finished')
					.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0] ?? null
			);
		},
		rounds(): { round: number; matches: ClanChampionshipMatchDTO[] }[] {
			const byRound = new Map<number, ClanChampionshipMatchDTO[]>();
			for (const m of this.championship?.matches ?? []) {
				byRound.set(m.round, [...(byRound.get(m.round) ?? []), m]);
			}
			return [...byRound.entries()].sort((a, b) => a[0] - b[0]).map(([round, matches]) => ({ round, matches }));
		}
	},
	methods: {
		formatDate(d: Date | string): string {
			return new Date(d).toLocaleString(this.$i18n.locale, { dateStyle: 'short', timeStyle: 'short' });
		},
		placeName(placeId: number): string {
			const place = Object.values(placeList).find(p => p.placeId === placeId);
			return place ? this.$t(`place.name.${place.name}`) : '?';
		},
		isMine(m: ClanChampionshipMatchDTO): boolean {
			return m.homeClan.id === this.viewedClanId || m.awayClan.id === this.viewedClanId;
		},
		async load() {
			try {
				this.championship = await ClanChampionshipService.getCurrent();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async register() {
			await this.change(() => ClanChampionshipService.register());
		},
		async unregister() {
			await this.change(() => ClanChampionshipService.unregister());
		},
		async change(action: () => Promise<void>) {
			this.loading = true;
			try {
				await action();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				await this.load();
				this.loading = false;
			}
		}
	},
	async mounted() {
		this.stopListening = clanSocket.onMessage(message => {
			if (message.type === 'championshipChanged') void this.load();
		});
		// Pushes may have been missed while the connection was down
		this.stopWaitingForReady = clanSocket.onReady(() => void this.load());
		await this.load();
	},
	beforeUnmount() {
		this.stopListening?.();
		this.stopWaitingForReady?.();
	}
});
</script>

<style lang="scss" scoped>
.clan_wrapper {
	width: 95%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-bottom: 5px;
}
h3 {
	color: #874a16;
	text-transform: uppercase;
	font-size: 0.9em;
	letter-spacing: 1px;
}
.registrations {
	columns: 2;
	li.mine a {
		font-weight: bold;
	}
}
.place {
	font-weight: normal;
	font-size: 0.85em;
}
tr.mine td {
	background-color: #f3ca92;
	font-weight: bold;
}
</style>
