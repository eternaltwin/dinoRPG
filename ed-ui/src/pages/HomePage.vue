<template>
	<div id="nav" align="center">
		<table>
			<tbody>
				<tr>
					<td class="left" valign="top" />
					<td valign="top" align="center">
						<div class="centerHeader" valign="top" />
						<div class="menusky">
							<AuthenticationPage :autoLog="autoLog"></AuthenticationPage>
						</div>
						<div class="homepage-container">
							<div class="box">
								<p>
									{{ $t('alpha.homepage.part1') }}<br /><br />
									{{ $t('alpha.homepage.part2') }}
									<a href="https://eternal-twin.net">Eternal-Twin</a> /
									<a href="https://discord.gg/ERc3svy">Discord</a>.
								</p>
							</div>
							<Suspense>
								<FullFightAnimation :fight="fight" @animationEnded="autoLog = true" />
								<template #fallback> <Loading /> </template>
							</Suspense>
						</div>
					</td>
					<td class="right" valign="top" />
				</tr>
			</tbody>
		</table>
		<div class="footer" />
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import AuthenticationPage from './AuthenticationPage.vue';
import {
	DinoAction,
	EmoteBehaviour,
	EmoteList,
	EntranceEffect,
	FinishState,
	preFightLoader
} from '@drpg/core/models/fight/transpiler';

export default defineComponent({
	name: 'HomePage',
	components: {
		AuthenticationPage,
		FullFightAnimation: defineAsyncComponent(() => import('../components/fight/FullFightAnimation.vue'))
	},
	data() {
		return {
			fight: {} as preFightLoader,
			autoLog: false as boolean
		};
	},
	mounted() {
		this.fight = {
			bg: 's_dnv',
			top: 70,
			bottom: 0,
			ground: 0,
			history: [
				{
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: true,
						life: 100,
						maxLife: 100,
						name: 'Gerardufoin',
						side: true,
						scale: 1,
						fid: 0,
						gfx: '09T1Yt9wqq4Rx000',
						entrance: EntranceEffect.GROW
					}
				},
				{
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: true,
						life: 100,
						maxLife: 100,
						name: 'Biosha',
						side: true,
						scale: 1,
						fid: 1,
						gfx: '19CfWPseFa5gJ000',
						entrance: EntranceEffect.JUMP
					}
				},
				{
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: true,
						life: 100,
						name: 'Zenoo',
						maxLife: 100,
						side: true,
						scale: 1,
						fid: 2,
						gfx: '894ur5tfqXgmd010',
						entrance: EntranceEffect.GROUND
					}
				},
				{
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: true,
						life: 100,
						maxLife: 100,
						name: 'Jahaa',
						side: true,
						scale: 1,
						fid: 3,
						gfx: '29v1YPSSlNVjT000',
						entrance: EntranceEffect.GROUND
					}
				},
				{
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: true,
						life: 100,
						maxLife: 100,
						name: 'Jolu',
						side: true,
						scale: 1,
						fid: 4,
						gfx: '89XIW5r5kNoJF000',
						entrance: EntranceEffect.GROUND
					}
				},
				{
					action: DinoAction.WAIT,
					time: 1000
				},
				{
					action: DinoAction.TEXT,
					message: 'Aaah, Dinoville, le joyaux de Dinoland, le point de départ de toute aventure qui se respecte.'
				},
				{
					action: DinoAction.TEXT,
					message:
						"Après un long périple, vous êtes enfin arrivé à votre destination, attiré par des rumeurs d'aventures palpitantes, de richesses, et de gloire."
				},
				{
					action: DinoAction.TEXT,
					message: "C'est ici que vous pourrez recruter votre premier compagnon et..."
				},
				{
					action: DinoAction.SHAKE,
					force: 20,
					frict: 0.9
				},
				{
					action: DinoAction.WAIT,
					time: 500
				},
				{
					action: DinoAction.EMOTE,
					fids: [0, 1, 2],
					emote: EmoteList.Question,
					behaviour: EmoteBehaviour.Float
				},
				{
					action: DinoAction.WAIT,
					time: 1000
				},
				{
					action: DinoAction.ADD,
					fighter: {
						props: [],
						dino: false,
						life: 100,
						maxLife: 100,
						name: 'Mandragore',
						side: false,
						scale: 1,
						fid: -1,
						gfx: 'mandragore',
						entrance: 1,
						x: 325,
						y: 260
					}
				},
				{
					action: DinoAction.TALK,
					fid: -1,
					message: 'Enfin !'
				},
				{
					action: DinoAction.TALK,
					fid: -1,
					message: "Salut toi ! Prêt à rejoindre l'aventure ?"
				},
				{
					action: DinoAction.WAIT,
					time: 300
				},
				{
					action: DinoAction.FINISH,
					left: FinishState.RUN,
					right: FinishState.ESCAPE
				}
			]
		};
	}
});
</script>

