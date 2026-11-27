<template>
	<div class="wrapper">
		<div
			v-for="dinoz in dinozList"
			:key="dinoz.id"
			:class="['dinoz-button', { 'not-selected': !selectedDinoz.includes(dinoz.id), featured: isFeatured(dinoz) }]"
			:data-testid="`select-dinoz-${dinoz.id}`"
			@click="toggleDinoz(dinoz.id)"
		>
			<div class="background">
				<span
					v-if="isFeatured(dinoz)"
					class="featured-badge"
					v-tippy="{ content: $t('dojo.ui.featuredRace.dinozTip'), theme: 'small' }"
					>★</span
				>
				<DinozMini :display="dinoz.display" />
			</div>

			<div class="textbox">
				<p class="name">{{ dinoz.name }}</p>
				<p class="level">{{ $t('myAccount.level') }} {{ dinoz.level }}</p>
			</div>
		</div>
	</div>
	<p v-if="minRaces > 0" :class="['race-counter', { ok: enoughRaces }]" data-testid="race-counter">
		{{ $t('dojo.ui.raceCounter', { count: distinctRaces, min: minRaces }) }}
	</p>
	<p
		v-if="blockingReason && !selectionOver"
		class="blocking-reason"
		data-testid="selection-blocked"
		v-html="formatContent(blockingReason)"
	/>
	<div class="df jcc mt-1" v-if="selectedDinoz.length && selectedDinoz.length >= minLimit">
		<DZButton :off="!selectionOver && !!blockingReason" data-testid="select-dinoz-validate" @click="validate">{{
			selectionOver ? $t('dojo.challenge.edit') : $t('dojo.challenge.validate')
		}}</DZButton>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { playerStore, useDinozStore } from '../../store/index.js';
import DZButton from '../common/DZButton.vue';
import DinozMini from '../dinoz/DinozMini.vue';
import { DinozDojoFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { countDistinctRaces, raceIdFromDisplay } from '../../utils/dojo.js';

/** A dinoz that can be selected, its race is read from its display when not given */
export type SelectableDinoz = DinozDojoFiche & { raceId?: number };

export default defineComponent({
	name: 'SelectDinoz',
	components: {
		DinozMini,
		DZButton
	},
	data() {
		return {
			playerStore: playerStore(),
			selectionOver: false,
			selectedDinoz: [] as number[]
		};
	},
	props: {
		dinozList: {
			type: Object as PropType<SelectableDinoz[]>,
			required: true
		},
		selectLimit: {
			type: Number,
			default: 10
		},
		minLimit: {
			type: Number,
			default: 0
		},
		/** Minimum number of distinct races, shows a live counter when > 0 */
		minRaces: {
			type: Number,
			default: 0
		},
		/** Race of the day: its dinoz are highlighted */
		featuredRace: {
			type: Number as PropType<number | null>,
			default: null
		},
		/** Reason given by the parent to block the validation (e.g. a broken tournament rule), already translated */
		ruleError: {
			type: String as PropType<string | null>,
			default: null
		}
	},
	emits: ['validate', 'change'],
	computed: {
		distinctRaces(): number {
			return countDistinctRaces(
				this.selectedDinoz.map(id => {
					const dinoz = this.dinozList.find(d => d.id === id);
					return dinoz ? this.raceOf(dinoz) : undefined;
				})
			);
		},
		enoughRaces(): boolean {
			return this.distinctRaces >= this.minRaces;
		},
		blockingReason(): string | null {
			if (this.minRaces > 0 && this.selectedDinoz.length >= this.minLimit && !this.enoughRaces) {
				return this.$t('dojo.ui.notEnoughRaces', { count: this.distinctRaces, min: this.minRaces });
			}
			return this.ruleError;
		}
	},
	methods: {
		raceOf(dinoz: SelectableDinoz): number | undefined {
			return dinoz.raceId ?? raceIdFromDisplay(dinoz.display);
		},
		isFeatured(dinoz: SelectableDinoz): boolean {
			return this.featuredRace !== null && this.raceOf(dinoz) === this.featuredRace;
		},
		toggleDinoz(dinozId: number) {
			if (this.selectionOver) return;
			if (this.selectedDinoz.includes(dinozId)) {
				this.selectedDinoz = this.selectedDinoz.filter(id => id !== dinozId);
			} else {
				// Max selectLimit
				if (this.selectedDinoz.length >= this.selectLimit) {
					this.$toast.open({ message: this.$t(`toast.maxDinozSelected`), type: 'error' });
					return;
				}

				this.selectedDinoz = [...this.selectedDinoz, dinozId];
			}
			this.$emit('change', [...this.selectedDinoz]);
		},
		async validate() {
			if (!this.selectionOver) {
				// In this scenario, it means the player is validating (confirming) its choice.
				if (this.selectedDinoz.length === 0) {
					// Do nothing if no dinoz selected
					this.$toast.open({ message: this.$t(`toast.noDinozSelected`), type: 'error' });
					return;
				}
				if (this.selectedDinoz.length < this.minLimit) {
					// Do nothing if not enough dinoz selected
					this.$toast.open({ message: this.$t(`toast.notEnoughDinozSelected`), type: 'error' });
					return;
				}
				if (this.blockingReason) {
					// Too few races or a broken rule: the backend would refuse the team
					this.$toast.open({ message: this.blockingReason, type: 'error' });
					return;
				}
				// Only emit "validate" upon actual validation (not cancel)
				this.$emit('validate', this.selectedDinoz);
			}
			// Else (nothing to do on cancel)
			// Just update the flag
			this.selectionOver = !this.selectionOver;
		}
	},
	async mounted() {
		if (!useDinozStore().dinozList) {
			this.$toast.open({ message: this.$t(`toast.dinozListMissing`), type: 'error' });
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}

.wrapper {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;

	.dinoz-button {
		width: 96px;
		margin: 4px;
		border-radius: 5px;
		text-align: center;
		border: 1px solid #874b2e;
		cursor: pointer;
		user-select: none;
		display: flex;
		flex-direction: column;

		.background {
			position: relative;
			background-image: url('../../assets/battle/forcebrut.webp');
			background-repeat: no-repeat;
			background-size: cover;
			width: 100%;
			display: flex;
			justify-content: center;
		}

		.textbox {
			background: rgb(255 249 0);
			background: linear-gradient(180deg, rgb(255 249 0) 0%, rgb(176 153 20) 100%);
			border-top: 1px solid #874b2e;
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			font-size: 10px;
			font-weight: bold;

			.name {
				color: #874b2e;
			}

			.level {
				color: #fce3bc;
			}
		}

		&.not-selected {
			filter: grayscale(100%);
		}

		&.featured {
			border-color: #ffd700;
			box-shadow: 0 0 6px #ffd700;
		}

		.featured-badge {
			position: absolute;
			left: 4px;
			top: 2px;
			color: #ffd700;
			text-shadow: 0 0 2px #4d2713;
		}
	}
}

.race-counter,
.blocking-reason {
	text-align: center;
	margin-top: 4px;
	font-weight: bold;
}

.race-counter {
	color: #e2664c;

	&.ok {
		color: #aae59c;
	}
}

.blocking-reason {
	color: #ffda97;
}
</style>
