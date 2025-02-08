<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.tournaments`)" />
	<ul class="tournament-list" v-if="!displayFinal">
		<li v-for="(_, group) in pools" :key="group" class="group">
			<a @click="activeGroup = group">
				{{ $t('dojo.group', { group: ALPHABET[group] }) }}
			</a>
		</li>
	</ul>
	<div class="wrapper tournament" v-if="!displayFinal">
		<div class="header">
			<DZButton @click="showFinal()">{{ $t('dojo.seeFinal') }}</DZButton>
		</div>
		<div class="rounds">
			<Tippy
				tag="div"
				theme="normal"
				class="dinoz"
				v-for="(dinoz, count) in pools[activeGroup]"
				:key="`${count}${dinoz.id}`"
				:class="{ lost: !dinoz.won }"
				@click="goToPage('ShareFight', { archive: dinoz.fight })"
			>
				<DinozMini :display="dinoz.display" :width="50" :height="50" :flip="isFlipped(count)" class="dinoz-display" />
				<span class="name">{{ dinoz.name }}</span>
				<template #content>
					<h1>{{ dinoz.name }}</h1>
					<p>{{ $t('dojo.seeFight') }}</p>
				</template>
			</Tippy>
		</div>
	</div>
	<div class="wrapper final" v-if="displayFinal">
		<div class="header final"></div>
		<div class="rounds">
			<Tippy
				tag="div"
				theme="normal"
				class="dinoz"
				v-for="(dinoz, index) in dinozInFights"
				:key="`${index}${dinoz.id}`"
				:class="{ lost: !dinoz.won }"
				@click="goToPage('ShareFight', { archive: dinoz.fight })"
			>
				<DinozMini :display="dinoz.display" v-if="dinoz.display" :width="50" :height="50" class="dinoz-display" />
				<span class="name">{{ dinoz.name }}</span>
				<template #content>
					<h1>{{ dinoz.name }}</h1>
					<p>{{ $t('dojo.seeFight') }}</p>
				</template>
			</Tippy>
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
			GROUP_COUNT: 0 as number,
			ALPHABET,
			dinozInFights: [] as DisplayedLeader[],
			tournament: [] as PublicTournament[],
			final: [] as PublicTournament[],
			pools: [] as DisplayedLeader[][],
			activeGroup: 0,
			displayFinal: false
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
				const tournamentId = this.$route.params.id as string;
				this.final = await DojoService.getTournamentFights(tournamentId, TournamentPhase.FINALS);
				this.dinozInFights = this.final.reduce((acc, fight) => {
					const d1 = {
						...fight.tournamentTeamLeft,
						fight: fight.id,
						won: fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber
					};
					const d2 = {
						...fight.tournamentTeamRight,
						fight: fight.id,
						won: !fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber
					};

					acc.push(d1, d2);

					// Add final winner
					if (fight.metadata.round === 3) {
						const winner = fight.result ? d1 : d2;
						acc.push({ ...winner });
					}

					return acc;
				}, [] as DisplayedLeader[]);
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
					this.dinozInFights.push(winner1, winner2, looser1, looser2);
				} else if (this.dinozInFights[this.dinozInFights.length - 1].round === 5) {
					const winnerWinnerBracket = this.final[2].result
						? this.formatDinoz(this.final[2], this.final[2].tournamentTeamLeft)
						: this.formatDinoz(this.final[2], this.final[2].tournamentTeamRight);
					const looserWinnerBracket = this.final[2].result
						? this.formatDinoz(this.final[2], this.final[2].tournamentTeamRight)
						: this.formatDinoz(this.final[2], this.final[2].tournamentTeamLeft);
					const winnerLooserBracket = this.final[3].result
						? this.formatDinoz(this.final[3], this.final[3].tournamentTeamLeft)
						: this.formatDinoz(this.final[3], this.final[3].tournamentTeamRight);
					this.dinozInFights.push(looserWinnerBracket, winnerLooserBracket, {}, winnerWinnerBracket);
				} else if (this.dinozInFights[this.dinozInFights.length - 1].round === 6) {
					const winnerWinnerBracket = this.final[2].result
						? this.formatDinoz(this.final[2], this.final[2].tournamentTeamLeft)
						: this.formatDinoz(this.final[2], this.final[2].tournamentTeamRight);
					const winnerLooserBracket = this.final[4].result
						? this.formatDinoz(this.final[4], this.final[4].tournamentTeamLeft)
						: this.formatDinoz(this.final[4], this.final[4].tournamentTeamRight);
					this.dinozInFights.push(winnerLooserBracket, winnerWinnerBracket);
				} else if (this.dinozInFights[this.dinozInFights.length - 1].round === 7) {
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
				matchNumber: match.metadata.matchNumber
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
		async accessTournament() {
			// Do nothing for now
		}
	},
	async mounted() {
		const tournamentId = this.$route.params.id as string;
		try {
			this.tournament = await DojoService.getTournamentFights(tournamentId, TournamentPhase.POOLS);
			this.dinozInFights = this.tournament.reduce((acc, fight) => {
				const d1 = {
					...fight.tournamentTeamLeft,
					fight: fight.id,
					won: fight.result,
					round: fight.metadata.round,
					pool: fight.metadata.poolNumber,
					matchNumber: fight.metadata.matchNumber
				};
				const d2 = {
					...fight.tournamentTeamRight,
					fight: fight.id,
					won: !fight.result,
					round: fight.metadata.round,
					pool: fight.metadata.poolNumber,
					matchNumber: fight.metadata.matchNumber
				};

				acc.push(d1, d2);

				// Add final winner
				if (fight.metadata.round === 3) {
					const winner = fight.result ? d1 : d2;
					acc.push({ ...winner });
				}

				return acc;
			}, [] as DisplayedLeader[]);
			this.GROUP_COUNT = this.dinozInFights.filter(d => d.round === 0).length / 16;
			this.pools = Array.from({ length: this.GROUP_COUNT }, () => []);
			this.dinozInFights.forEach(d => {
				this.pools[d.pool].push(d);
			});
			this.pools.map(p => {
				p.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				p.sort((d1, d2) => d1.round - d2.round);
			});
			this.pools.forEach(p => {
				const currentRound = p[p.length - 1].round;
				const winners = 16 / Math.pow(2, currentRound);
				const addedWinners = [] as DisplayedLeader[];
				for (let i = winners; i >= 1; i--) {
					if (p[p.length - i].won && p[p.length - i].round < 3) {
						addedWinners.push({ ...p[p.length - i], won: true });
					}
				}
				p.push(...addedWinners);
			});
		} catch (e) {
			errorHandler.handle(e, this.$toast);
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
