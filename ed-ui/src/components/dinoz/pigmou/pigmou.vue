<template>
	<div class="dinoz" v-if="!isLoading">
		<div class="pigmou_head" :id="`${display}-pigmou-head`">
			<component
				:is="dinozHead"
				class="head"
				:id="`${display}-head`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFourthColor="mainFourthColor"
			></component>
			<component
				:is="eyebrow"
				class="eyebrow"
				:id="`${display}-eyebrow`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFifthColor="mainFifthColor"
			></component>
			<component :is="sclera" class="sclera" :id="`${display}-sclera`" :size="size"></component>
			<component :is="pupil" v-if="hasPupil" class="pupil" :id="`${display}-pupil`" :size="size"></component>
			<component
				:is="pupilSpecial0"
				v-if="hasPupilSpecial0"
				class="pupil_special_0"
				:id="`${display}-pupil-special-0`"
				:size="size"
			></component>
			<component
				:is="dinozMouth"
				class="mouth"
				:id="`${display}-mouth`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFifthColor="mainFifthColor"
			></component>
			<component
				:is="mouthSpecial0"
				v-if="hasMouthSpecial0"
				class="mouth_special_0"
				:id="`${display}-mouth-special-0`"
				:size="mouthSpecial0Size * size"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
				:tailSecondColor="tailSecondColor"
				:tailThirdColor="tailThirdColor"
			></component>
			<component
				:is="mouthSpecial1"
				v-if="hasMouthSpecial1"
				class="mouth_special_1"
				:id="`${display}-mouth-special-1`"
				:size="size"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
				:tailSecondColor="tailSecondColor"
				:tailThirdColor="tailThirdColor"
			></component>
			<component
				:is="hairImage1"
				v-if="hasHairImage1"
				class="hair_image_1"
				:id="`${display}-hair-image-1`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFourthColor="mainFourthColor"
				:mainFifthColor="mainFifthColor"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
				:tailSecondColor="tailSecondColor"
				:hairColor="hairColor"
			></component>
			<component
				:is="hairImage2"
				v-if="hasHairImage2"
				class="hair_image_2"
				:id="`${display}-hair-image-2`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFourthColor="mainFourthColor"
				:mainFifthColor="mainFifthColor"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
				:tailSecondColor="tailSecondColor"
			></component>
			<component
				:is="hairImage3"
				v-if="hasHairImage3"
				class="hair_image_3"
				:id="`${display}-hair-image-3`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFourthColor="mainFourthColor"
				:mainFifthColor="mainFifthColor"
			></component>
			<component
				:is="hairImage4"
				v-if="hasHairImage4"
				class="hair_image_4"
				:id="`${display}-hair-image-4`"
				:size="size"
			></component>
			<component
				:is="headInjury1"
				v-if="hasInjury"
				class="head_injury_1"
				:id="`${display}-head-injury-1`"
				:size="size"
				:mainThirdColor="mainThirdColor"
				:mainSecondColor="mainSecondColor"
				:mainFifthColor="mainFifthColor"
			></component>
			<component
				:is="headInjury2"
				v-if="hasInjury"
				class="head_injury_2"
				:id="`${display}-head-injury-2`"
				:size="size"
			></component>
			<component
				:is="headInjury3"
				v-if="hasInjury"
				class="head_injury_3"
				:id="`${display}-head-injury-3`"
				:size="size"
			></component>
			<component
				:is="headInjury4"
				v-if="hasInjury"
				class="head_injury_4"
				:id="`${display}-head-injury-4`"
				:size="size"
			></component>
			<component
				:is="headInjury5"
				v-if="hasInjury"
				class="head_injury_5"
				:id="`${display}-head-injury-5`"
				:size="size"
			></component>
			<component
				:is="headInjury6"
				v-if="hasInjury"
				class="head_injury_6"
				:id="`${display}-head-injury-6`"
				:size="size"
			></component>
			<component
				:is="headInjury7"
				v-if="hasInjury && injuryType === 'heavy'"
				class="head_injury_7"
				:id="`${display}-head-injury-7`"
				:size="size"
			></component>
			<component
				:is="headSpecial"
				v-if="isSpecial"
				class="head_special_1"
				:id="`${display}-head-special-1`"
				:size="size"
				:brighterSpecialColor="brighterSpecialColor"
				:darkerSpecialColor="darkerSpecialColor"
			></component>
		</div>

		<div class="pigmou_body" :id="`${display}-body`">
			<component
				:is="frontLeftLeg"
				class="front_left_leg"
				:id="`${display}-front-left-leg`"
				:size="size * frontLeftLegSize"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFourthColor="mainFourthColor"
			></component>
			<component
				:is="frontLeftNails"
				class="front_left_nails"
				:id="`${display}-front-left-nails`"
				:size="size * frontLeftLegSize"
			></component>
			<component
				:is="frontLeftLegSpecial"
				v-if="isSpecial"
				class="front_left_leg_special_1"
				:id="`${display}-front-left-leg-special-1`"
				:size="size * frontLeftLegSize"
				:brighterSpecialColor="brighterSpecialColor"
			></component>
			<component
				:is="chest"
				class="chest"
				:id="`${display}-chest`"
				:size="size * chestSize"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFourthColor="mainFourthColor"
			></component>
			<component
				:is="chestSpecial0"
				v-if="isSpecial"
				class="chest_special_0"
				:id="`${display}-chest-special-0`"
				:size="size * chestSize"
				:brighterSpecialColor="brighterSpecialColor"
			></component>
			<component
				:is="frontRightLeg"
				class="front_right_leg"
				:id="`${display}-front-right-leg`"
				:size="size * frontRightLegSize"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFourthColor="mainFourthColor"
			></component>
			<component
				:is="frontRightNail"
				class="front_right_nail"
				:id="`${display}-front-right-nail`"
				:size="size * frontRightLegSize"
			></component>
			<component
				:is="frontRightLegSpecial"
				v-if="isSpecial"
				class="front_right_leg_special_1"
				:id="`${display}-front-right-leg-special-1`"
				:size="size * frontRightLegSize"
				:brighterSpecialColor="brighterSpecialColor"
			></component>
			<component
				:is="backRightLeg"
				class="back_right_leg"
				:id="`${display}-back-right-leg`"
				:size="size * backRightLegSize"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:mainFourthColor="mainFourthColor"
			></component>
			<component
				:is="backRightNail"
				class="back_right_nail"
				:id="`${display}-back-right-nail`"
				:size="size * backRightLegSize"
			></component>
			<component
				:is="backRightLegSpecial"
				v-if="isSpecial"
				class="back_right_leg_special_1"
				:id="`${display}-back-right-leg-special-1`"
				:size="size * backRightLegSize"
				:brighterSpecialColor="brighterSpecialColor"
			></component>
			<component
				:is="furBackRightLeg"
				v-if="hasFur"
				class="fur_back_right_leg"
				:id="`${display}-fur-back-right-leg`"
				:size="size * backRightLegSize"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
				:tailSecondColor="tailSecondColor"
			></component>
			<component
				:is="furFrontRightLeg"
				v-if="hasFur"
				class="fur_front_right_leg"
				:id="`${display}-fur-front-right-leg`"
				:size="size * frontRightLegSize"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
				:tailSecondColor="tailSecondColor"
				:tailThirdColor="tailThirdColor"
			></component>
			<component
				:is="furFrontLeftLeg"
				v-if="hasFur"
				class="fur_front_left_leg"
				:id="`${display}-fur-front-left-leg`"
				:size="size * frontLeftLegSize"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
			></component>
			<component
				:is="legInjury1"
				v-if="hasInjury"
				class="leg_injury_1"
				:id="`${display}-leg-injury-1`"
				:size="size"
			></component>
			<component
				:is="legInjury2"
				v-if="hasInjury && hasFrontRightLegInjury2"
				class="leg_injury_2"
				:id="`${display}-leg-injury-2`"
				:size="size"
			></component>
		</div>

		<div class="pigmou_tail" :id="`${display}-pigmou-tail`">
			<component
				:is="dinozTail"
				class="tail"
				:id="`${display}-tail`"
				:size="size * tailSize"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
				:tailSecondColor="tailSecondColor"
				:tailFourthColor="tailFourthColor"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainFourthColor="mainFourthColor"
			></component>
			<component
				:is="dinozTailSpecial"
				v-if="hasTailSpecial0"
				class="tail_special_0"
				:id="`${display}-tail-special-0`"
				:size="size * tailSize"
				:tailBorderColor="tailBorderColor"
				:tailFirstColor="tailFirstColor"
				:tailSecondColor="tailSecondColor"
				:tailFourthColor="tailFourthColor"
			></component>
			<component
				:is="tailInjury1"
				v-if="hasInjury && hasTailInjury"
				class="tail_injury_1"
				:id="`${display}-tail-injury-1`"
				:size="size * injuryTailSize"
			></component>
		</div>
	</div>
