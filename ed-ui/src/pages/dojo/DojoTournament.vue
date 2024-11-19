<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.tournaments`)"/>
	<ul class="tournament-list">
		<li v-for="(_, group) in Array(GROUP_COUNT).fill(0)" :key="group" class="group">
			<a @click="goToPage('DojoTournament', { id: group.toString() })">
				{{ $t('dojo.group', { group: ALPHABET[group] }) }}
			</a>
		</li>
	</ul>
	<div class="wrapper">
		<div class="header">
			<DZButton @click="goToPage('DojoTournamentFight')">{{ $t('dojo.seeFinal') }}</DZButton>
		</div>
		<div class="rounds">
			<Tippy
				tag="div"
				theme="normal"
				class="dinoz"
				v-for="dinoz in dinozInFights"
				:key="dinoz.id"
				:class="{ lost: !dinoz.won }"
				@click="goToPage('DojoTournamentFight', { id: (dinoz.fight || 0).toString() })"
			>
				<DinozMini :display="dinoz.display" :width="60" :height="60" class="dinoz-display" />
				<span class="name">{{ dinoz.name }}</span>
				<template #content>
					<h1>{{ dinoz.name }}</h1>
					<p>{{ $t('dojo.seeFight') }}</p>
				</template>
			</Tippy>
		</div>
	</div>
	<DZButton @click="accessTournament">{{ $t('dojo.accessTournament') }}</DZButton>
	<DZDisclaimer
		help
		:content="
			$t('dojo.nextTournament', {
				next: NEXT_TOURNAMENT.toLocaleDateString(),
				qualif: NEXT_TOURNAMENT_QUALIF.toLocaleString()
			})
		"
	/>
	<DZDisclaimer help :content="$t('dojo.tournamentInfo')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { playerStore } from '../../store/index.js';
import DZButton from '../../components/common/DZButton.vue';
import DZDisclaimer from '../../components/common/DZDisclaimer.vue';
import DinozMini from '../../components/dinoz/DinozMini.vue';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Temp variables until we have a backend structure
const GROUP_COUNT = 16;
const NEXT_TOURNAMENT = new Date();
NEXT_TOURNAMENT.setDate(NEXT_TOURNAMENT.getDate() + 7);
const NEXT_TOURNAMENT_QUALIF = new Date();
NEXT_TOURNAMENT_QUALIF.setDate(NEXT_TOURNAMENT_QUALIF.getDate() + 3);

const DINOZ: {
	id: number;
	display: string;
	name: string;
	fight?: number;
	won?: boolean;
}[] = [
	{
		id: 1,
		display: 'E9QU92QJ7Ccxi000',
		name: 'Kaby'
	},
	{
		id: 2,
		display: '89xsZY2Pcvqx7000',
		name: 'chivas 7'
	},
	{
		id: 3,
		display: '89z53G4MA4oYL000',
		name: 'siry'
	},
	{
		id: 4,
		display: '894ur5tfqXgmd010',
		name: 'Frisquet'
	},
	{
		id: 5,
		display: '59Er3Lu8gcRIM000',
		name: 'Rocky'
	},
	{
		id: 6,
		display: '299Hk1DNPaT37000',
		name: 'Sharpy'
	},
	{
		id: 7,
		display: '293hjPJkq7e8s000',
		name: 'Croky'
	},
	{
		id: 8,
		display: '59owjLMvX17jM000',
		name: 'Hardy'
	},
	{
		id: 9,
		display: '59lEj9mnKAsIJ000',
		name: 'Holy'
	},
	{
		id: 10,
		display: '1AmkbhyWEFmyD000',
		name: 'Picky'
	},
	{
		id: 11,
		display: 'E97fzDHPL2Ia1000',
		name: 'Kujaku'
	},
	{
		id: 12,
		display: '49k6gLRZbi2Ug000',
		name: 'Castok'
	},
	{
		id: 13,
		display: '49Y1LoLsgxn2e000',
		name: 'Casty'
	},
	{
		id: 14,
		display: '4990u52LJlPPv000',
		name: 'Cast'
	},
	{
		id: 15,
		display: '59GnSj5mOyLIj100',
		name: 'Dropy'
	},
	{
		id: 16,
		display: 'F9frjga5ugAKa000',
		name: 'Mahy'
	}
];
const FIGHTS: {
	id: number;
	round: number;
	dinoz1: (typeof DINOZ)[number];
	dinoz2: (typeof DINOZ)[number];
	winner?: number;
}[] = [
	{
		id: 1,
		round: 0,
		dinoz1: DINOZ[0],
		dinoz2: DINOZ[1],
		winner: 2
	},
	{
		id: 2,
		round: 0,
		dinoz1: DINOZ[2],
		dinoz2: DINOZ[3],
		winner: 3
	},
	{
		id: 5,
		round: 0,
		dinoz1: DINOZ[8],
		dinoz2: DINOZ[9],
		winner: 9
	},
	{
		id: 6,
		round: 0,
		dinoz1: DINOZ[10],
		dinoz2: DINOZ[11],
		winner: 12
	},
	{
		id: 3,
		round: 0,
		dinoz1: DINOZ[4],
		dinoz2: DINOZ[5],
		winner: 5
	},
	{
		id: 4,
		round: 0,
		dinoz1: DINOZ[6],
		dinoz2: DINOZ[7],
		winner: 7
	},
	{
		id: 7,
		round: 0,
		dinoz1: DINOZ[12],
		dinoz2: DINOZ[13],
		winner: 13
	},
	{
		id: 8,
		round: 0,
		dinoz1: DINOZ[14],
		dinoz2: DINOZ[15],
		winner: 16
	},
	{
		id: 9,
		round: 1,
		dinoz1: DINOZ[1],
		dinoz2: DINOZ[2],
		winner: 3
	},
	{
		id: 11,
		round: 1,
		dinoz1: DINOZ[8],
		dinoz2: DINOZ[11],
		winner: 12
	},
	{
		id: 10,
		round: 1,
		dinoz1: DINOZ[4],
		dinoz2: DINOZ[6],
		winner: 7
	},
	{
		id: 12,
		round: 1,
		dinoz1: DINOZ[12],
		dinoz2: DINOZ[15],
		winner: 16
	},
	{
		id: 13,
		round: 2,
		dinoz1: DINOZ[2],
		dinoz2: DINOZ[11],
		winner: 12
	},
	{
		id: 14,
		round: 2,
		dinoz1: DINOZ[6],
		dinoz2: DINOZ[15],
		winner: 7
	},
	{
		id: 15,
		round: 3,
		dinoz1: DINOZ[11],
		dinoz2: DINOZ[6],
		winner: 12
	}
];

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
			GROUP_COUNT,
			ALPHABET,
			dinozInFights: [] as (typeof DINOZ)[number][],
			NEXT_TOURNAMENT,
			NEXT_TOURNAMENT_QUALIF
		};
	},
	methods: {
		goToPage(pageName: string, params?: Record<string, string>) {
			this.$router.push({
				name: pageName,
				params
			});
		},
		async accessTournament() {
			// Do nothing for now
		}
	},
	async mounted() {
		this.dinozInFights = FIGHTS.reduce(
			(acc, fight) => {
				const d1 = {
					...fight.dinoz1,
					fight: fight.id,
					won: fight.winner === fight.dinoz1.id
				};
				const d2 = {
					...fight.dinoz2,
					fight: fight.id,
					won: fight.winner === fight.dinoz2.id
				};

				acc.push(d1, d2);

				// Add final winner
				if (fight.round === 3) {
					const winner = fight.winner === fight.dinoz1.id ? d1 : d2;
					acc.push({ ...winner });
				}

				return acc;
			},
			[] as (typeof DINOZ)[number][]
		);
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
	background-image: url('../../assets/design/dojo_tournament_bg.webp');
	background-repeat: no-repeat;

	.header {
		height: 45px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

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
			background-image: url('../../assets/design/dojo_tournament_dinoz_bg.gif');
			top: 200px;
			left: 100px;
			cursor: pointer;

			&.lost {
				background-image: url('../../assets/design/dojo_tournament_dinoz_lost_bg.gif');
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
</style>
