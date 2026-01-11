<template>
	<ul class="tournament-list">
		<li v-for="(_, group) in GROUP_COUNT" :key="group" class="group">
			<RouterLink
				:to="{
					name: 'FBTournament',
					query: { id: tournamentId, group: group }
				}"
			>
				{{ $t('dojo.group', { group: ALPHABET[group] }) }}
			</RouterLink>
		</li>
	</ul>
	<div class="wrapper tournament">
		<div class="header">
			<RouterLink
				:to="{
					name: 'FBTournament',
					query: { id: tournamentId, group: 17 }
				}"
			>
				<DZButton>{{ $t('dojo.seeFinal') }}</DZButton>
			</RouterLink>
			<DZButton @click="viewAll()">{{ $t('dojo.markAsRead') }}</DZButton>
		</div>
		<div class="rounds">
			<template v-for="(team, count) in pool.filter(p => p !== undefined)" :key="`${count}${team.fight}`">
				<Tippy
					tag="div"
					theme="normal"
					class="dinoz"
					v-if="team.show"
					:class="{ me: team.player && team.player.id === playerStore.getPlayerId, lost: !team.won && team.watched }"
					@click="goToPage('ShareFight', { archive: team.fight })"
				>
					<DinozMini
						:display="team.dinoz.display"
						:width="50"
						:height="50"
						:flip="isFlipped(count)"
						class="dinoz-display"
					/>
					<span class="name">{{ team.player?.name ?? '???' }}</span>

					<template #content>
						<h1>{{ team?.dinoz?.name }}</h1>
						<p>{{ $t('dojo.seeFight', { player: team?.player?.name }) }}</p>
					</template>
				</Tippy>
				<Tippy tag="div" theme="normal" class="dinoz" v-else @click="goToPage('ShareFight', { archive: team.fight })">
					<span class="name">{{ $t('dojo.soon') }}</span>

					<template #content>
						<h1>{{ team?.dinoz?.name }}</h1>
						<p>{{ $t('dojo.seeFight', { player: team?.player?.name }) }}</p>
					</template>
				</Tippy>
			</template>
		</div>
	</div>
	<DZDisclaimer help :content="$t('dojo.tournamentInfo')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { playerStore } from '../../store/index.js';
import DZButton from '../common/DZButton.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import DinozMini from '../dinoz/DinozMini.vue';
import { DisplayedLeader, PublicTournament, TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { errorHandler } from '../../utils/index.js';
import { FBService } from '../../services/FBTournamentService.js';
import { Ensure } from '@drpg/core/utils/type';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default defineComponent({
	name: 'TournamentDisplay',
	components: {
		DZButton,
		DZDisclaimer,
		DinozMini
	},
	data() {
		return {
			playerStore: playerStore(),
			GROUP_COUNT: 16 as number,
			ALPHABET,
			dinozInFights: [] as Ensure<DisplayedLeader, 'dinoz'>[],
			tournament: [] as PublicTournament[],
			pool: [] as Ensure<DisplayedLeader, 'dinoz'>[]
		};
	},
	props: {
		tournamentId: {
			type: String,
			required: true
		},
		activeGroup: {
			type: Number,
			required: true
		}
	},
	methods: {
		goToPage(pageName: string, params?: Record<string, string>) {
			if (!params) return;
			this.$router.push({
				name: pageName,
				params
			});
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
			this.GROUP_COUNT = 16;
			let isFinal = false;
			try {
				if (this.activeGroup === 17) {
					isFinal = true;
					this.tournament = await FBService.getTournamentFights(
						this.tournamentId,
						TournamentPhase.FINALS,
						this.activeGroup
					);
				} else {
					this.tournament = await FBService.getTournamentFights(
						this.tournamentId,
						TournamentPhase.POOLS,
						this.activeGroup
					);
				}
				this.pool = Array.from({ length: 31 });
				this.dinozInFights = this.tournament.reduce(
					(acc, fight) => {
						if (!fight.tournamentTeamLeft?.dinoz) {
							throw new Error('Left fighter not found');
						}
						const d1 = {
							dinoz: fight.tournamentTeamLeft.dinoz,
							player: fight.tournamentTeamLeft?.player ?? null,
							fight: fight.id,
							won: fight.result,
							round: fight.metadata.round - (isFinal ? 4 : 0),
							pool: fight.metadata.poolNumber,
							matchNumber: fight.metadata.matchNumber,
							watched: fight.watched,
							show: fight.watched,
							slot: 'left'
						} as Ensure<DisplayedLeader, 'dinoz'>;

						if (!fight.tournamentTeamRight?.dinoz) {
							throw new Error('Right fighter not found');
						}
						const d2 = {
							dinoz: fight.tournamentTeamRight.dinoz,
							player: fight.tournamentTeamRight?.player ?? null,
							fight: fight.id,
							won: !fight.result,
							round: fight.metadata.round - (isFinal ? 4 : 0),
							pool: fight.metadata.poolNumber,
							matchNumber: fight.metadata.matchNumber,
							watched: fight.watched,
							show: fight.watched,
							slot: 'right'
						} as Ensure<DisplayedLeader, 'dinoz'>;

						acc.push(d1, d2);

						return acc;
					},
					[] as Ensure<DisplayedLeader, 'dinoz'>[]
				);
				const maxRound = Math.max(...this.dinozInFights.map(f => f.round));
				this.dinozInFights.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				this.dinozInFights.sort((d1, d2) => d1.round - d2.round);

				// Place base fighters
				this.dinozInFights.forEach(d => {
					const displayedFight = { ...d, show: true };
					if (d.round === 0) {
						this.pool[d.matchNumber * 2 + (d.slot === 'left' ? 1 : 0)] = displayedFight;
					} else if (d.round === 1) {
						this.pool[16 + d.matchNumber + (d.slot === 'left' ? 0 : 1)] = displayedFight;
					} else if (d.round === 2) {
						this.pool[24 + d.matchNumber / 2 + (d.slot === 'left' ? 0 : 1)] = displayedFight;
					} else if (d.round === 3) {
						this.pool[28 + d.matchNumber + (d.slot === 'left' ? 0 : 1)] = displayedFight;
					}
				});
				this.pool.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				this.pool.sort((d1, d2) => d1.round - d2.round);

				// Place watched fight
				this.dinozInFights
					.filter(d => d.won)
					.filter(d => d.round === maxRound)
					.forEach(dinoz => {
						if (maxRound === 0) {
							this.pool[16 + dinoz.matchNumber] = dinoz;
						} else if (maxRound === 1) {
							this.pool[24 + dinoz.matchNumber] = dinoz;
						} else if (maxRound === 2) {
							this.pool[28 + dinoz.matchNumber] = dinoz;
						} else if (maxRound === 3) {
							this.pool[30 + dinoz.matchNumber] = dinoz;
						}
					});
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async viewAll() {
			try {
				const phase = this.activeGroup === 17 ? TournamentPhase.FINALS : TournamentPhase.POOLS;
				await FBService.viewAllFightFromPool(this.tournamentId, phase, this.activeGroup);
				this.loadPage();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		this.loadPage();
	},
	watch: {
		activeGroup() {
			this.loadPage();
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
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 100%;
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