</template>

<script lang="ts">
import { pigmou } from '../../../constants';
import { defineAsyncComponent, defineComponent } from 'vue';

export default defineComponent({
	name: 'Pigmou',
	props: {
		life: { type: Number, required: true },
		display: { type: String, required: true },
		flip: { type: Number, required: true }
	},
	data() {
		return {
			mainFirstColor: undefined as string | undefined,
			mainSecondColor: undefined as string | undefined,
			mainThirdColor: undefined as string | undefined,
			mainFourthColor: undefined as string | undefined,
			mainFifthColor: undefined as string | undefined,
			tailBorderColor: undefined as string | undefined,
			tailFirstColor: undefined as string | undefined,
			tailSecondColor: undefined as string | undefined,
			tailThirdColor: undefined as string | undefined,
			tailFourthColor: undefined as string | undefined,
			brighterSpecialColor: undefined as string | undefined,
			darkerSpecialColor: undefined as string | undefined,
			hairColor: undefined as string | undefined,
			isLoading: true as boolean,
			size: 1 as number,
			tailSize: 1 as number,
			injuryTailSize: 1 as number,
			headNumber: undefined as number | undefined,
			eye: {} as any, // eslint-disable-line
			mouth: {} as any, // eslint-disable-line
			tail: {} as any, // eslint-disable-line
			hair: {} as any, // eslint-disable-line
			childOrAdult: undefined as 'adult' | 'baby' | undefined,
			childOrAdultOrDemon: undefined as 'adult' | 'baby' | 'demon' | undefined,
			normalOrDemon: undefined as 'normal' | 'demon' | undefined,
			headDefaultPositionTop: undefined as string | undefined,
			headDefaultPositionLeft: undefined as string | undefined,
			headInjury1PositionTop: undefined as string | undefined,
			headInjury1PositionLeft: undefined as string | undefined,
			headInjury1ImgNumber: undefined as number | undefined,
			headInjury2PositionTop: undefined as string | undefined,
			headInjury2PositionLeft: undefined as string | undefined,
			headInjury2ImgNumber: undefined as number | undefined,
			headInjury3PositionTop: undefined as string | undefined,
			headInjury3PositionLeft: undefined as string | undefined,
			headInjury3ImgNumber: undefined as number | undefined,
			headInjury3ZIndex: undefined as number | undefined,
			headInjury4PositionTop: undefined as string | undefined,
			headInjury4PositionLeft: undefined as string | undefined,
			headInjury4ImgNumber: undefined as number | undefined,
			headInjury5PositionTop: undefined as string | undefined,
			headInjury5PositionLeft: undefined as string | undefined,
			headInjury5ImgNumber: undefined as number | undefined,
			headInjury5ImgRotation: undefined as string | undefined,
			headInjury6PositionTop: undefined as string | undefined,
			headInjury6PositionLeft: undefined as string | undefined,
			headInjury6ImgNumber: undefined as number | undefined,
			headInjury7PositionTop: undefined as string | undefined,
			headInjury7PositionLeft: undefined as string | undefined,
			headInjury7ImgNumber: undefined as number | undefined,
			headSpecial0PositionTop: undefined as string | undefined,
			headSpecial0PositionLeft: undefined as string | undefined,
			eyebrowPositionTop: undefined as string | undefined,
			eyebrowPositionLeft: undefined as string | undefined,
			eyePositionTop: undefined as string | undefined,
			eyePositionLeft: undefined as string | undefined,
			pupilPositionTop: undefined as string | undefined,
			pupilPositionLeft: undefined as string | undefined,
			pupilSpecialPositionTop: undefined as string | undefined,
			pupilSpecialPositionLeft: undefined as string | undefined,
			mouthPositionTop: undefined as string | undefined,
			mouthPositionLeft: undefined as string | undefined,
			mouthSpecial0Object: {} as any, // eslint-disable-line
			mouthSpecial0PositionTop: undefined as string | undefined,
			mouthSpecial0PositionLeft: undefined as string | undefined,
			mouthSpecial0Size: 1 as number,
			mouthSpecial0ZIndex: undefined as number | undefined,
			mouthSpecial1PositionTop: undefined as string | undefined,
			mouthSpecial1PositionLeft: undefined as string | undefined,
			bodyDefaultPositionTop: undefined as string | undefined,
			bodyDefaultPositionLeft: undefined as string | undefined,
			frontLeftLegPositionTop: undefined as string | undefined,
			frontLeftLegPositionLeft: undefined as string | undefined,
			frontLeftLegSize: 1 as number,
			frontLeftLegNailsPositionTop: undefined as string | undefined,
			frontLeftLegNailsPositionLeft: undefined as string | undefined,
			frontLeftLegSpecialPositionTop: undefined as string | undefined,
			frontLeftLegSpecialPositionLeft: undefined as string | undefined,
			furFrontLeftLegPositionTop: undefined as string | undefined,
			furFrontLeftLegPositionLeft: undefined as string | undefined,
			chestPositionTop: undefined as string | undefined,
			chestPositionLeft: undefined as string | undefined,
			chestSize: 1 as number,
			chestSpecialPositonTop: undefined as string | undefined,
			chestSpecialPositonLeft: undefined as string | undefined,
			frontRightLegPositionTop: undefined as string | undefined,
			frontRightLegPositionLeft: undefined as string | undefined,
			frontRightLegSize: 1 as number,
			frontRightNailsPositionTop: undefined as string | undefined,
			frontRightNailsPositionLeft: undefined as string | undefined,
			frontRightLegInjury1PositionTop: undefined as string | undefined,
			frontRightLegInjury1PositionLeft: undefined as string | undefined,
			frontRightLegInjury2PositionTop: undefined as string | undefined,
			frontRightLegInjury2PositionLeft: undefined as string | undefined,
			frontRightLegSpecialPositionTop: undefined as string | undefined,
			frontRightLegSpecialPositionLeft: undefined as string | undefined,
			furFrontRightLegPositionTop: undefined as string | undefined,
			furFrontRightLegPositionLeft: undefined as string | undefined,
			backRightLegPositionTop: undefined as string | undefined,
			backRightLegPositionLeft: undefined as string | undefined,
			backRightLegSize: 1 as number,
			backRightNailsPositionTop: undefined as string | undefined,
			backRightNailsPositionLeft: undefined as string | undefined,
			backRightLegSpecialPositionTop: undefined as string | undefined,
			backRightLegSpecialPositionLeft: undefined as string | undefined,
			furBackRightLegPositionTop: undefined as string | undefined,
			furBackRightLegPositionLeft: undefined as string | undefined,
			tailDefaultPositionTop: undefined as string | undefined,
			tailDefaultPositionLeft: undefined as string | undefined,
			tailPositionTop: undefined as string | undefined,
			tailPositionLeft: undefined as string | undefined,
			tailSpecial0PositionTop: undefined as string | undefined,
			tailSpecial0PositionLeft: undefined as string | undefined,
			tailInjury1PositionTop: undefined as string | undefined,
			tailInjury1PositionLeft: undefined as string | undefined,
			hairImage1PositionTop: undefined as string | undefined,
			hairImage1PositionLeft: undefined as string | undefined,
			hairImage1ZIndex: undefined as string | undefined,
			hairImage1Object: {} as any, // eslint-disable-line
			hairImage2PositionTop: undefined as string | undefined,
			hairImage2PositionLeft: undefined as string | undefined,
			hairImage2ZIndex: undefined as string | undefined,
			hairImage2Object: {} as any, // eslint-disable-line
			hairImage3PositionTop: undefined as string | undefined,
			hairImage3PositionLeft: undefined as string | undefined,
			hairImage3Object: {} as any, // eslint-disable-line
			hairImage4PositionTop: undefined as string | undefined,
			hairImage4PositionLeft: undefined as string | undefined,
			hairImage4Object: {} as any, // eslint-disable-line
			hasMouthSpecial0: false as boolean,
			hasMouthSpecial1: false as boolean,
			hasPupil: false as boolean,
			hasPupilSpecial0: false as boolean,
			hasTailSpecial0: false as boolean,
			hasFur: false as boolean,
			hasHairImage1: false as boolean,
			hasHairImage2: false as boolean,
			hasHairImage3: false as boolean,
			hasHairImage4: false as boolean,
			hasFrontRightLegInjury2: false as boolean,
			hasTailInjury: false as boolean,
			injuryType: 'minor' as 'minor' | 'heavy',
			isSpecial: false as boolean,
			hasInjury: false as boolean,
			element0: 0 as number,
			element1: 1 as number,
			element2: 2 as number
		};
	},
	computed: {
		dinozHead(): string {
			return defineAsyncComponent(() => import(`./head/${this.headNumber}.vue`));
		},
		headInjury1(): string {
			return defineAsyncComponent(() => import(`./head/injury/${this.injuryType}/${this.headInjury1ImgNumber}.vue`));
		},
		headInjury2(): string {
			return defineAsyncComponent(() => import(`./head/injury/${this.injuryType}/${this.headInjury2ImgNumber}.vue`));
		},
		headInjury3(): string {
			return defineAsyncComponent(() => import(`./head/injury/${this.injuryType}/${this.headInjury3ImgNumber}.vue`));
		},
		headInjury4(): string {
			return defineAsyncComponent(() => import(`./head/injury/${this.injuryType}/${this.headInjury4ImgNumber}.vue`));
		},
		headInjury5(): string {
			return defineAsyncComponent(() => import(`./head/injury/${this.injuryType}/${this.headInjury5ImgNumber}.vue`));
		},
		headInjury6(): string {
			return defineAsyncComponent(() => import(`./head/injury/${this.injuryType}/${this.headInjury6ImgNumber}.vue`));
		},
		headInjury7(): string {
			return defineAsyncComponent(() => import(`./head/injury/${this.injuryType}/${this.headInjury7ImgNumber}.vue`));
		},
		headSpecial(): string {
			return defineAsyncComponent(() => import(`./head/special/${this.element0}.vue`));
		},
		eyebrow(): string {
			return defineAsyncComponent(() => import(`./eye/eyebrow/${this.eye.eyebrow.imgNumber}.vue`));
		},
		sclera(): string {
			return defineAsyncComponent(
				() => import(`./eye/sclera/${this.childOrAdultOrDemon}/${this.eye.sclera[this.normalOrDemon!].imgNumber}.vue`)
			);
		},
		pupil(): string {
			return defineAsyncComponent(() => import(`./eye/pupil/${this.childOrAdult}/${this.eye.pupil.imgNumber}.vue`));
		},
		pupilSpecial0(): string {
			return defineAsyncComponent(
				() =>
					import(
						`./eye/pupil/special/${this.normalOrDemon}/${
							this.eye.pupil.dependentImage0[this.normalOrDemon!].imgNumber
						}.vue`
					)
			);
		},
		dinozMouth(): string {
			return defineAsyncComponent(() => import(`./mouth/${this.mouth.imgNumber}.vue`));
		},
		mouthSpecial0(): string {
			return defineAsyncComponent(() => import(`./mouth/${this.mouthSpecial0Object.imgNumber}.vue`));
		},
		mouthSpecial1(): string {
			return defineAsyncComponent(() => import(`./mouth/${this.mouth.dependentImage1.imgNumber}.vue`));
		},
		frontLeftLeg(): string {
			return defineAsyncComponent(() => import(`./leg/front/left/${this.element0}.vue`));
		},
		frontLeftNails(): string {
			return defineAsyncComponent(() => import(`./leg/front/left/nail/${this.element0}.vue`));
		},
		frontLeftLegSpecial(): string {
			return defineAsyncComponent(() => import(`./leg/front/left/special/${this.element0}.vue`));
		},
		chest(): string {
			return defineAsyncComponent(() => import(`./body/${this.element0}.vue`));
		},
		chestSpecial0(): string {
			return defineAsyncComponent(() => import(`./body/special/${this.element0}.vue`));
		},
		frontRightLeg(): string {
			return defineAsyncComponent(() => import(`./leg/front/right/${this.element0}.vue`));
		},
		frontRightNail(): string {
			return defineAsyncComponent(() => import(`./leg/front/right/nail/${this.element0}.vue`));
		},
		frontRightLegSpecial(): string {
			return defineAsyncComponent(() => import(`./leg/front/right/special/${this.element0}.vue`));
		},
		backRightLeg(): string {
			return defineAsyncComponent(() => import(`./leg/back/right/${this.element0}.vue`));
		},
		backRightNail(): string {
			return defineAsyncComponent(() => import(`./leg/back/right/nail/${this.element0}.vue`));
		},
		backRightLegSpecial(): string {
			return defineAsyncComponent(() => import(`./leg/back/right/special/${this.element0}.vue`));
		},
		legInjury1(): string {
			return defineAsyncComponent(() => import(`./leg/front/right/injury/${this.injuryType}/0.vue`));
		},
		legInjury2(): string {
			return defineAsyncComponent(() => import(`./leg/front/right/injury/${this.injuryType}/1.vue`));
		},
		dinozTail(): string {
			return defineAsyncComponent(() => import(`./tail/${this.tail.imgNumber}.vue`));
		},
		dinozTailSpecial(): string {
			return defineAsyncComponent(() => import(`./tail/${this.tail.dependentImage0.imgNumber}.vue`));
		},
		tailInjury1(): string {
			return defineAsyncComponent(() => import(`./tail/injury/heavy/${this.element0}.vue`));
		},
		furBackRightLeg(): string {
			return defineAsyncComponent(() => import(`./leg/back/right/fur/${this.element0}.vue`));
		},
		furFrontRightLeg(): string {
			return defineAsyncComponent(() => import(`./leg/front/right/fur/${this.element1}.vue`));
		},
		furFrontLeftLeg(): string {
			return defineAsyncComponent(() => import(`./leg/front/left/fur/${this.element2}.vue`));
		},
		hairImage1(): string {
			return defineAsyncComponent(() => import(`./hair/${this.hairImage1Object.imgNumber}.vue`));
		},
		hairImage2(): string {
			return defineAsyncComponent(() => import(`./hair/${this.hairImage2Object.imgNumber}.vue`));
		},
		hairImage3(): string {
			return defineAsyncComponent(() => import(`./hair/${this.hairImage3Object.imgNumber}.vue`));
		},
		hairImage4(): string {
			return defineAsyncComponent(() => import(`./hair/${this.hairImage4Object.imgNumber}.vue`));
		}
	},
	methods: {
		getColor(babyColor: string, adultColor: string, size: number): string {
			let result = '#';
			let rgbResult: number;

			const babyColorParsed: Array<number> = babyColor.match(/\w./g)!.map(res => parseInt(res, 16));
			const adultColorParsed: Array<number> = adultColor.match(/\w./g)!.map(res => parseInt(res, 16));

			for (let i = 0; i < 3; i++) {
				if (babyColorParsed[i] < adultColorParsed[i]) {
					rgbResult = Math.round(((adultColorParsed[i] - babyColorParsed[i]) / 9) * size + babyColorParsed[i]);
					result += rgbResult.toString(16).padStart(2, '0');
				} else {
					rgbResult = Math.round(((babyColorParsed[i] - adultColorParsed[i]) / 9) * (9 - size) + adultColorParsed[i]);
					result += rgbResult.toString(16).padStart(2, '0');
				}
			}

			return result;
		},
		/**
		 * Retourne la couleur dans le cas où le pigmou est rare (lettre 14 différente de 0)
		 * La couleur spéciale est dépendante de la couleur du corps et de la couleur de la queue.
		 * On récupère donc une valeur qui est soit 0, soit 1 en fonction d'une couleur de corps
		 * ou de queue qui peut aller de 0 à F.
		 */
		getSpecialColorNumber(letterWanted: string): string {
			const letters = '0123456789ABCDEF';
			const colorIndex: number = letters.indexOf(letterWanted);
			return (colorIndex % 2).toString();
		}
	},
	mounted(): void {
		const head = pigmou.head;
		const body = pigmou.body;
		const tail = pigmou.tail;
		this.eye = pigmou.head.eye[parseInt(this.display[2])];
		this.mouth = pigmou.head.mouth[parseInt(this.display[3])];
		this.tail = pigmou.tail.tail[parseInt(this.display[4])];
		this.hasFur = this.display[5] === '1';
		this.hair = pigmou.hair[this.display[6]];
		this.headNumber = this.display[6] === 'C' ? 1 : 0;
		this.isSpecial = this.display[14] !== '0';

		const sizeLetter = this.display[1] === 'A' ? 9 : parseInt(this.display[1]);
		this.childOrAdult = this.display[1] === '9' ? 'adult' : 'baby';
		this.normalOrDemon = this.display[1] === 'A' ? 'demon' : 'normal';
		this.childOrAdultOrDemon = this.display[1] === 'A' ? 'demon' : this.childOrAdult;

		let mainColorData;
		let tailColor;
		let hairColor;

		if (this.normalOrDemon === 'normal') {
			mainColorData =
				this.display[13] === '0'
					? pigmou.color.body[this.display[9]].normal
					: pigmou.color.body[this.getSpecialColorNumber(this.display[9])].special!.normal;
			tailColor =
				this.display[13] === '0'
					? pigmou.color.tail[this.display[10]].normal
					: pigmou.color.tail[this.getSpecialColorNumber(this.display[10])].special!.normal;
			hairColor =
				this.display[13] === '0'
					? pigmou.color.hair[this.display[11]].normal
					: pigmou.color.hair[this.getSpecialColorNumber(this.display[11])].special!.normal;
		} else {
			mainColorData =
				this.display[13] === '0'
					? pigmou.color.body[this.display[9]].demon
					: pigmou.color.body[this.getSpecialColorNumber(this.display[9])].special!.demon;
			tailColor =
				this.display[13] === '0'
					? pigmou.color.tail[this.display[10]].demon
					: pigmou.color.tail[this.getSpecialColorNumber(this.display[10])].special!.demon;
			hairColor =
				this.display[13] === '0'
					? pigmou.color.hair[this.display[11]].demon
					: pigmou.color.hair[this.getSpecialColorNumber(this.display[11])].special!.demon;
		}

		if (this.life < 20) {
			this.injuryType = 'heavy';
			this.hasInjury = true;
		} else if (this.life < 50) {
			this.injuryType = 'minor';
			this.hasInjury = true;
		}

		const taille = parseInt(this.display[1] === 'A' ? '9' : this.display[1]);

		this.tailSize = this.normalOrDemon === 'demon' ? 1.2 : (0.4 / 9) * taille + 0.6;

		this.size = (1 / 36) * parseInt(this.display[1] === 'A' ? '9' : this.display[1]) + 0.95;

		// Head
		this.headDefaultPositionTop = `${head.position[this.headNumber].top * this.size}px`;
		this.headDefaultPositionLeft = `${head.position[this.headNumber].left * this.size}px`;

		if (this.isSpecial) {
			this.headSpecial0PositionTop = `${head.special.top * this.size}px`;
			this.headSpecial0PositionLeft = `${head.special.left * this.size}px`;
		}

		// Eyes
		this.eyebrowPositionTop = `${this.eye.eyebrow.top * this.size}px`;
		this.eyebrowPositionLeft = `${this.eye.eyebrow.left * this.size}px`;

		this.eyePositionTop = `${this.eye.sclera[this.normalOrDemon].top * this.size}px`;
		this.eyePositionLeft = `${this.eye.sclera[this.normalOrDemon].left * this.size}px`;

		this.hasPupil = this.eye.pupil !== undefined && this.eye.pupil[this.childOrAdultOrDemon] !== undefined;

		if (this.hasPupil) {
			this.pupilPositionTop = `${this.eye.pupil[this.childOrAdultOrDemon].top * this.size}px`;
			this.pupilPositionLeft = `${this.eye.pupil[this.childOrAdultOrDemon].left * this.size}px`;
		}

		this.hasPupilSpecial0 =
			this.eye.pupil?.dependentImage0 !== undefined &&
			this.eye.pupil?.dependentImage0[this.normalOrDemon] !== undefined;

		if (this.hasPupilSpecial0) {
			this.pupilSpecialPositionTop = `${this.eye.pupil.dependentImage0[this.normalOrDemon].top * this.size}px`;
			this.pupilSpecialPositionLeft = `${this.eye.pupil.dependentImage0[this.normalOrDemon].left * this.size}px`;
		}

		// Mouth
		this.mouthPositionTop = `${this.mouth.top * this.size}px`;
		this.mouthPositionLeft = `${this.mouth.left * this.size}px`;

		this.hasMouthSpecial0 = this.mouth.dependentImage0 !== undefined;
		this.hasMouthSpecial1 = this.mouth.dependentImage1 !== undefined;

		// Mouth special (beard or teeth)
		if (this.hasMouthSpecial0) {
			// If the dinoz is a demon, try to catch the demon specific image. Il no image is found, it means that
			// the demon dinoz doesn't have any specificity compare to normal dinoz. Then get normal dinoz image.
			this.mouthSpecial0Object =
				this.normalOrDemon === 'demon'
					? this.mouth.dependentImage0[this.normalOrDemon]
						? this.mouth.dependentImage0.demon
						: this.mouth.dependentImage0.normal
					: this.mouth.dependentImage0.normal;

			this.mouthSpecial0PositionTop = `${this.mouthSpecial0Object.top * this.size}px`;
			this.mouthSpecial0PositionLeft = `${this.mouthSpecial0Object.left * this.size}px`;

			if (this.mouthSpecial0Object.imgSize) {
				this.mouthSpecial0Size = this.mouthSpecial0Object.imgSize;
			}

			if (this.mouthSpecial0Object.imgZIndex) {
				this.mouthSpecial0ZIndex = this.mouthSpecial0Object.imgZIndex;
			}

			if (this.hasMouthSpecial1) {
				this.mouthSpecial1PositionTop = `${this.mouth.dependentImage1.top * this.size}px`;
				this.mouthSpecial1PositionLeft = `${this.mouth.dependentImage1.left * this.size}px`;
			}
		}

		//// Body
		this.bodyDefaultPositionTop = `${body.default.top * this.size}px`;
		this.bodyDefaultPositionLeft = `${body.default.left * this.size}px`;

		// Front left leg
		if (this.normalOrDemon === 'demon') {
			this.frontLeftLegSize = body.leg.front.left.demon.imgSize;

			this.frontLeftLegPositionTop = `${body.leg.front.left.demon.position.top * this.size}px`;
			this.frontLeftLegPositionLeft = `${body.leg.front.left.demon.position.left * this.size}px`;

			this.frontLeftLegNailsPositionTop = `${body.leg.front.left.demon.nail.top * this.size}px`;
			this.frontLeftLegNailsPositionLeft = `${body.leg.front.left.demon.nail.left * this.size}px`;

			this.furFrontLeftLegPositionTop = `${body.leg.front.left.demon.fur.top * this.size}px`;
			this.furFrontLeftLegPositionLeft = `${body.leg.front.left.demon.fur.left * this.size}px`;

			if (this.isSpecial) {
				this.frontLeftLegSpecialPositionTop = `${body.leg.front.left.demon.special.top * this.size}px`;
				this.frontLeftLegSpecialPositionLeft = `${body.leg.front.left.demon.special.left * this.size}px`;
			}
		} else {
			this.frontLeftLegSize =
				((body.leg.front.left.adult.imgSize - body.leg.front.left.baby.imgSize) / 9) * taille +
				body.leg.front.left.baby.imgSize;

			this.frontLeftLegPositionTop = `${
				(((body.leg.front.left.adult.position.top - body.leg.front.left.baby.position.top) / 9) * taille +
					body.leg.front.left.baby.position.top) *
				this.size
			}px`;
			this.frontLeftLegPositionLeft = `${
				(((body.leg.front.left.adult.position.left - body.leg.front.left.baby.position.left) / 9) * taille +
					body.leg.front.left.baby.position.left) *
				this.size
			}px`;

			this.frontLeftLegNailsPositionTop = `${
				(((body.leg.front.left.adult.nail.top - body.leg.front.left.baby.nail.top) / 9) * taille +
					body.leg.front.left.baby.nail.top) *
				this.size
			}px`;
			this.frontLeftLegNailsPositionLeft = `${
				(((body.leg.front.left.adult.nail.left - body.leg.front.left.baby.nail.left) / 9) * taille +
					body.leg.front.left.baby.nail.left) *
				this.size
			}px`;

			this.furFrontLeftLegPositionTop = `${
				(((body.leg.front.left.adult.fur.top - body.leg.front.left.baby.fur.top) / 9) * taille +
					body.leg.front.left.baby.fur.top) *
				this.size
			}px`;
			this.furFrontLeftLegPositionLeft = `${
				(((body.leg.front.left.adult.fur.left - body.leg.front.left.baby.fur.left) / 9) * taille +
					body.leg.front.left.baby.fur.left) *
				this.size
			}px`;

			if (this.isSpecial) {
				this.frontLeftLegSpecialPositionTop = `${
					(((body.leg.front.left.adult.special.top - body.leg.front.left.baby.special.top) / 9) * taille +
						body.leg.front.left.baby.special.top) *
					this.size
				}px`;
				this.frontLeftLegSpecialPositionLeft = `${
					(((body.leg.front.left.adult.special.left - body.leg.front.left.baby.special.left) / 9) * taille +
						body.leg.front.left.baby.special.left) *
					this.size
				}px`;
			}
		}

		// Chest
		this.chestPositionTop = `${body.chest[this.childOrAdultOrDemon].top * this.size}px`;
		this.chestPositionLeft = `${body.chest[this.childOrAdultOrDemon].left * this.size}px`;
		this.chestSize = body.chest[this.childOrAdultOrDemon].imgSize;

		if (this.isSpecial) {
			if (this.normalOrDemon === 'demon') {
				this.chestSpecialPositonTop = `${body.chest.demon.special.top * this.size}px`;
				this.chestSpecialPositonLeft = `${body.chest.demon.special.left * this.size}px`;
			} else {
				this.chestSpecialPositonTop = `${
					(((body.chest.adult.special.top - body.chest.baby.special.top) / 9) * taille + body.chest.baby.special.top) *
					this.size
				}px`;
				this.chestSpecialPositonLeft = `${
					(((body.chest.adult.special.left - body.chest.baby.special.left) / 9) * taille +
						body.chest.baby.special.left) *
					this.size
				}px`;
			}
		}

		// Front right leg
		if (this.normalOrDemon === 'demon') {
			this.frontRightLegSize = body.leg.front.right.demon.imgSize;

			this.frontRightLegPositionTop = `${body.leg.front.right.demon.top * this.size}px`;
			this.frontRightLegPositionLeft = `${body.leg.front.right.demon.left * this.size}px`;

			this.frontRightNailsPositionTop = `${body.leg.front.right.demon.nail.top * this.size}px`;
			this.frontRightNailsPositionLeft = `${body.leg.front.right.demon.nail.left * this.size}px`;

			this.furFrontRightLegPositionTop = `${body.leg.front.right.demon.fur.top * this.size}px`;
			this.furFrontRightLegPositionLeft = `${body.leg.front.right.demon.fur.left * this.size}px`;

			if (this.isSpecial) {
				this.frontRightLegSpecialPositionTop = `${body.leg.front.right.demon.special.top * this.size}px`;
				this.frontRightLegSpecialPositionLeft = `${body.leg.front.right.demon.special.left * this.size}px`;
			}
		} else {
			this.frontRightLegSize =
				((body.leg.front.right.adult.imgSize - body.leg.front.right.baby.imgSize) / 9) * taille +
				body.leg.front.right.baby.imgSize;

			this.frontRightLegPositionTop = `${
				(((body.leg.front.right.adult.top - body.leg.front.right.baby.top) / 9) * taille +
					body.leg.front.right.baby.top) *
				this.size
			}px`;
			this.frontRightLegPositionLeft = `${
				(((body.leg.front.right.adult.left - body.leg.front.right.baby.left) / 9) * taille +
					body.leg.front.right.baby.left) *
				this.size
			}px`;

			this.frontRightNailsPositionTop = `${
				(((body.leg.front.right.adult.nail.top - body.leg.front.right.baby.nail.top) / 9) * taille +
					body.leg.front.right.baby.nail.top) *
				this.size
			}px`;
			this.frontRightNailsPositionLeft = `${
				(((body.leg.front.right.adult.nail.left - body.leg.front.right.baby.nail.left) / 9) * taille +
					body.leg.front.right.baby.nail.left) *
				this.size
			}px`;

			this.furFrontRightLegPositionTop = `${
				(((body.leg.front.right.adult.fur.top - body.leg.front.right.baby.fur.top) / 9) * taille +
					body.leg.front.right.baby.fur.top) *
				this.size
			}px`;
			this.furFrontRightLegPositionLeft = `${
				(((body.leg.front.right.adult.fur.left - body.leg.front.right.baby.fur.left) / 9) * taille +
					body.leg.front.right.baby.fur.left) *
				this.size
			}px`;

			if (this.isSpecial) {
				this.frontRightLegSpecialPositionTop = `${
					(((body.leg.front.right.adult.special.top - body.leg.front.right.baby.special.top) / 9) * taille +
						body.leg.front.right.baby.special.top) *
					this.size
				}px`;
				this.frontRightLegSpecialPositionLeft = `${
					(((body.leg.front.right.adult.special.left - body.leg.front.right.baby.special.left) / 9) * taille +
						body.leg.front.right.baby.special.left) *
					this.size
				}px`;
			}
		}

		// Back right leg
		if (this.normalOrDemon === 'demon') {
			this.backRightLegSize = body.leg.back.right.demon.imgSize;

			this.backRightLegPositionTop = `${body.leg.back.right.demon.top * this.size}px`;
			this.backRightLegPositionLeft = `${body.leg.back.right.demon.left * this.size}px`;

			this.backRightNailsPositionTop = `${body.leg.back.right.demon.nail.top * this.size}px`;
			this.backRightNailsPositionLeft = `${body.leg.back.right.demon.nail.left * this.size}px`;

			this.furBackRightLegPositionTop = `${body.leg.back.right.demon.fur.top * this.size}px`;
			this.furBackRightLegPositionLeft = `${body.leg.back.right.demon.fur.left * this.size}px`;

			if (this.isSpecial) {
				this.backRightLegSpecialPositionTop = `${body.leg.back.right.demon.special.top * this.size}px`;
				this.backRightLegSpecialPositionLeft = `${body.leg.back.right.demon.special.left * this.size}px`;
			}
		} else {
			this.backRightLegSize =
				((body.leg.back.right.adult.imgSize - body.leg.back.right.baby.imgSize) / 9) * taille +
				body.leg.back.right.baby.imgSize;

			this.backRightLegPositionTop = `${
				(((body.leg.back.right.adult.top - body.leg.back.right.baby.top) / 9) * taille + body.leg.back.right.baby.top) *
				this.size
			}px`;
			this.backRightLegPositionLeft = `${
				(((body.leg.back.right.adult.left - body.leg.back.right.baby.left) / 9) * taille +
					body.leg.back.right.baby.left) *
				this.size
			}px`;

			this.backRightNailsPositionTop = `${
				(((body.leg.back.right.adult.nail.top - body.leg.back.right.baby.nail.top) / 9) * taille +
					body.leg.back.right.baby.nail.top) *
				this.size
			}px`;
			this.backRightNailsPositionLeft = `${
				(((body.leg.back.right.adult.nail.left - body.leg.back.right.baby.nail.left) / 9) * taille +
					body.leg.back.right.baby.nail.left) *
				this.size
			}px`;

			this.furBackRightLegPositionTop = `${
				(((body.leg.back.right.adult.fur.top - body.leg.back.right.baby.fur.top) / 9) * taille +
					body.leg.back.right.baby.fur.top) *
				this.size
			}px`;
			this.furBackRightLegPositionLeft = `${
				(((body.leg.back.right.adult.fur.left - body.leg.back.right.baby.fur.left) / 9) * taille +
					body.leg.back.right.baby.fur.left) *
				this.size
			}px`;

			if (this.isSpecial) {
				this.backRightLegSpecialPositionTop = `${
					(((body.leg.back.right.adult.special.top - body.leg.back.right.baby.special.top) / 9) * taille +
						body.leg.back.right.baby.special.top) *
					this.size
				}px`;
				this.backRightLegSpecialPositionLeft = `${
					(((body.leg.back.right.adult.special.left - body.leg.back.right.baby.special.left) / 9) * taille +
						body.leg.back.right.baby.special.left) *
					this.size
				}px`;
			}
		}

		// Tail
		this.tailDefaultPositionTop = `${tail.defaultPosition.top * this.size}px`;
		this.tailDefaultPositionLeft = `${tail.defaultPosition.left * this.size}px`;

		if (this.normalOrDemon === 'demon') {
			this.tailPositionTop = `${this.tail.demon.top * this.size}px`;
			this.tailPositionLeft = `${this.tail.demon.left * this.size}px`;
		} else {
			this.tailPositionTop = `${((this.tail.adult.top - this.tail.baby.top) / 9) * taille + this.tail.baby.top}px`;
			this.tailPositionLeft = `${((this.tail.adult.left - this.tail.baby.left) / 9) * taille + this.tail.baby.left}px`;
		}

		this.hasTailSpecial0 = this.tail.dependentImage0 !== undefined;

		if (this.hasTailSpecial0) {
			if (this.normalOrDemon === 'demon') {
				this.tailSpecial0PositionTop = `${this.tail.dependentImage0.demon.top * this.size}px`;
				this.tailSpecial0PositionLeft = `${this.tail.dependentImage0.demon.left * this.size}px`;
			} else {
				this.tailSpecial0PositionTop = `${
					(((this.tail.dependentImage0.adult.top - this.tail.dependentImage0.baby.top) / 9) * taille +
						this.tail.dependentImage0.baby.top) *
					this.size
				}px`;
				this.tailSpecial0PositionLeft = `${
					(((this.tail.dependentImage0.adult.left - this.tail.dependentImage0.baby.left) / 9) * taille +
						this.tail.dependentImage0.baby.left) *
					this.size
				}px`;
			}
		}

		this.hasTailInjury = this.tail.baby.injury !== undefined;

		if (this.hasTailInjury) {
			if (this.normalOrDemon === 'demon') {
				this.tailInjury1PositionTop = `${this.tail.demon.injury.heavy.top * this.size}px`;
				this.tailInjury1PositionLeft = `${this.tail.demon.injury.heavy.left * this.size}px`;
				this.injuryTailSize = this.tail.demon.injury.heavy.size;
			} else {
				this.tailInjury1PositionTop = `${
					(((this.tail.adult.injury.heavy.top - this.tail.baby.injury.heavy.top) / 9) * taille +
						this.tail.baby.injury.heavy.top) *
					this.size
				}px`;
				this.tailInjury1PositionLeft = `${
					(((this.tail.adult.injury.heavy.left - this.tail.baby.injury.heavy.left) / 9) * taille +
						this.tail.baby.injury.heavy.left) *
					this.size
				}px`;
				this.injuryTailSize = this.tail[this.childOrAdult].injury.heavy.size;
			}
		}

		// Hair
		this.hasHairImage1 =
			this.hair.image1 &&
			(this.hair.image1[this.childOrAdultOrDemon] !== undefined || this.hair.image1.imgNumber !== undefined);

		if (this.hasHairImage1) {
			this.hairImage1Object = this.hair.image1[this.childOrAdultOrDemon] ?? this.hair.image1;

			this.hairImage1PositionTop = `${this.hairImage1Object.top * this.size}px`;
			this.hairImage1PositionLeft = `${this.hairImage1Object.left * this.size}px`;
			this.hairImage1ZIndex = this.hairImage1Object.zIndex;

			this.hasHairImage2 =
				this.hair.image2 &&
				(this.hair.image2[this.childOrAdultOrDemon] !== undefined || this.hair.image2.imgNumber !== undefined);

			if (this.hasHairImage2) {
				this.hairImage2Object = this.hair.image2[this.childOrAdultOrDemon] ?? this.hair.image2;

				this.hairImage2PositionTop = `${this.hairImage2Object.top * this.size}px`;
				this.hairImage2PositionLeft = `${this.hairImage2Object.left * this.size}px`;
				this.hairImage2ZIndex = this.hairImage2Object.zIndex;

				this.hasHairImage3 =
					this.hair.image3 &&
					(this.hair.image3[this.childOrAdultOrDemon] !== undefined || this.hair.image3.imgNumber !== undefined);

				if (this.hasHairImage3) {
					this.hairImage3Object = this.hair.image3[this.childOrAdultOrDemon] ?? this.hair.image3;

					this.hairImage3PositionTop = `${this.hairImage3Object.top * this.size}px`;
					this.hairImage3PositionLeft = `${this.hairImage3Object.left * this.size}px`;

					this.hasHairImage4 =
						this.hair.image4 &&
						(this.hair.image4[this.childOrAdultOrDemon] !== undefined || this.hair.image4.imgNumber !== undefined);

					if (this.hasHairImage4) {
						this.hairImage4Object = this.hair.image4[this.childOrAdultOrDemon] ?? this.hair.image4;

						this.hairImage4PositionTop = `${this.hairImage4Object.top * this.size}px`;
						this.hairImage4PositionLeft = `${this.hairImage4Object.left * this.size}px`;
					}
				}
			}
		}

		// Injuries
		if (this.hasInjury) {
			if (this.injuryType === 'minor') {
				this.headInjury1PositionTop = `${head.injury.minor[0].top * this.size}px`;
				this.headInjury1PositionLeft = `${head.injury.minor[0].left * this.size}px`;
				this.headInjury1ImgNumber = head.injury.minor[0].imgNumber;

				this.headInjury2PositionTop = `${head.injury.minor[1].top * this.size}px`;
				this.headInjury2PositionLeft = `${head.injury.minor[1].left * this.size}px`;
				this.headInjury2ImgNumber = head.injury.minor[1].imgNumber;

				this.headInjury3PositionTop = `${head.injury.minor[2].top * this.size}px`;
				this.headInjury3PositionLeft = `${head.injury.minor[2].left * this.size}px`;
				this.headInjury3ImgNumber = head.injury.minor[2].imgNumber;

				this.headInjury4PositionTop = `${head.injury.minor[3].top * this.size}px`;
				this.headInjury4PositionLeft = `${head.injury.minor[3].left * this.size}px`;
				this.headInjury4ImgNumber = head.injury.minor[3].imgNumber;

				this.headInjury5PositionTop = `${head.injury.minor[4].top * this.size}px`;
				this.headInjury5PositionLeft = `${head.injury.minor[4].left * this.size}px`;
				this.headInjury5ImgNumber = head.injury.minor[4].imgNumber;
				this.headInjury5ImgRotation = `${head.injury.minor[4].rotation}deg`;

				this.headInjury6PositionTop = `${head.injury.minor[5].top * this.size}px`;
				this.headInjury6PositionLeft = `${head.injury.minor[5].left * this.size}px`;
				this.headInjury6ImgNumber = head.injury.minor[5].imgNumber;

				this.frontRightLegInjury1PositionTop = `${
					body.leg.front.right.adult.injury[this.injuryType].top * this.size
				}px`;
				this.frontRightLegInjury1PositionLeft = `${
					body.leg.front.right.adult.injury[this.injuryType].left * this.size
				}px`;
			} else {
				this.headInjury1PositionTop = `${this.eye.injury.heavy[0].top * this.size}px`;
				this.headInjury1PositionLeft = `${this.eye.injury.heavy[0].left * this.size}px`;
				this.headInjury1ImgNumber = this.eye.injury.heavy[0].imgNumber;

				this.headInjury2PositionTop = `${this.eye.injury.heavy[1].top * this.size}px`;
				this.headInjury2PositionLeft = `${this.eye.injury.heavy[1].left * this.size}px`;
				this.headInjury2ImgNumber = this.eye.injury.heavy[1].imgNumber;

				this.headInjury3PositionTop = `${this.eye.injury.heavy[2].top * this.size}px`;
				this.headInjury3PositionLeft = `${this.eye.injury.heavy[2].left * this.size}px`;
				this.headInjury3ImgNumber = this.eye.injury.heavy[2].imgNumber;
				this.headInjury3ZIndex = this.eye.injury.heavy[2].zIndex;

				this.headInjury4PositionTop = `${this.eye.injury.heavy[3].top * this.size}px`;
				this.headInjury4PositionLeft = `${this.eye.injury.heavy[3].left * this.size}px`;
				this.headInjury4ImgNumber = this.eye.injury.heavy[3].imgNumber;

				this.headInjury5PositionTop = `${this.eye.injury.heavy[4].top * this.size}px`;
				this.headInjury5PositionLeft = `${this.eye.injury.heavy[4].left * this.size}px`;
				this.headInjury5ImgNumber = this.eye.injury.heavy[4].imgNumber;
				this.headInjury5ImgRotation = `${this.eye.injury.heavy[4].rotation}deg`;

				this.headInjury6PositionTop = `${this.eye.injury.heavy[5].top * this.size}px`;
				this.headInjury6PositionLeft = `${this.eye.injury.heavy[5].left * this.size}px`;
				this.headInjury6ImgNumber = this.eye.injury.heavy[5].imgNumber;

				this.headInjury7PositionTop = `${this.eye.injury.heavy[6].top * this.size}px`;
				this.headInjury7PositionLeft = `${this.eye.injury.heavy[6].left * this.size}px`;
				this.headInjury7ImgNumber = this.eye.injury.heavy[6].imgNumber;

				this.frontRightLegInjury1PositionTop = `${
					body.leg.front.right[this.childOrAdultOrDemon].injury[this.injuryType][0].top * this.size
				}px`;
				this.frontRightLegInjury1PositionLeft = `${
					body.leg.front.right[this.childOrAdultOrDemon].injury[this.injuryType][0].left * this.size
				}px`;

				this.hasFrontRightLegInjury2 =
					body.leg.front.right[this.childOrAdultOrDemon].injury[this.injuryType][1] !== undefined;

				if (this.hasFrontRightLegInjury2) {
					this.frontRightLegInjury2PositionTop = `${
						body.leg.front.right[this.childOrAdultOrDemon].injury[this.injuryType][1].top * this.size
					}px`;
					this.frontRightLegInjury2PositionLeft = `${
						body.leg.front.right[this.childOrAdultOrDemon].injury[this.injuryType][1].left * this.size
					}px`;
				}
			}
		}

		//// Colors

		// Body
		if (this.normalOrDemon === 'normal') {
			this.mainFirstColor = this.getColor(
				mainColorData.baby.mainFirstColor,
				mainColorData.adult.mainFirstColor,
				sizeLetter
			);
			this.mainSecondColor = this.getColor(
				mainColorData.baby.mainSecondColor,
				mainColorData.adult.mainSecondColor,
				sizeLetter
			);
			this.mainThirdColor = this.getColor(
				mainColorData.baby.mainThirdColor,
				mainColorData.adult.mainThirdColor,
				sizeLetter
			);
			this.mainFourthColor = this.getColor(
				mainColorData.baby.mainFourthColor,
				mainColorData.adult.mainFourthColor,
				sizeLetter
			);
			this.mainFifthColor = this.getColor(
				mainColorData.baby.mainFifthColor,
				mainColorData.adult.mainFifthColor,
				sizeLetter
			);
			this.brighterSpecialColor = this.getColor(
				mainColorData.baby.brighterSpecialColor,
				mainColorData.adult.brighterSpecialColor,
				sizeLetter
			);
			this.darkerSpecialColor = this.getColor(
				mainColorData.baby.darkerSpecialColor,
				mainColorData.adult.darkerSpecialColor,
				sizeLetter
			);

			// Tail
			this.tailBorderColor = this.getColor(tailColor.baby.tailBorderColor, tailColor.adult.tailBorderColor, sizeLetter);
			this.tailFirstColor = this.getColor(tailColor.baby.tailFirstColor, tailColor.adult.tailFirstColor, sizeLetter);
			this.tailSecondColor = this.getColor(tailColor.baby.tailSecondColor, tailColor.adult.tailSecondColor, sizeLetter);
			this.tailThirdColor = this.getColor(tailColor.baby.tailThirdColor, tailColor.adult.tailThirdColor, sizeLetter);
			this.tailFourthColor = this.getColor(tailColor.baby.tailFourthColor, tailColor.adult.tailFourthColor, sizeLetter);

			// Hair
			this.hairColor = this.getColor(hairColor.baby.hairColor, hairColor.adult.hairColor, sizeLetter);
		} else {
			this.mainFirstColor = mainColorData.mainFirstColor;
			this.mainSecondColor = mainColorData.mainSecondColor;
			this.mainThirdColor = mainColorData.mainThirdColor;
			this.mainFourthColor = mainColorData.mainFourthColor;
			this.mainFifthColor = mainColorData.mainFifthColor;
			this.brighterSpecialColor = mainColorData.brighterSpecialColor;
			this.darkerSpecialColor = mainColorData.darkerSpecialColor;

			// Tail
			this.tailBorderColor = tailColor.tailBorderColor;
			this.tailFirstColor = tailColor.tailFirstColor;
			this.tailSecondColor = tailColor.tailSecondColor;
			this.tailThirdColor = tailColor.tailThirdColor;
			this.tailFourthColor = tailColor.tailFourthColor;

			// Hair
			this.hairColor = hairColor.hairColor;
		}

		this.isLoading = false;
	}
});
</script>

