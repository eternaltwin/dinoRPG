<template>
	<div class="dinorpg">
		<div class="menusky"></div>
		<div class="homepage-container">
			<AuthenticationPage class="sign" :autoLog="autoLog"></AuthenticationPage>
			<div class="box">
				<p>
					{{ $t('alpha.homepage.part1') }}<br /><br />
					{{ $t('alpha.homepage.part2') }}
					<a href="https://eternal-twin.net">Eternal-Twin</a> / <a href="https://discord.gg/ERc3svy">Discord</a>.
				</p>
			</div>
			<Suspense>
				<FullFightAnimation :key="$i18n.locale" :fight="getFight()" @animationEnded="autoLog = true" />
				<template #fallback> <Loading /> </template>
			</Suspense>
		</div>
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
			autoLog: false as boolean
		};
	},
	methods: {
		getFight(): preFightLoader {
			return {
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
						message: this.$t('alpha.homepage.dialog.message1')
					},
					{
						action: DinoAction.TEXT,
						message: this.$t('alpha.homepage.dialog.message2')
					},
					{
						action: DinoAction.TEXT,
						message: this.$t('alpha.homepage.dialog.message3')
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
						message: this.$t('alpha.homepage.dialog.message4')
					},
					{
						action: DinoAction.TALK,
						fid: -1,
						message: this.$t('alpha.homepage.dialog.message5')
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
	}
});
</script>

<style lang="scss" scoped>
.dinorpg {
	background-image: url('../assets/background/full_sky_bg.webp');
	background-position-x: calc(50%);
	background-repeat: no-repeat;
	.menusky {
		height: 295px;
	}
	.homepage-container {
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
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
	}
}

@keyframes disappear {
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
}
@keyframes appear {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style>
