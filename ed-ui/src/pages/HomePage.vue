<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div id="nav" class="flex flex-col items-center">
		<div class="flex w-full">
			<!-- Section Left -->
			<div
				class="hidden grow -scale-x-100 bg-[url('./assets/background/bg_ciel.webp')] bg-left-top bg-no-repeat md:block"
			></div>
			<!-- Section Center -->
			<div class="mx-0 flex w-full max-w-[1008px] flex-col items-center px-0 sm:w-full">
				<div
					class="h-[510px] w-full bg-[url('./assets/background/sky_headerbg.webp')] bg-cover bg-center bg-no-repeat sm:bg-[url('./assets/background/sky_headerbg_02.webp')]"
				></div>
				<div class="-mt-32 flex justify-center">
					<AuthenticationPage :autoLog="autoLog"></AuthenticationPage>
				</div>
				<div class="mx-3 my-4 flex max-w-screen-xl flex-col items-center">
					<div
						class="relative m-4 max-w-screen-sm rounded-[18.5px] bg-[#52b6ff] p-4 px-6 shadow-inner"
						style="box-shadow: inset 0 0 2.1em 1.2em #b4e0ff"
					>
						<p class="font-[trebuchet ms] text-justify text-[15px] leading-relaxed text-[#016390]">
							{{ $t('alpha.homepage.part1') }}<br /><br />
							{{ $t('alpha.homepage.part2') }}
							<a
								href="https://eternal-twin.net"
								class="font-bold text-[#016390] no-underline hover:text-[#52b6ff] hover:underline"
								>Eternal-Twin</a
							>
							/
							<a
								href="https://discord.gg/ERc3svy"
								class="font-bold text-[#016390] no-underline hover:text-[#52b6ff] hover:underline"
								>Discord</a
							>.
						</p>
					</div>
					<Suspense>
						<FullFightAnimation :fight="fight" @animationEnded="autoLog = true" />
						<template #fallback>
							<Loading />
						</template>
					</Suspense>
				</div>
			</div>
			<!-- Section Right -->
			<div
				class="hidden grow -scale-x-100 bg-[url('./assets/background/bg_ciel.webp')] bg-right-top bg-no-repeat md:block"
			></div>
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
.box {
	margin: 1em 1em 1em;
	padding: 1em 1.5em;
}
p {
	text-align: justify;
	line-height: 1.4em;
	color: #016390;
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
	&.red {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: #ff4e64;
	}
}
.sign {
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
</style>