<style lang="scss" scoped>
.dinoz {
	float: left;
	position: relative;
	top: -5px;
	left: 100px;
	-webkit-transform: scaleX(v-bind(flip));
	transform: scaleX(v-bind(flip));
}

.pigmou_head {
	position: absolute;
	top: 0;
	left: 0;
}

.head {
	position: absolute;
	top: v-bind(headDefaultPositionTop);
	left: v-bind(headDefaultPositionLeft);
	z-index: -1;
}

.eyebrow {
	position: absolute;
	top: v-bind(eyebrowPositionTop);
	left: v-bind(eyebrowPositionLeft);
	z-index: 5;
}

.sclera {
	position: absolute;
	top: v-bind(eyePositionTop);
	left: v-bind(eyePositionLeft);
	z-index: 1;
}

.pupil {
	position: absolute;
	top: v-bind(pupilPositionTop);
	left: v-bind(pupilPositionLeft);
	z-index: 1;
}

.pupil_special_0 {
	position: absolute;
	top: v-bind(pupilSpecialPositionTop);
	left: v-bind(pupilSpecialPositionLeft);
	z-index: 2;
}

.mouth {
	position: absolute;
	top: v-bind(mouthPositionTop);
	left: v-bind(mouthPositionLeft);
	z-index: 5;
}

