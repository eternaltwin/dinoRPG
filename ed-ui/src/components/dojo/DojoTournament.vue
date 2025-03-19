<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.tournaments`)" />
	<ul class="tournament-list" v-if="!displayFinal">
		<li v-for="(_, group) in GROUP_COUNT" :key="group" class="group">
			<RouterLink :to="`/dojo/tournament/${tournamentId}/${group}`">
				{{ $t('dojo.group', { group: ALPHABET[group] }) }}
			</RouterLink>
		</li>
	</ul>
	<div class="wrapper tournament" v-if="!displayFinal">
		<div class="header">
			<RouterLink :to="`/dojo/tournament/${tournamentId}/5`">
				<DZButton>{{ $t('dojo.seeFinal') }}</DZButton>
			</RouterLink>
			<DZButton @click="viewAll()">Mark as read</DZButton>
		</div>
		<div class="rounds">
			<template v-for="(dinoz, count) in pool" :key="`${count}${activeGroup}`">
				<div class="dinoz lost" v-if="dinoz === undefined">
					<span class="name"></span>
				</div>
				<Tippy
					tag="div"
					theme="normal"
					class="dinoz"
					v-else-if="dinoz.player"
					:class="{ me: dinoz.player.id === playerStore.getPlayerId, lost: !dinoz.won && dinoz.watched }"
					@click="goToPage('ShareFight', { archive: dinoz.fight })"
				>
					<DinozMini :display="dinoz.display" :width="50" :height="50" :flip="isFlipped(count)" class="dinoz-display" />
					<span class="name">{{ dinoz.player.name }}</span>

					<template #content>
						<h1>{{ dinoz.name }}</h1>
						<p>{{ $t('dojo.seeFight') }}</p>
					</template>
				</Tippy>
				<Tippy tag="div" theme="normal" class="dinoz" v-else @click="goToPage('ShareFight', { archive: dinoz.fight })">
					<span class="name">Soon</span>

					<template #content>
						<h1>{{ dinoz.name }}</h1>
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
			<template v-for="(dinoz, count) in dinozInFights" :key="`${count}${dinoz.id}`">
				<Tippy
					tag="div"
					theme="normal"
					class="dinoz"
					v-if="dinoz.player"
					:class="{ me: dinoz.player.id === playerStore.getPlayerId, lost: !dinoz.won && dinoz.watched }"
					@click="goToPage('ShareFight', { archive: dinoz.fight })"
				>
					<DinozMini :display="dinoz.display" v-if="dinoz.display" :width="50" :height="50" class="dinoz-display" />
					<span class="name">{{ dinoz.player.name }}</span>
					<template #content>
						<h1>{{ dinoz.name }}</h1>
						<p>{{ $t('dojo.seeFight') }}</p>
					</template>
				</Tippy>
				<Tippy tag="div" theme="normal" class="dinoz" v-else @click="goToPage('ShareFight', { archive: dinoz.fight })">
					<span class="name">Soon</span>

					<template #content>
						<h1>{{ dinoz.name }}</h1>
						<p>{{ $t('dojo.seeFight') }}</p>
					</template>
				</Tippy>
			</template>
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
import { DisplayedLeader, PublicTournament, TeamLeader, TournamentPhase } from '@drpg/core/models/dojo/tournament';
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
			final: [] as PublicTournament[],
			pool: [] as DisplayedLeader[],
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
			this.displayFinal = true;
			try {
				this.final = await DojoService.getTournamentFights(this.tournamentId, TournamentPhase.FINALS, 0);
				this.dinozInFights = this.final.reduce((acc, fight) => {
					const d1 = {
						...fight.tournamentTeamLeft,
						fight: fight.id,
						won: fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						slot: 'left'
					} as DisplayedLeader;
					const d2 = {
						...fight.tournamentTeamRight,
						fight: fight.id,
						won: !fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						slot: 'right'
					} as DisplayedLeader;

					acc.push(d1, d2);

					return acc;
				}, [] as DisplayedLeader[]);
				// const maxRound = Math.max(...this.dinozInFights.map(f => f.round));
				this.final.sort((a, b) => a.metadata.matchNumber - b.metadata.matchNumber);
				this.final.sort((a, b) => a.metadata.round - b.metadata.round);

				this.dinozInFights.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				this.dinozInFights.sort((d1, d2) => d1.round - d2.round);
				this.GROUP_COUNT = 0;
				if (this.dinozInFights[this.dinozInFights.length - 1].round === 4) {
					const winner1 = this.final[0].result
						? this.formatDinoz(this.final[0], this.final[0].tournamentTeamLeft)
						: this.formatDinoz(this.final[0], this.final[0].tournamentTeamRight);
					const looser1 = this.final[0].result
						? this.formatDinoz(this.final[0], this.final[0].tournamentTeamRight)
						: this.formatDinoz(this.final[0], this.final[0].tournamentTeamLeft);
					const winner2 = this.final[1].result
						? this.formatDinoz(this.final[1], this.final[1].tournamentTeamLeft)
						: this.formatDinoz(this.final[1], this.final[1].tournamentTeamRight);
					const looser2 = this.final[1].result
						? this.formatDinoz(this.final[1], this.final[1].tournamentTeamRight)
						: this.formatDinoz(this.final[1], this.final[1].tournamentTeamLeft);
					if (winner1.watched) {
						this.dinozInFights.push(winner1);
					} else {
						this.dinozInFights.push({ fight: winner1.fight });
					}
					if (winner2.watched) {
						this.dinozInFights.push(winner2);
					} else {
						this.dinozInFights.push({ fight: winner2.fight });
					}
					if (looser1.watched) {
						this.dinozInFights.push(looser1);
					} else {
						this.dinozInFights.push({ fight: looser1.fight });
					}
					if (looser2.watched) {
						this.dinozInFights.push(looser2);
					} else {
						this.dinozInFights.push({ fight: looser2.fight });
					}
				} else if (
					this.dinozInFights[this.dinozInFights.length - 1].round === 5 &&
					this.dinozInFights[this.dinozInFights.length - 1].watched
				) {
					const winnerWinnerBracket = this.final[2].result
						? this.formatDinoz(this.final[2], this.final[2].tournamentTeamLeft)
						: this.formatDinoz(this.final[2], this.final[2].tournamentTeamRight);
					const looserWinnerBracket = this.final[2].result
						? this.formatDinoz(this.final[2], this.final[2].tournamentTeamRight)
						: this.formatDinoz(this.final[2], this.final[2].tournamentTeamLeft);
					const winnerLooserBracket = this.final[3].result
						? this.formatDinoz(this.final[3], this.final[3].tournamentTeamLeft)
						: this.formatDinoz(this.final[3], this.final[3].tournamentTeamRight);
					if (looserWinnerBracket.watched) {
						this.dinozInFights.push(looserWinnerBracket);
					} else {
						this.dinozInFights.push({ fight: looserWinnerBracket.fight });
					}
					if (winnerLooserBracket.watched) {
						this.dinozInFights.push(winnerLooserBracket);
					} else {
						this.dinozInFights.push({ fight: winnerLooserBracket.fight });
					}
					this.dinozInFights.push({ fight: winnerWinnerBracket.fight });
					if (winnerWinnerBracket.watched) {
						this.dinozInFights.push(winnerWinnerBracket);
					} else {
						this.dinozInFights.push({ fight: winnerWinnerBracket.fight });
					}
					// this.dinozInFights.push(looserWinnerBracket, winnerLooserBracket, {}, winnerWinnerBracket);
				} else if (
					this.dinozInFights[this.dinozInFights.length - 1].round === 6 &&
					this.dinozInFights[this.dinozInFights.length - 1].watched
				) {
					const winnerWinnerBracket = this.final[2].result
						? this.formatDinoz(this.final[2], this.final[2].tournamentTeamLeft)
						: this.formatDinoz(this.final[2], this.final[2].tournamentTeamRight);
					const winnerLooserBracket = this.final[4].result
						? this.formatDinoz(this.final[4], this.final[4].tournamentTeamLeft)
						: this.formatDinoz(this.final[4], this.final[4].tournamentTeamRight);
					this.dinozInFights.push(winnerLooserBracket, winnerWinnerBracket);
				} else if (
					this.dinozInFights[this.dinozInFights.length - 1].round === 7 &&
					this.dinozInFights[this.dinozInFights.length - 1].watched
				) {
					const winnerWinnerBracket = this.final[5].result
						? this.formatDinoz(this.final[5], this.final[5].tournamentTeamLeft)
						: this.formatDinoz(this.final[5], this.final[5].tournamentTeamRight);
					this.dinozInFights.push(winnerWinnerBracket);
				}
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		formatDinoz(match: PublicTournament, leader: TeamLeader): DisplayedLeader {
			return {
				...leader,
				fight: match.id,
				won: true,
				round: match.metadata.round,
				pool: match.metadata.poolNumber,
				matchNumber: match.metadata.matchNumber,
				watched: match.watched
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
						...fight.tournamentTeamLeft,
						fight: fight.id,
						won: fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						slot: 'left'
					} as DisplayedLeader;
					const d2 = {
						...fight.tournamentTeamRight,
						fight: fight.id,
						won: !fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
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
					if (d.round === 0) {
						this.pool[d.matchNumber * 2 + (d.slot === 'left' ? 0 : 1)] = d;
					} else if (d.round === 1) {
						this.pool[16 + d.matchNumber + (d.slot === 'left' ? 0 : 1)] = d;
					} else if (d.round === 2) {
						this.pool[24 + d.matchNumber / 2 + (d.slot === 'left' ? 0 : 1)] = d;
					} else if (d.round === 3) {
						this.pool[28 + d.matchNumber + (d.slot === 'left' ? 0 : 1)] = d;
					}
				});

				// this.pool.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				// this.pool.sort((d1, d2) => d1.round - d2.round);

				// Place watched fight
				console.log(maxRound);
				this.dinozInFights
					.filter(d => d.won)
					.filter(d => d.round === maxRound)
					.forEach(dinoz => {
						if (maxRound === 0) {
							console.log(dinoz.matchNumber);
							if (dinoz.watched) {
								this.pool[16 + dinoz.matchNumber] = dinoz;
							} else {
								console.log('a');
								this.pool[16 + dinoz.matchNumber] = { fight: dinoz.fight } as DisplayedLeader;
							}
						} else if (maxRound === 1) {
							if (dinoz.watched) {
								this.pool[24 + dinoz.matchNumber / 2] = dinoz;
							} else {
								this.pool[24 + dinoz.matchNumber / 2] = { fight: dinoz.fight } as DisplayedLeader;
							}
						} else if (maxRound === 2) {
							if (dinoz.watched) {
								this.pool[28 + dinoz.matchNumber / 4] = dinoz;
							} else {
								this.pool[28 + dinoz.matchNumber / 4] = { fight: dinoz.fight } as DisplayedLeader;
							}
						} else if (maxRound === 3) {
							if (dinoz.watched) {
								this.pool[30 + dinoz.matchNumber] = dinoz;
							} else {
								this.pool[30 + dinoz.matchNumber] = { fight: dinoz.fight } as DisplayedLeader;
							}
						}
					});
				console.log(this.pool);

				this.displayFinal = false;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async viewAll() {
			try {
				await DojoService.viewAllFightFromPool(this.tournamentId, TournamentPhase.POOLS, this.activeGroup);
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