<style lang="scss" scoped>
#nav {
	.homepage-container {
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
		max-width: 1280px;
		margin: 1em 3vw;
		.box {
			position: relative;
			max-width: calc(640px - 2em);
			margin: 1em 1em 1em;
			padding: 1em 1.5em;
			@include corner-bezel(18.5px);
			box-shadow: inset 0 0 2.1em 1.2em #b4e0ff;
			background-color: #52b6ff;
		}
		p {
			text-align: justify;
			font-size: 15px;
			line-height: 1.4em;
			font-family:
				trebuchet ms,
				arial;
			color: #016390;
		}
		img {
			width: auto;
			height: auto;
			margin: 0.6em auto 0.1em;
			padding: 0.6em;
			border-radius: 0.4em;
			background-color: rgba(15, 15, 67, 0.5);
		}
		a {
			color: #016390;
			font-weight: bold;
			text-decoration: none;
			font-variant: small-caps;
			text-shadow:
				0 1px 0 #a5d9ff,
				0 -1px 0 #a5d9ff,
				1px 0 0 #a5d9ff,
				-1px 0 0 #a5d9ff,
				1px 1px 0 #a5d9ff,
				-1px -1px 0 #a5d9ff,
				-1px 1px 0 #a5d9ff,
				1px -1px 0 #a5d9ff,
				0px 2px 2px #0076cc;
			&:hover {
				color: #52b6ff;
				text-shadow:
					0 1px 0 white,
					0 -1px 0 white,
					1px 0 0 white,
					-1px 0 0 white,
					1px 1px 0 white,
					-1px -1px 0 white,
					-1px 1px 0 white,
					1px -1px 0 white,
					0 2px 2px #0076cc;
			}
		}
		em {
			color: #01c3df;
			font-size: 1.2em;
			font-style: normal;
			font-weight: bold;
			//    &.red { color: #ff4e64; }
			&.red {
				color: inherit;
				text-decoration: underline;
				text-decoration-color: #ff4e64;
			}
		}
	}
	.menusky {
		display: flex;
		justify-content: center;
		position: relative;
		margin-top: -8em;
	}
	td {
		text-align: center;
		padding: 0;
	}
	table {
		border-collapse: collapse;
		border-spacing: 0;
		width: 100%;
	}
	.right {
		background-position: left top;
		background-image: url('../assets/background/bg_ciel.webp');
	}
	.left {
		background-position: right top;
		background-image: url('../assets/background/bg_ciel.webp');
	}
	.right,
	.left {
		background-repeat: repeat-x;
		width: 50%;
		@media (max-width: 1024px) {
			width: 1%;
		}
		@media (max-width: 1010px) {
			width: 0%;
		}
	}
	.centerHeader {
		background-image: url('../assets/background/sky_headerbg_02.webp');
		background-repeat: no-repeat;
		background-position: center;
		//width: 1008px;
		height: 510px;
		margin: 0;
		padding: 0;
		@media (max-width: 1024px) {
			width: 100%;
		}
		@media (max-width: 768px) {
			background-image: url('../assets/background/sky_headerbg.webp');
			background-size: cover;
		}
	}
	.sign {
		position: inherit;
		font-family:
			trebuchet ms,
			arial;
		font-size: 25px;
		color: #016390;
		font-weight: bold;
		text-decoration: none;
		cursor: pointer;
		margin-left: 10px;
		text-shadow:
			0 1px 0 #a5d9ff,
			0 -1px 0 #a5d9ff,
			1px 0 0 #a5d9ff,
			-1px 0 0 #a5d9ff,
			1px 1px 0 #a5d9ff,
			-1px -1px 0 #a5d9ff,
			-1px 1px 0 #a5d9ff,
			1px -1px 0 #a5d9ff,
			0 2px 2px #0076cc;
		padding: 10px;
		overflow: hidden;
		animation: disappear 2s infinite alternate;
	}
	@keyframes disappear {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
	.sign:hover {
		color: #52b6ff;
		background-color: transparent;
		text-shadow:
			0 1px 0 white,
			0 -1px 0 white,
			1px 0 0 white,
			-1px 0 0 white,
			1px 1px 0 white,
			-1px -1px 0 white,
			-1px 1px 0 white,
			1px -1px 0 white,
			0 2px 2px #0076cc;
		animation: none;
	}
	.sign:hover::before {
		animation: appear 2s infinite alternate;
	}
	@keyframes appear {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.bloc {
		width: 53em;
		height: 19em;
		margin-top: 21.5em;
		background-position: left top;
		position: absolute;
	}
}
.footer {
	background-image: url('../assets/background/sky_footer_blue.webp');
	height: 4em;
	width: 100%;
	background-repeat: repeat-x;
	background-position: center bottom;
	bottom: 0;
	position: fixed;
}
</style>