.mouth_special_0 {
	position: absolute;
	top: v-bind(mouthSpecial0PositionTop);
	left: v-bind(mouthSpecial0PositionLeft);
	z-index: v-bind(mouthSpecial0ZIndex);
}

.mouth_special_1 {
	position: absolute;
	top: v-bind(mouthSpecial1PositionTop);
	left: v-bind(mouthSpecial1PositionLeft);
	z-index: 6;
}

.pigmou_body {
	position: absolute;
	top: v-bind(bodyDefaultPositionTop);
	left: v-bind(bodyDefaultPositionLeft);
}

.front_left_leg {
	position: absolute;
	top: v-bind(frontLeftLegPositionTop);
	left: v-bind(frontLeftLegPositionLeft);
	z-index: -5;
}

.front_left_nails {
	position: absolute;
	top: v-bind(frontLeftLegNailsPositionTop);
	left: v-bind(frontLeftLegNailsPositionLeft);
	z-index: -4;
}

.front_left_leg_special_1 {
	position: absolute;
	top: v-bind(frontLeftLegSpecialPositionTop);
	left: v-bind(frontLeftLegSpecialPositionLeft);
	z-index: -3;
}

.fur_front_left_leg {
	position: absolute;
	top: v-bind(furFrontLeftLegPositionTop);
	left: v-bind(furFrontLeftLegPositionLeft);
	z-index: -3;
}

