<template>
	<div class="full-fight">
		<div ref="canvasHolder" class="pixi-canvas"></div>
		<FightTimeline
			v-if="started"
			:current="currentStep"
			:total="stepCount"
			:seeking="seeking"
			:markers="markers"
			@seek="seek"
		/>
	</div>
</template>

<script lang="ts">
import { DinoAction, preFightLoader } from '@drpg/core/models/fight/transpiler';
import { Fight, type FightData } from '@eternaltwin/dinorpg_animations';
import { defineComponent, markRaw, PropType } from 'vue';
import { playerStore } from '../../store';
import FightTimeline, { FightTimelineMarker } from './FightTimeline.vue';

export default defineComponent({
	name: 'Fight',
	components: { FightTimeline },
	props: {
		fight: {
			type: Object as PropType<preFightLoader>,
			required: true
		}
	},
	emits: ['animationEnded'],
	data() {
		return {
			loadedFight: undefined as Fight | undefined,
			playerStore: playerStore(),
			started: false,
			// The end of the fight is announced once, even when the player seeks back and replays the end
			endAnnounced: false,
			currentStep: -1,
			stepCount: 0,
			seeking: false,
			markers: [] as FightTimelineMarker[]
		};
	},
	methods: {
		loadAnimation() {
			const steps = [...(this.fight.history ?? [])];
			// markRaw: Vue must not proxy the Pixi objects held by the fight
			const fight = markRaw(new Fight(this.fight as FightData));
			this.loadedFight = fight;
			this.stepCount = fight.stepCount;
			this.markers = this.buildMarkers(steps, fight.stepCount - steps.length);

			fight.onFightStart = () => {
				this.started = true;
				this.currentStep = fight.currentStep;
			};
			fight.onStepStart = idx => {
				this.currentStep = idx;
			};
			fight.onFightEnd = () => {
				if (!this.playerStore.getPlayerOptions.skipFight) {
					this.onFightEnd();
				}
			};

			const display = fight.getDisplay();
			display.style.maxWidth = '100%';
			(this.$refs.canvasHolder as HTMLDivElement).appendChild(display);
		},
		/**
		 * Deaths of the fight, placed on the timeline.
		 * @param offset Steps added by the animation before the history (the Display step, when the history has none)
		 */
		buildMarkers(steps: NonNullable<preFightLoader['history']>, offset: number): FightTimelineMarker[] {
			const fighters = new Map<number, { name: string; side: boolean }>();
			const markers: FightTimelineMarker[] = [];
			steps.forEach((s, i) => {
				if (!s) return;
				if (s.action === DinoAction.ADD) {
					fighters.set(s.fighter.fid, { name: s.fighter.name, side: s.fighter.side });
				} else if (s.action === DinoAction.DEAD) {
					const fighter = fighters.get(s.fid);
					markers.push({ step: i + offset, name: fighter?.name ?? '?', side: fighter?.side ?? true });
				}
			});
			return markers;
		},
		async seek(step: number) {
			const fight = this.loadedFight;
			if (!fight) return;
			this.seeking = true;
			this.currentStep = step;
			try {
				await fight.seek(step);
			} finally {
				// A later seek may still be running: its own promise ends the seeking state
				if (!fight.seeking) {
					this.seeking = false;
					this.currentStep = fight.currentStep;
				}
			}
		},
		onFightEnd() {
			if (this.endAnnounced) return;
			this.endAnnounced = true;
			this.$emit('animationEnded');

			if (this.fight.statusReward) {
				this.$toast.success(
					this.formatContent(
						this.$t('fight.statusReward', {
							reward: `:status_${this.fight.statusReward}: ${this.$t(`status.name.${this.fight.statusReward}`)}`
						})
					)
				);
			}
		}
	},
	mounted() {
		this.loadAnimation();
		if (this.playerStore.getPlayerOptions.skipFight) {
			this.onFightEnd();
		}
	},
	unmounted() {
		this.loadedFight?.destroy();
	}
});
</script>

<style scoped lang="scss">
.full-fight {
	display: flex;
	flex-direction: column;
	align-items: center;
	max-width: 100%;
}

.pixi-canvas {
	max-width: 100%;
	line-height: 0;

	:deep(canvas) {
		border-top: 1px solid #874a16;
		border-bottom: 1px solid #874a16;
	}
}
</style>
