<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.tournaments`)" />
	<ul class="tournament-list" v-if="!displayFinal">
		<li v-for="(_, group) in GROUP_COUNT" :key="group" class="group">
			<RouterLink :to="`/dojo/tournament/${tournamentId}/${group}`">
				{{ $t('dojo.group', { group: ALPHABET[group] }) }}
			</RouterLink>
		</li>
	</ul>
	<div class="container">
		<div class="wrapper tournament" v-if="!displayFinal">
			<div class="header">
				<RouterLink :to="`/dojo/tournament/${tournamentId}/5`">
					<DZButton>{{ $t('dojo.seeFinal') }}</DZButton>
				</RouterLink>
				<DZButton @click="viewAll()">{{ $t('dojo.markAsRead') }}</DZButton>
			</div>
			<div class="rounds">
				<template v-for="(team, count) in pool" :key="`${count}${team?.fight ?? 'undefined'}`">
					<div v-if="!team"></div>
					<Tippy
						tag="div"
						theme="normal"
						class="dinoz"
						v-else-if="team.show"
						:class="{ me: team.player && team.player.id === playerStore.getPlayerId, lost: !team.won && team.watched }"
						@click="goToPage('ShareFight', { archive: team.fight })"
					>
						<DinozMini
							v-if="team.dinoz"
							:display="team.dinoz.display"
							:width="50"
							:height="50"
							:flip="isFlipped(count)"
							class="dinoz-display"
						/>
						<span class="name" v-if="team.dinoz">{{ team.player?.name ?? '???' }}</span>

						<template #content>
							<h1 v-if="team.dinoz">{{ team.dinoz.name }}</h1>
							<p>{{ $t('dojo.seeFight') }}</p>
						</template>
					</Tippy>
					<Tippy tag="div" theme="normal" class="dinoz" v-else @click="goToPage('ShareFight', { archive: team.fight })">
						<span class="name">{{ $t('dojo.soon') }}</span>

						<template #content>
							<h1></h1>
							<p>{{ $t('dojo.seeFight') }}</p>
						</template>
					</Tippy>
				</template>
			</div>
		</div>
		<div class="wrapper final" v-if="displayFinal">
			<div class="header">
				<RouterLink :to="`/dojo/tournament/${tournamentId}/0`">
					<DZButton>{{ $t('dojo.return') }}</DZButton>
				</RouterLink>
			</div>
			<div class="rounds">
				<template v-for="(team, count) in final" :key="`${count}${team?.fight ?? 'undefined'}`">
					<div v-if="!team"></div>
					<Tippy
						tag="div"
						theme="normal"
						class="dinoz"
						v-else-if="team.show"
						:class="{ me: team.player && team.player.id === playerStore.getPlayerId, lost: !team.won && team.watched }"
						@click="goToPage('ShareFight', { archive: team.fight })"
					>
						<DinozMini v-if="team.dinoz" :display="team.dinoz.display" :width="50" :height="50" class="dinoz-display" />
						<span class="name" v-if="team.dinoz">{{ team.player?.name ?? '???' }}</span>

						<template #content>
							<h1 v-if="team.dinoz">{{ team.dinoz.name }}</h1>
							<p>{{ $t('dojo.seeFight') }}</p>
						</template>
					</Tippy>
					<Tippy tag="div" theme="normal" class="dinoz" v-else @click="goToPage('ShareFight', { archive: team.fight })">
						<span class="name">{{ $t('dojo.soon') }}</span>

						<template #content>
							<h1></h1>
							<p>{{ $t('dojo.seeFight') }}</p>
						</template>
					</Tippy>
				</template>
			</div>
		</div>
	</div>

	<DZDisclaimer help :content="$t('dojo.tournamentInfo')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import { playerStore } from '../../store/index.js';
import DZButton from '../common/DZButton.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import DinozMini from '../dinoz/DinozMini.vue';
import { DojoService } from '../../services/DojoService.js';
import { DisplayedLeader, PublicTournament, TournamentPhase, TournamentTeam } from '@drpg/core/models/dojo/tournament';
import { errorHandler } from '../../utils/index.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default defineComponent({
	name: 'DojoTournament',
	components: {
		TitleHeader,
		DZButton,
		DZDisclaimer,
		DinozMini
	},
	data() {
		return {
			playerStore: playerStore(),
			GROUP_COUNT: 4 as number,
			ALPHABET,
			dinozInFights: [] as DisplayedLeader[],
			tournament: [] as PublicTournament[],
			final: [] as (DisplayedLeader | undefined)[],
			pool: [] as (DisplayedLeader | undefined)[],
			activeGroup: 10,
			displayFinal: false,
			tournamentId: undefined as undefined | string
		};
	},
	methods: {
		goToPage(pageName: string, params?: Record<string, string>) {
			if (!params) return;
			this.$router.push({
				name: pageName,
				params
			});
		},
		async showFinal() {
			if (typeof this.tournamentId !== 'string') return;

			this.displayFinal = true;
			try {
				this.tournament = await DojoService.getTournamentFights(this.tournamentId, TournamentPhase.FINALS, 0);
				this.dinozInFights = this.tournament.reduce((acc, fight) => {
					const d1 = {
						dinoz: fight.tournamentTeamLeft?.dinoz ?? null,
						player: fight.tournamentTeamLeft?.player ?? null,
						fight: fight.id,
						won: fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						show: true,
						slot: 'left'
					} as DisplayedLeader;
					const d2 = {
						dinoz: fight.tournamentTeamRight?.dinoz ?? null,
						player: fight.tournamentTeamRight?.player ?? null,
						fight: fight.id,
						won: !fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						show: true,
						slot: 'right'
					} as DisplayedLeader;

					acc.push(d1, d2);

					return acc;
				}, [] as DisplayedLeader[]);
				// const maxRound = Math.max(...this.dinozInFights.map(f => f.round));
				this.tournament.sort((a, b) => a.metadata.matchNumber - b.metadata.matchNumber);
				this.tournament.sort((a, b) => a.metadata.round - b.metadata.round);

				this.dinozInFights.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				this.dinozInFights.sort((d1, d2) => d1.round - d2.round);
				this.GROUP_COUNT = 0;

				this.final = this.dinozInFights;
				if (this.dinozInFights[this.dinozInFights.length - 1].round === 4) {
					const winner1 = this.tournament[0].result
						? this.formatDinoz(this.tournament[0], this.tournament[0].tournamentTeamLeft)
						: this.formatDinoz(this.tournament[0], this.tournament[0].tournamentTeamRight);
					const loser1 = this.tournament[0].result
						? this.formatDinoz(this.tournament[0], this.tournament[0].tournamentTeamRight)
						: this.formatDinoz(this.tournament[0], this.tournament[0].tournamentTeamLeft);
					const winner2 = this.tournament[1].result
						? this.formatDinoz(this.tournament[1], this.tournament[1].tournamentTeamLeft)
						: this.formatDinoz(this.tournament[1], this.tournament[1].tournamentTeamRight);
					const loser2 = this.tournament[1].result
						? this.formatDinoz(this.tournament[1], this.tournament[1].tournamentTeamRight)
						: this.formatDinoz(this.tournament[1], this.tournament[1].tournamentTeamLeft);
					this.final.push(winner1);
					this.final.push(winner2);
					this.final.push(loser1);
					this.final.push(loser2);
				} else if (this.dinozInFights[this.dinozInFights.length - 1].round === 5) {
					const winnerWinnerBracket = this.tournament[2].result
						? this.formatDinoz(this.tournament[2], this.tournament[2].tournamentTeamLeft)
						: this.formatDinoz(this.tournament[2], this.tournament[2].tournamentTeamRight);
					const loserWinnerBracket = this.tournament[2].result
						? this.formatDinoz(this.tournament[2], this.tournament[2].tournamentTeamRight)
						: this.formatDinoz(this.tournament[2], this.tournament[2].tournamentTeamLeft);
					const winnerLoserBracket = this.tournament[3].result
						? this.formatDinoz(this.tournament[3], this.tournament[3].tournamentTeamLeft)
						: this.formatDinoz(this.tournament[3], this.tournament[3].tournamentTeamRight);
					this.final.push(loserWinnerBracket, winnerLoserBracket, undefined, winnerWinnerBracket);
				} else if (this.dinozInFights[this.dinozInFights.length - 1].round === 6) {
					const winnerWinnerBracket = this.tournament[2].result
						? this.formatDinoz(this.tournament[2], this.tournament[2].tournamentTeamLeft)
						: this.formatDinoz(this.tournament[2], this.tournament[2].tournamentTeamRight);
					const winnerLoserBracket = this.tournament[4].result
						? this.formatDinoz(this.tournament[4], this.tournament[4].tournamentTeamLeft)
						: this.formatDinoz(this.tournament[4], this.tournament[4].tournamentTeamRight);
					this.final.push(winnerLoserBracket, winnerWinnerBracket);
				} else if (this.dinozInFights[this.dinozInFights.length - 1].round === 7) {
					const winnerWinnerBracket = this.tournament[5].result
						? this.formatDinoz(this.tournament[5], this.tournament[5].tournamentTeamLeft)
						: this.formatDinoz(this.tournament[5], this.tournament[5].tournamentTeamRight);
					this.final.push(winnerWinnerBracket);
				}
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		formatDinoz(match: PublicTournament, team: TournamentTeam | null): DisplayedLeader {
			return {
				dinoz: team?.dinoz ?? null,
				player: team?.player ?? null,
				fight: match.id,
				won: true,
				round: match.metadata.round,
				pool: match.metadata.poolNumber,
				matchNumber: match.metadata.matchNumber,
				watched: match.watched,
				show: match.watched,
				slot: 'left'
			};
		},
		isFlipped(index: number) {
			if (index < 16) {
				return Math.floor(index / 4) % 2 === 1;
			} else if (index < 24) {
				return Math.floor(index / 2) % 2 === 1;
			} else {
				return index % 2 === 1;
			}
		},
		async loadPage() {
			if (typeof this.tournamentId !== 'string') return;

			this.GROUP_COUNT = 4;
			try {
				this.tournament = await DojoService.getTournamentFights(
					this.tournamentId,
					TournamentPhase.POOLS,
					this.activeGroup
				);
				this.pool = Array.from({ length: 31 });
				this.dinozInFights = this.tournament.reduce((acc, fight) => {
					const d1 = {
						dinoz: fight.tournamentTeamLeft?.dinoz ?? null,
						player: fight.tournamentTeamLeft?.player ?? null,
						fight: fight.id,
						won: fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						show: fight.watched,
						slot: 'left'
					} as DisplayedLeader;
					const d2 = {
						dinoz: fight.tournamentTeamRight?.dinoz ?? null,
						player: fight.tournamentTeamRight?.player ?? null,
						fight: fight.id,
						won: !fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						show: fight.watched,
						slot: 'right'
					} as DisplayedLeader;

					acc.push(d1, d2);

					return acc;
				}, [] as DisplayedLeader[]);
				const maxRound = Math.max(...this.dinozInFights.map(f => f.round));
				this.dinozInFights.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				this.dinozInFights.sort((d1, d2) => d1.round - d2.round);

				// Place base fighters
				this.dinozInFights.forEach(d => {
					const displayedFight = { ...d, show: true };
					if (d.round === 0) {
						this.pool[d.matchNumber * 2 + (d.slot === 'left' ? 0 : 1)] = displayedFight;
					} else if (d.round === 1) {
						this.pool[16 + d.matchNumber + (d.slot === 'left' ? 0 : 1)] = displayedFight;
					} else if (d.round === 2) {
						this.pool[24 + d.matchNumber / 2 + (d.slot === 'left' ? 0 : 1)] = displayedFight;
					} else if (d.round === 3) {
						this.pool[28 + d.matchNumber + (d.slot === 'left' ? 0 : 1)] = displayedFight;
					}
				});

				// this.pool.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				// this.pool.sort((d1, d2) => d1.round - d2.round);

				// Place watched fight
				this.dinozInFights
					.filter(d => d.won)
					.filter(d => d.round === maxRound)
					.forEach(dinoz => {
						if (maxRound === 0) {
							this.pool[16 + dinoz.matchNumber] = dinoz;
						} else if (maxRound === 1) {
							this.pool[24 + dinoz.matchNumber / 2] = dinoz;
						} else if (maxRound === 2) {
							this.pool[28 + dinoz.matchNumber / 4] = dinoz;
						} else if (maxRound === 3) {
							this.pool[30 + dinoz.matchNumber] = dinoz;
						}
					});
				this.displayFinal = false;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async viewAll() {
			if (typeof this.tournamentId !== 'string') return;

			try {
				await DojoService.viewAllFightFromPool(this.tournamentId, TournamentPhase.POOLS, this.activeGroup);
				this.loadPage();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		this.tournamentId = this.$route.params.id as string;
		this.activeGroup = +(this.$route.params.group as string);
	},
	watch: {
		'$route.params.group': async function (to) {
			if (to !== undefined && this.$route.name === 'DojoTournament') {
				this.activeGroup = +(this.$route.params.group as string);
			}
		},
		activeGroup: {
			handler(newValue) {
				// Note: `newValue` will be equal to `oldValue` here
				// on nested mutations as long as the object itself
				// hasn't been replaced.
				if (newValue === 5) this.showFinal();
				if (newValue < 5) this.loadPage();
			},
			deep: true
		}
	}
});
</script>

<style lang="scss" scoped>
.tournament-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin: 0;
	padding: 0;
	list-style: none;

	.group {
		margin: 2px 4px;

		a {
			cursor: pointer;
			text-decoration: underline;
			text-transform: uppercase;
			font-size: 11px;
			color: black;

			&:hover {
				background-color: inherit;
				color: #bc683c;
			}
		}
	}
}

@media (max-width: 505px) {
	.container {
		overflow-x: auto;
		margin: 10px;
	}
}

.wrapper {
	width: 495px;
	height: 531px;
	margin: 10px auto;

	background-repeat: no-repeat;

	.header {
		height: 45px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
.tournament {
	background-image: url('../../assets/design/dojo_tournament_bg.webp');
	.rounds {
		position: relative;
		height: 486px;

		.dinoz {
			position: absolute;
			width: 50px;
			height: 50px;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			background-image: url('../../assets/design/dojo_dino_available.webp');
			top: 200px;
			left: 100px;
			cursor: pointer;

			&.lost {
				filter: grayscale(100%);
			}

			&.me {
				background-image: url('../../assets/design/dojo_dino_selected.webp');
			}

			.name {
				text-shadow: #000000 0px 0px 5px;
				color: white;
				font-size: 10px;
			}

			&:nth-child(1) {
				top: 4px;
				left: 10px;
			}
			&:nth-child(2) {
				top: 64px;
				left: 10px;
			}
			&:nth-child(3) {
				top: 124px;
				left: 10px;
			}
			&:nth-child(4) {
				top: 184px;
				left: 10px;
			}
			&:nth-child(5) {
				top: 4px;
				left: 436px;
			}
			&:nth-child(6) {
				top: 64px;
				left: 436px;
			}
			&:nth-child(7) {
				top: 124px;
				left: 436px;
			}
			&:nth-child(8) {
				top: 184px;
				left: 436px;
			}
			&:nth-child(9) {
				top: 244px;
				left: 10px;
			}
			&:nth-child(10) {
				top: 304px;
				left: 10px;
			}
			&:nth-child(11) {
				top: 364px;
				left: 10px;
			}
			&:nth-child(12) {
				top: 424px;
				left: 10px;
			}
			&:nth-child(13) {
				top: 244px;
				left: 436px;
			}
			&:nth-child(14) {
				top: 304px;
				left: 436px;
			}
			&:nth-child(15) {
				top: 364px;
				left: 436px;
			}
			&:nth-child(16) {
				top: 424px;
				left: 436px;
			}
			&:nth-child(17) {
				top: 39px;
				left: 81px;
			}
			&:nth-child(18) {
				top: 153px;
				left: 81px;
			}
			&:nth-child(19) {
				top: 39px;
				left: 365px;
			}
			&:nth-child(20) {
				top: 153px;
				left: 365px;
			}
			&:nth-child(21) {
				top: 273px;
				left: 81px;
			}
			&:nth-child(22) {
				top: 393px;
				left: 81px;
			}
			&:nth-child(23) {
				top: 273px;
				left: 365px;
			}
			&:nth-child(24) {
				top: 393px;
				left: 365px;
			}
			&:nth-child(25) {
				top: 94px;
				left: 152px;
			}
			&:nth-child(26) {
				top: 94px;
				left: 294px;
			}
			&:nth-child(27) {
				top: 334px;
				left: 152px;
			}
			&:nth-child(28) {
				top: 334px;
				left: 294px;
			}
			&:nth-child(29) {
				top: 146px;
				left: 223px;
			}
			&:nth-child(30) {
				top: 275px;
				left: 223px;
			}
			&:nth-child(31) {
				top: 215px;
				left: 223px;
			}
		}
	}
}
.final {
	background-image: url('../../assets/design/dojo_final_bg.webp');
	.rounds {
		position: relative;
		height: 486px;

		.dinoz {
			position: absolute;
			width: 50px;
			height: 50px;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			background-image: url('../../assets/design/dojo_dino_available.webp');
			top: 200px;
			left: 100px;
			cursor: pointer;

			&.lost {
				filter: grayscale(100%);
			}

			&.me {
				background-image: url('../../assets/design/dojo_dino_selected.webp');
			}

			.name {
				text-shadow: #000000 0px 0px 5px;
				color: white;
				font-size: 10px;
			}

			&:nth-child(1) {
				top: 4px;
				left: 10px;
			}
			&:nth-child(2) {
				top: 64px;
				left: 10px;
			}
			&:nth-child(3) {
				top: 124px;
				left: 10px;
			}
			&:nth-child(4) {
				top: 184px;
				left: 10px;
			}
			&:nth-child(5) {
				top: 39px;
				left: 81px;
			}
			&:nth-child(6) {
				top: 153px;
				left: 81px;
			}
			&:nth-child(7) {
				top: 275px;
				left: 10px;
			}
			&:nth-child(8) {
				top: 335px;
				left: 10px;
			}
			&:nth-child(9) {
				top: 365px;
				left: 81px;
			}
			&:nth-child(10) {
				top: 304px;
				left: 81px;
			}
			&:nth-child(11) {
				top: 335px;
				left: 175px;
			}
			&:nth-child(12) {
				top: 100px;
				left: 175px;
			}
			&:nth-child(13) {
				top: 210px;
				left: 222px;
			}
		}
	}
}
</style>