.chest {
	position: absolute;
	top: v-bind(chestPositionTop);
	left: v-bind(chestPositionLeft);
	z-index: -3;
}

.chest_special_0 {
	position: absolute;
	top: v-bind(chestSpecialPositonTop);
	left: v-bind(chestSpecialPositonLeft);
	z-index: -3;
}

.front_right_leg {
	position: absolute;
	top: v-bind(frontRightLegPositionTop);
	left: v-bind(frontRightLegPositionLeft);
	z-index: -2;
}

.front_right_nail {
	position: absolute;
	top: v-bind(frontRightNailsPositionTop);
	left: v-bind(frontRightNailsPositionLeft);
	z-index: -2;
}

.front_right_leg_special_1 {
	position: absolute;
	top: v-bind(frontRightLegSpecialPositionTop);
	left: v-bind(frontRightLegSpecialPositionLeft);
	z-index: -2;
}

.fur_front_right_leg {
	position: absolute;
	top: v-bind(furFrontRightLegPositionTop);
	left: v-bind(furFrontRightLegPositionLeft);
	z-index: -2;
}

.back_right_leg {
	position: absolute;
	top: v-bind(backRightLegPositionTop);
	left: v-bind(backRightLegPositionLeft);
	z-index: -3;
}

.back_right_nail {
	position: absolute;
	top: v-bind(backRightNailsPositionTop);
	left: v-bind(backRightNailsPositionLeft);
	z-index: -3;
}

.back_right_leg_special_1 {
	position: absolute;
	top: v-bind(backRightLegSpecialPositionTop);
	left: v-bind(backRightLegSpecialPositionLeft);
	z-index: -3;
}

.fur_back_right_leg {
	position: absolute;
	top: v-bind(furBackRightLegPositionTop);
	left: v-bind(furBackRightLegPositionLeft);
	z-index: -3;
}

.pigmou_tail {
	position: absolute;
	top: v-bind(tailDefaultPositionTop);
	left: v-bind(tailDefaultPositionLeft);
	z-index: -6;
}

.tail {
	position: absolute;
	top: v-bind(tailPositionTop);
	left: v-bind(tailPositionLeft);
	z-index: -3;
}

.tail_special_0 {
	position: absolute;
	top: v-bind(tailSpecial0PositionTop);
	left: v-bind(tailSpecial0PositionLeft);
	z-index: -4;
}

.tail_injury_1 {
	position: absolute;
	top: v-bind(tailInjury1PositionTop);
	left: v-bind(tailInjury1PositionLeft);
}

.hair_image_1 {
	position: absolute;
	top: v-bind(hairImage1PositionTop);
	left: v-bind(hairImage1PositionLeft);
	z-index: v-bind(hairImage1ZIndex);
}

.hair_image_2 {
	position: absolute;
	top: v-bind(hairImage2PositionTop);
	left: v-bind(hairImage2PositionLeft);
	z-index: v-bind(hairImage2ZIndex);
}

.hair_image_3 {
	position: absolute;
	top: v-bind(hairImage3PositionTop);
	left: v-bind(hairImage3PositionLeft);
}

.hair_image_4 {
	position: absolute;
	top: v-bind(hairImage4PositionTop);
	left: v-bind(hairImage4PositionLeft);
}

.head_injury_1 {
	position: absolute;
	top: v-bind(headInjury1PositionTop);
	left: v-bind(headInjury1PositionLeft);
	z-index: 5;
}

.head_injury_2 {
	position: absolute;
	top: v-bind(headInjury2PositionTop);
	left: v-bind(headInjury2PositionLeft);
	z-index: 3;
}

.head_injury_3 {
	position: absolute;
	top: v-bind(headInjury3PositionTop);
	left: v-bind(headInjury3PositionLeft);
	z-index: v-bind(headInjury3ZIndex);
}

.head_injury_4 {
	position: absolute;
	top: v-bind(headInjury4PositionTop);
	left: v-bind(headInjury4PositionLeft);
	z-index: 3;
}

.head_injury_5 {
	position: absolute;
	top: v-bind(headInjury5PositionTop);
	left: v-bind(headInjury5PositionLeft);
	transform: rotate(v-bind(headInjury5ImgRotation));
	z-index: 5;
}

.head_injury_6 {
	position: absolute;
	top: v-bind(headInjury6PositionTop);
	left: v-bind(headInjury6PositionLeft);
	z-index: 3;
}

.head_injury_7 {
	position: absolute;
	top: v-bind(headInjury7PositionTop);
	left: v-bind(headInjury7PositionLeft);
	z-index: 3;
}

.head_special_1 {
	position: absolute;
	top: v-bind(headSpecial0PositionTop);
	left: v-bind(headSpecial0PositionLeft);
	z-index: -1;
}

.leg_injury_1 {
	position: absolute;
	top: v-bind(frontRightLegInjury1PositionTop);
	left: v-bind(frontRightLegInjury1PositionLeft);
	z-index: 3;
}

.leg_injury_2 {
	position: absolute;
	top: v-bind(frontRightLegInjury2PositionTop);
	left: v-bind(frontRightLegInjury2PositionLeft);
	z-index: 3;
}
</style>
