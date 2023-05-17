<template>
	<div class="dinoz" v-if="!isLoading">
		<div class="moueffe_head">
			<component
				:is="dinozHead"
				class="head"
				:id="`${display}-head`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="headSpecial"
				class="head_special"
				:id="`${display}-head_special`"
				v-if="hasHeadSpecial"
				:size="size"
			></component>
			<component
				:is="headSpecial2"
				class="head_special_2"
				:id="`${display}-head_special_2`"
				v-if="hasHeadSpecial2"
				:size="size"
			></component>
			<component
				:is="headInjury"
				class="head_injury"
				:id="`${display}-head_injury`"
				v-if="hasInjury"
				:size="size"
			></component>
			<component :is="eye" class="eye" :size="size"></component>
			<component
				:is="eyeRetina"
				class="eye_retina"
				:id="`${display}-eye_retina`"
				v-if="hasEyeRetina"
				:size="size"
			></component>
			<component
				:is="dinozHair"
				class="hair"
				:id="`${display}-hair`"
				v-if="hasHair"
				:size="size"
				:hairFirstColor="hairFirstColor"
				:hairSecondColor="hairSecondColor"
				:hairThirdColor="hairThirdColor"
				:hairBorderColor="hairBorderColor"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="complementaryHair"
				class="hair_2"
				:id="`${display}-hair_2`"
				v-if="hasComplementaryHair"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
				:hairFirstColor="hairFirstColor"
				:hairSecondColor="hairSecondColor"
				:hairBorderColor="hairBorderColor"
			></component>
			<component
				:is="complementaryHair2"
				class="hair_3"
				:id="`${display}-hair_3`"
				v-if="hasComplementaryHair2"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
				:hairFirstColor="hairFirstColor"
				:hairBorderColor="hairBorderColor"
			></component>
			<component
				:is="headTattoo"
				class="head_tattoo"
				:id="`${display}-head_tattoo`"
				v-if="hasTattoo && hasHeadTattoo"
				:size="size"
				:tattooColor="tattooColor"
			></component>
		</div>

		<div class="moueffe_chest">
			<component
				:is="chestElement1"
				class="chest_element_1"
				:id="`${display}-chest_element_1`"
				:size="size"
				:chestFirstColor="chestFirstColor"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:chestFifthColor="chestFifthColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="chestElement2"
				class="chest_element_2"
				:id="`${display}-chest_element_2`"
				:size="size"
				:chestFirstColor="chestFirstColor"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:chestSecondColor="chestSecondColor"
				:chestThirdColor="chestThirdColor"
				:chestFourthColor="chestFourthColor"
				:chestSeventhColor="chestFourthColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="chestElement3"
				class="chest_element_3"
				:id="`${display}-chest_element_3`"
				v-if="hasChestLastElement"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:chestFourthColor="chestFourthColor"
				:chestFifthColor="chestFifthColor"
				:chestSixthColor="chestSixthColor"
				:chestSeventhColor="chestSeventhColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="chestInjury1"
				class="chest_injury_1"
				:id="`${display}-chest_injury_1`"
				v-if="hasInjury"
				:size="size"
			></component>
			<component
				:is="chestInjury2"
				class="chest_injury_2"
				:id="`${display}-chest_injury_2`"
				v-if="hasInjury"
				:size="size"
			></component>
			<component
				:is="chestInjury3"
				class="chest_injury_3"
				:id="`${display}-chest_injury_3`"
				v-if="hasInjury && hasChestThirdInjury"
				:size="size"
			></component>
			<component
				:is="tail"
				class="tail"
				:id="`${display}-tail`"
				:size="size * tailSize!"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="tailSpecial"
				class="tailSpecial"
				:id="`${display}-tailSpecial`"
				:size="size"
				:chestThirdColor="chestThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="tailHair"
				class="tail_hair"
				:id="`${display}-tail_hair`"
				v-if="hasTailHair"
				:size="size * tailHairSize"
				:hairFirstColor="hairFirstColor"
				:hairBorderColor="hairBorderColor"
			></component>
			<component
				:is="chestTattoo"
				class="chest_tattoo"
				:id="`${display}-chest_tattoo`"
				v-if="hasChestTattoo"
				:size="size"
			></component>
		</div>

		<div class="moueffe_left_arm">
			<component
				:is="leftArm"
				class="left_arm"
				:id="`${display}-left_arm`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="leftArmSpecial0"
				class="left_arm_special"
				:id="`${display}-left_arm_special`"
				v-if="hasArmSpecial"
				:size="size"
			></component>
			<component
				:is="leftArmSpecial1"
				class="left_arm_special_1"
				:id="`${display}-left_arm_special_1`"
				v-if="hasArmSpecial1"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="leftArmSpecial2"
				class="left_arm_special_2"
				:id="`${display}-left_arm_special_2`"
				v-if="hasArmSpecial2"
				:size="size"
			></component>
			<component
				:is="leftArmSpecial4"
				class="left_arm_special_4"
				:id="`${display}-left_arm_special_4`"
				v-if="hasArmSpecial4"
				:size="size"
			></component>
			<component
				:is="leftArmInjury"
				class="left_arm_injury"
				:id="`${display}-left_arm_injury`"
				v-if="hasInjury && hasArmInjury"
				:size="size"
			></component>
		</div>

		<div class="moueffe_right_arm">
			<component
				:is="rightArm"
				class="right_arm"
				:id="`${display}-right_arm`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="rightArmSpecial0"
				class="right_arm_special"
				:id="`${display}-right_arm_special`"
				v-if="hasArmSpecial"
				:size="size"
			></component>
			<component
				:is="rightArmSpecial1"
				class="right_arm_special_1"
				:id="`${display}-right_arm_special_1`"
				v-if="hasArmSpecial1"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="rightArmSpecial2"
				class="right_arm_special_2"
				:id="`${display}-right_arm_special_2`"
				v-if="hasArmSpecial2"
				:size="size"
			></component>
			<component
				:is="rightArmSpecial3"
				class="right_arm_special_3"
				:id="`${display}-right_arm_special_3`"
				v-if="hasArmSpecial3"
				:size="size"
			></component>
			<component
				:is="rightArmSpecial4"
				class="right_arm_special_4"
				:id="`${display}-right_arm_special_4`"
				v-if="hasArmSpecial4"
				:size="size"
			></component>
			<component
				:is="rightArmInjury"
				class="right_arm_injury"
				:id="`${display}-right_arm_injury`"
				v-if="hasInjury && hasArmInjury"
				:size="size"
			></component>
			<component
				:is="armTattoo"
				class="arm_tattoo"
				:id="`${display}-arm_tattoo`"
				v-if="hasArmTattoo"
				:size="size"
				:tattooColor="tattooColor"
			></component>
		</div>

		<div class="moueffe_left_leg">
			<component
				:is="leftLeg"
				class="left_leg"
				:id="`${display}-left_leg`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="leftLegKneeHorn"
				class="left_leg_knee_horn"
				:id="`${display}-left_leg_knee_horn`"
				v-if="hasKnee"
				:size="size"
			></component>
			<component
				:is="leftLegKneeSkin"
				class="left_leg_knee_skin"
				:id="`${display}-left_leg_knee_skin`"
				v-if="hasKnee"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="leftLegInjury1"
				class="left_leg_injury_1"
				:id="`${display}-left_leg_injury_1`"
				v-if="hasInjury"
				:size="size"
			></component>
			<component
				:is="leftLegInjury2"
				class="left_leg_injury_2"
				:id="`${display}-left_leg_injury_2`"
				v-if="hasInjury && hasLegSecondInjury"
				:size="size"
			></component>
			<component :is="leftLegNail" class="left_leg_nail" :id="`${display}-left_leg_nail`" :size="size"></component>
		</div>

		<div class="moueffe_right_leg">
			<component
				:is="rightLeg"
				class="right_leg"
				:id="`${display}-right_leg`"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:mainThirdColor="mainThirdColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="rightLegKneeHorn"
				class="right_leg_knee_horn"
				:id="`${display}-right_leg_knee_horn`"
				v-if="hasKnee"
				:size="size"
			></component>
			<component
				:is="rightLegKneeSkin"
				class="right_leg_knee_skin"
				:id="`${display}-right_leg_knee_skin`"
				v-if="hasKnee"
				:size="size"
				:mainFirstColor="mainFirstColor"
				:mainSecondColor="mainSecondColor"
				:borderColor="borderColor"
			></component>
			<component
				:is="rightLegInjury1"
				class="right_leg_injury_1"
				:id="`${display}-right_leg_injury_1`"
				v-if="hasInjury"
				:size="size"
			></component>
			<component
				:is="rightLegInjury2"
				class="right_leg_injury_2"
				:id="`${display}-right_leg_injury_2`"
				v-if="hasInjury && hasLegSecondInjury"
				:size="size"
			></component>
			<component
				:is="rightLegInjury3"
				class="right_leg_injury_3"
				:id="`${display}-right_leg_injury_3`"
				v-if="hasInjury && hasLegThirdInjury"
				:size="size"
			></component>
			<component :is="rightLegNail" class="right_leg_nail" :id="`${display}-right_leg_nail`" :size="size"></component>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { moueffe } from '../../../constants/index.js';

export default defineComponent({
	name: 'Moueffe',
	props: {
		life: { type: Number, required: true },
		display: { type: String, required: true },
		flip: { type: Number, required: true }
	},
	data() {
		return {
			chestFirstColor: undefined as string | undefined,
			mainFirstColor: undefined as string | undefined,
			mainSecondColor: undefined as string | undefined,
			mainThirdColor: undefined as string | undefined,
			chestSecondColor: undefined as string | undefined,
			chestThirdColor: undefined as string | undefined,
			chestFourthColor: undefined as string | undefined,
			chestFifthColor: undefined as string | undefined,
			chestSixthColor: undefined as string | undefined,
			chestSeventhColor: undefined as string | undefined,
			borderColor: undefined as string | undefined,
			hairFirstColor: undefined as string | undefined,
			hairSecondColor: undefined as string | undefined,
			hairThirdColor: undefined as string | undefined,
			hairBorderColor: undefined as string | undefined,
			tattooColor: undefined as string | undefined,
			head: {} as any, // eslint-disable-line
			chest: {} as any, // eslint-disable-line
			arm: {} as any, // eslint-disable-line
			hairNumber: {} as any, // eslint-disable-line
			leg: {} as any, // eslint-disable-line
			tattoo: {} as any, // eslint-disable-line
			headDefaultPositionTop: undefined as string | undefined,
			headDefaultPositionLeft: undefined as string | undefined,
			headSpecialPositionTop: undefined as string | undefined,
			headSpecialPositionLeft: undefined as string | undefined,
			headSpecialZIndexPosition: undefined as string | undefined,
			headSpecial2PositionTop: undefined as string | undefined,
			headSpecial2PositionLeft: undefined as string | undefined,
			eyePositionTop: undefined as string | undefined,
			eyePositionLeft: undefined as string | undefined,
			eyeRetinaPositionTop: undefined as string | undefined,
			eyeRetinaPositionLeft: undefined as string | undefined,
			chestDefaultPositionTop: undefined as string | undefined,
			chestDefaultPositionLeft: undefined as string | undefined,
			chestElement2PositionTop: undefined as string | undefined,
			chestElement2PositionLeft: undefined as string | undefined,
			chestElement3PositionTop: undefined as string | undefined,
			chestElement3PositionLeft: undefined as string | undefined,
			chestInjury1PositionTop: undefined as string | undefined,
			chestInjury1PositionLeft: undefined as string | undefined,
			chestInjury2PositionTop: undefined as string | undefined,
			chestInjury2PositionLeft: undefined as string | undefined,
			chestInjury3PositionTop: undefined as string | undefined,
			chestInjury3PositionLeft: undefined as string | undefined,
			headInjuryPositionTop: undefined as string | undefined,
			headInjuryPositionLeft: undefined as string | undefined,
			leftArmDefaultPositionTop: undefined as string | undefined,
			leftArmDefaultPositionLeft: undefined as string | undefined,
			leftArmInjuryPositionTop: undefined as string | undefined,
			leftArmInjuryPositionLeft: undefined as string | undefined,
			leftArmSpecialPositionTop: undefined as string | undefined,
			leftArmSpecialPositionLeft: undefined as string | undefined,
			leftArmSpecialPositionZIndex: undefined as string | undefined,
			leftArmSpecial1PositionTop: undefined as string | undefined,
			leftArmSpecial1PositionLeft: undefined as string | undefined,
			leftArmSpecial2PositionTop: undefined as string | undefined,
			leftArmSpecial2PositionLeft: undefined as string | undefined,
			leftArmSpecial4PositionTop: undefined as string | undefined,
			leftArmSpecial4PositionLeft: undefined as string | undefined,
			rightArmDefaultPositionTop: undefined as string | undefined,
			rightArmDefaultPositionLeft: undefined as string | undefined,
			rightArmInjuryPositionTop: undefined as string | undefined,
			rightArmInjuryPositionLeft: undefined as string | undefined,
			rightArmSpecialPositionTop: undefined as string | undefined,
			rightArmSpecialPositionLeft: undefined as string | undefined,
			rightArmSpecial1PositionTop: undefined as string | undefined,
			rightArmSpecial1PositionLeft: undefined as string | undefined,
			rightArmSpecial1ZIndex: undefined as string | undefined,
			rightArmSpecial2PositionTop: undefined as string | undefined,
			rightArmSpecial2PositionLeft: undefined as string | undefined,
			rightArmSpecial3PositionTop: undefined as string | undefined,
			rightArmSpecial3PositionLeft: undefined as string | undefined,
			rightArmSpecial4PositionTop: undefined as string | undefined,
			rightArmSpecial4PositionLeft: undefined as string | undefined,
			leftLegDefaultPositionTop: undefined as string | undefined,
			leftLegDefaultPositionLeft: undefined as string | undefined,
			leftLegKneeHornPositionTop: undefined as string | undefined,
			leftLegKneeHornPositionLeft: undefined as string | undefined,
			leftLegKneeSkinPositionTop: undefined as string | undefined,
			leftLegKneeSkinPositionLeft: undefined as string | undefined,
			leftLegInjury1PositionTop: undefined as string | undefined,
			leftLegInjury1PositionLeft: undefined as string | undefined,
			leftLegInjury2PositionTop: undefined as string | undefined,
			leftLegInjury2PositionLeft: undefined as string | undefined,
			leftLegNailPositionTop: undefined as string | undefined,
			leftLegNailPositionLeft: undefined as string | undefined,
			rightLegDefaultPositionTop: undefined as string | undefined,
			rightLegDefaultPositionLeft: undefined as string | undefined,
			rightLegKneeHornPositionTop: undefined as string | undefined,
			rightLegKneeHornPositionLeft: undefined as string | undefined,
			rightLegKneeSkinPositionTop: undefined as string | undefined,
			rightLegKneeSkinPositionLeft: undefined as string | undefined,
			rightLegInjury1PositionTop: undefined as string | undefined,
			rightLegInjury1PositionLeft: undefined as string | undefined,
			rightLegInjury2PositionTop: undefined as string | undefined,
			rightLegInjury2PositionLeft: undefined as string | undefined,
			rightLegInjury3PositionTop: undefined as string | undefined,
			rightLegInjury3PositionLeft: undefined as string | undefined,
			rightLegNailPositionTop: undefined as string | undefined,
			rightLegNailPositionLeft: undefined as string | undefined,
			tailPositionTop: undefined as string | undefined,
			tailPositionLeft: undefined as string | undefined,
			tailSpecialPositionTop: undefined as string | undefined,
			tailSpecialPositionLeft: undefined as string | undefined,
			hairPositionTop: undefined as string | undefined,
			hairPositionLeft: undefined as string | undefined,
			hairZIndex: undefined as string | undefined,
			hair2PositionTop: undefined as string | undefined,
			hair2PositionLeft: undefined as string | undefined,
			hair3PositionTop: undefined as string | undefined,
			hair3PositionLeft: undefined as string | undefined,
			hair3ZIndex: undefined as string | undefined,
			tailHairPositionTop: undefined as string | undefined,
			tailHairPositionLeft: undefined as string | undefined,
			tailHairRotation: undefined as string | undefined,
			armTattooPositionTop: undefined as string | undefined,
			armTattooPositionLeft: undefined as string | undefined,
			headTattooPositionTop: undefined as string | undefined,
			headTattooPositionLeft: undefined as string | undefined,
			chestTattooPositionTop: undefined as string | undefined,
			chestTattooPositionLeft: undefined as string | undefined,
			hasInjury: false as boolean,
			injuryType: 'minorInjury' as 'minorInjury' | 'heavyInjury',
			hasHeadSpecial: false as boolean,
			hasHeadSpecial2: false as boolean,
			hasArmInjury: false as boolean,
			hasArmSpecial: false as boolean,
			hasArmSpecial1: false as boolean,
			hasArmSpecial2: false as boolean,
			hasArmSpecial3: false as boolean,
			hasArmSpecial4: false as boolean,
			hasLegSecondInjury: false as boolean,
			hasLegThirdInjury: false as boolean,
			hasChestLastElement: false as boolean,
			hasChestThirdInjury: false as boolean,
			tailSize: undefined as number | undefined,
			hasHair: false as boolean,
			hasComplementaryHair: false as boolean,
			hasComplementaryHair2: false as boolean,
			hasTailHair: false as boolean,
			hasEyeRetina: false as boolean,
			hasKnee: false as boolean,
			hasTattoo: false as boolean,
			hasHeadTattoo: false as boolean,
			hasArmTattoo: false as boolean,
			hasChestTattoo: false as boolean,
			tailHairSize: 1 as number,
			tattooNumber: '' as string,
			childOrAdult: '' as string,
			size: 1 as number,
			isLoading: true as boolean,
			element0: 0 as number,
			element4: 4 as number
		};
	},
	computed: {
		dinozHead(): string {
			return defineAsyncComponent(() => import(`./head/${this.head.imgNumber}.vue`));
		},
		headSpecial(): string {
			return defineAsyncComponent(() => import(`./head/special/${this.head.dependentImage.imgNumber}.vue`));
		},
		headSpecial2(): string {
			return defineAsyncComponent(() => import(`./head/special/${this.head.dependentImage2.imgNumber}.vue`));
		},
		headInjury(): string {
			return defineAsyncComponent(
				() => import(`./head/injury/${this.injuryType}/${this.head[this.injuryType].imgNumber}.vue`)
			);
		},
		eyeRetina(): string {
			return defineAsyncComponent(() => import(`./eye/${this.head.eyeRetina.imgNumber}.vue`));
		},
		eye(): string {
			return defineAsyncComponent(() => import(`./eye/${this.head.eye[this.childOrAdult].imgNumber}.vue`));
		},
		dinozHair(): string {
			return defineAsyncComponent(() => import(`./hair/${this.hairNumber}.vue`));
		},
		complementaryHair(): string {
			return defineAsyncComponent(
				() => import(`./hair/${this.head.hair[this.hairNumber].dependentImage.imgNumber}.vue`)
			);
		},
		complementaryHair2(): string {
			return defineAsyncComponent(
				() => import(`./hair/${this.head.hair[this.hairNumber].dependentImage2.imgNumber}.vue`)
			);
		},
		headTattoo(): string {
			return defineAsyncComponent(() => import(`./head/tattoo/${this.head.tattoo[this.tattooNumber].imgNumber}.vue`));
		},
		chestElement1(): string {
			return defineAsyncComponent(() => import(`./chest/${this.chest.element1.imgNumber}.vue`));
		},
		chestElement2(): string {
			return defineAsyncComponent(() => import(`./chest/${this.chest.element2.imgNumber}.vue`));
		},
		chestElement3(): string {
			return defineAsyncComponent(() => import(`./chest/${this.element4}.vue`));
		},
		chestInjury1(): string {
			return defineAsyncComponent(
				() => import(`./chest/injury/${this.injuryType}/${this.chest[this.injuryType][1].imgNumber}.vue`)
			);
		},
		chestInjury2(): string {
			return defineAsyncComponent(
				() => import(`./chest/injury/${this.injuryType}/${this.chest[this.injuryType][2].imgNumber}.vue`)
			);
		},
		chestInjury3(): string {
			return defineAsyncComponent(
				() => import(`./chest/injury/${this.injuryType}/${this.chest[this.injuryType][3].imgNumber}.vue`)
			);
		},
		tail(): string {
			return defineAsyncComponent(() => import(`./chest/tail/${this.element0}.vue`));
		},
		tailSpecial(): string {
			return defineAsyncComponent(() => import(`./chest/tail/special/${this.element0}.vue`));
		},
		tailHair(): string {
			return defineAsyncComponent(() => import(`./hair/tail/${this.hairNumber}.vue`));
		},
		chestTattoo(): string {
			return defineAsyncComponent(() => import(`./chest/tattoo/${this.element0}.vue`));
		},
		leftArm(): string {
			return defineAsyncComponent(() => import(`./arm/left/${this.arm.imgNumber}.vue`));
		},
		leftArmSpecial0(): string {
			return defineAsyncComponent(() => import(`./arm/left/special/${this.arm.left.dependentImage0.imgNumber}.vue`));
		},
		leftArmSpecial1(): string {
			return defineAsyncComponent(() => import(`./arm/left/special/${this.arm.left.dependentImage1.imgNumber}.vue`));
		},
		leftArmSpecial2(): string {
			return defineAsyncComponent(
				() => import(`./arm/left/special/${this.arm.left.dependentImage2[this.childOrAdult].imgNumber}.vue`)
			);
		},
		leftArmSpecial4(): string {
			return defineAsyncComponent(() => import(`./arm/right/special/${this.arm.right.dependentImage4.imgNumber}.vue`));
		},
		leftArmInjury(): string {
			return defineAsyncComponent(
				() => import(`./arm/left/injury/${this.injuryType}/${this.arm.left[this.injuryType].imgNumber}.vue`)
			);
		},
		armTattoo(): string {
			return defineAsyncComponent(
				() => import(`./arm/right/tattoo/${this.arm.right.tattoo[this.tattooNumber].imgNumber}.vue`)
			);
		},
		rightArm(): string {
			return defineAsyncComponent(() => import(`./arm/right/${this.arm.imgNumber}.vue`));
		},
		rightArmSpecial0(): string {
			return defineAsyncComponent(() => import(`./arm/right/special/${this.arm.right.dependentImage0.imgNumber}.vue`));
		},
		rightArmSpecial1(): string {
			return defineAsyncComponent(() => import(`./arm/right/special/${this.arm.right.dependentImage1.imgNumber}.vue`));
		},
		rightArmSpecial2(): string {
			return defineAsyncComponent(
				() => import(`./arm/right/special/${this.arm.right.dependentImage2[this.childOrAdult].imgNumber}.vue`)
			);
		},
		rightArmSpecial3(): string {
			return defineAsyncComponent(() => import(`./arm/right/special/${this.arm.right.dependentImage3.imgNumber}.vue`));
		},
		rightArmSpecial4(): string {
			return defineAsyncComponent(() => import(`./arm/right/special/${this.arm.right.dependentImage4.imgNumber}.vue`));
		},
		rightArmInjury(): string {
			return defineAsyncComponent(
				() => import(`./arm/right/injury/${this.injuryType}/${this.arm.right[this.injuryType].imgNumber}.vue`)
			);
		},
		leftLeg(): string {
			return defineAsyncComponent(() => import(`./leg/left/${this.element0}.vue`));
		},
		leftLegKneeHorn(): string {
			return defineAsyncComponent(() => import(`./leg/left/knee/${this.leg.left.knee.horn.imgNumber}.vue`));
		},
		leftLegKneeSkin(): string {
			return defineAsyncComponent(() => import(`./leg/left/knee/${this.leg.left.knee.skin.imgNumber}.vue`));
		},
		leftLegInjury1(): string {
			return defineAsyncComponent(
				() => import(`./leg/left/injury/${this.injuryType}/${this.leg.left[this.injuryType][1].imgNumber}.vue`)
			);
		},
		leftLegInjury2(): string {
			return defineAsyncComponent(
				() => import(`./leg/left/injury/${this.injuryType}/${this.leg.left[this.injuryType][2].imgNumber}.vue`)
			);
		},
		leftLegNail(): string {
			return defineAsyncComponent(() => import(`./leg/left/nail/${this.element0}.vue`));
		},
		rightLeg(): string {
			return defineAsyncComponent(() => import(`./leg/right/${this.element0}.vue`));
		},
		rightLegKneeHorn(): string {
			return defineAsyncComponent(() => import(`./leg/right/knee/${this.leg.right.knee.horn.imgNumber}.vue`));
		},
		rightLegKneeSkin(): string {
			return defineAsyncComponent(() => import(`./leg/right/knee/${this.leg.right.knee.skin.imgNumber}.vue`));
		},
		rightLegInjury1(): string {
			return defineAsyncComponent(
				() => import(`./leg/right/injury/${this.injuryType}/${this.leg.right[this.injuryType][1].imgNumber}.vue`)
			);
		},
		rightLegInjury2(): string {
			return defineAsyncComponent(
				() => import(`./leg/right/injury/${this.injuryType}/${this.leg.right[this.injuryType][2].imgNumber}.vue`)
			);
		},
		rightLegInjury3(): string {
			return defineAsyncComponent(
				() => import(`./leg/right/injury/${this.injuryType}/${this.leg.right[this.injuryType][3].imgNumber}.vue`)
			);
		},
		rightLegNail(): string {
			return defineAsyncComponent(() => import(`./leg/right/nail/${this.element0}.vue`));
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
		}
	},
	mounted(): void {
		this.hasKnee = this.display[2] === '1';
		this.head = moueffe.head[parseInt(this.display[3])];
		this.hairNumber = parseInt(this.display[4]);
		this.arm = moueffe.arm[parseInt(this.display[5])];
		this.chest = moueffe.chest[parseInt(this.display[6])];
		this.tattoo = moueffe.tattoo[this.display[7]];
		this.hasTattoo = this.display[7] !== '0';
		this.tattooNumber = this.display[7];

		this.leg = moueffe.leg[0]; // Unique

		const bodyColor = moueffe.color.body[this.display[9]];
		const hairFirstColor = moueffe.color.hair[this.display[10]];

		const sizeLetter = parseInt(this.display[1]);
		this.size = (1 / 36) * parseInt(this.display[1]) + 0.75;

		this.mainFirstColor = this.getColor(bodyColor.baby.mainFirstColor, bodyColor.adult.mainFirstColor, sizeLetter);
		this.mainSecondColor = this.getColor(bodyColor.baby.mainSecondColor, bodyColor.adult.mainSecondColor, sizeLetter);
		this.mainThirdColor = this.getColor(bodyColor.baby.mainThirdColor, bodyColor.adult.mainThirdColor, sizeLetter);

		this.chestFirstColor = this.getColor(bodyColor.baby.chestFirstColor, bodyColor.adult.chestFirstColor, sizeLetter);
		this.chestSecondColor = this.getColor(
			bodyColor.baby.chestSecondColor,
			bodyColor.adult.chestSecondColor,
			sizeLetter
		);
		this.chestThirdColor = this.getColor(bodyColor.baby.chestThirdColor, bodyColor.adult.chestThirdColor, sizeLetter);
		this.chestFourthColor = this.getColor(
			bodyColor.baby.chestFourthColor,
			bodyColor.adult.chestFourthColor,
			sizeLetter
		);
		this.chestFifthColor = this.getColor(bodyColor.baby.chestFifthColor, bodyColor.adult.chestFifthColor, sizeLetter);
		this.chestSixthColor = this.getColor(bodyColor.baby.chestSixthColor, bodyColor.adult.chestSixthColor, sizeLetter);
		this.chestSeventhColor = this.getColor(
			bodyColor.baby.chestSeventhColor,
			bodyColor.adult.chestSeventhColor,
			sizeLetter
		);
		this.borderColor = this.getColor(bodyColor.baby.borderColor, bodyColor.adult.borderColor, sizeLetter);

		this.hairFirstColor = hairFirstColor.hairFirstColor;
		this.hairSecondColor = hairFirstColor.hairSecondColor;
		this.hairThirdColor = hairFirstColor.hairThirdColor;
		this.hairBorderColor = hairFirstColor.hairBorderColor;

		this.tattooColor = moueffe.color.tattoo[this.display[11]];

		this.tailSize = this.chest.tail.size;

		this.childOrAdult = this.display[1] === '9' ? 'adult' : 'baby';

		if (this.life < 20) {
			this.injuryType = 'heavyInjury';
			this.hasInjury = true;
		} else if (this.life < 50) {
			this.injuryType = 'minorInjury';
			this.hasInjury = true;
		}

		// Head
		this.headDefaultPositionLeft = `${this.head.default.left * this.size}px`;
		this.headDefaultPositionTop = `${this.head.default.top * this.size}px`;

		// Head special 1
		if (this.head.dependentImage) {
			this.hasHeadSpecial = true;
			this.headSpecialPositionLeft = `${this.head.dependentImage.left * this.size}px`;
			this.headSpecialPositionTop = `${this.head.dependentImage.top * this.size}px`;
			this.headSpecialZIndexPosition = `${this.head.dependentImage.zIndex}`;
		}

		// Head special 2
		if (this.head.dependentImage2) {
			this.hasHeadSpecial2 = true;
			this.headSpecial2PositionLeft = `${this.head.dependentImage2.left * this.size}px`;
			this.headSpecial2PositionTop = `${this.head.dependentImage2.top * this.size}px`;
		}

		// Eyes
		this.eyePositionLeft = `${this.head.eye[this.childOrAdult].left * this.size}px`;
		this.eyePositionTop = `${this.head.eye[this.childOrAdult].top * this.size}px`;

		// Eyes retinas
		if (this.head.eyeRetina) {
			this.hasEyeRetina = true;
			this.eyeRetinaPositionLeft = `${this.head.eyeRetina.left * this.size}px`;
			this.eyeRetinaPositionTop = `${this.head.eyeRetina.top * this.size}px`;
		}

		// Chest
		this.chestDefaultPositionLeft = `${moueffe.chest.default.left * this.size}px`;
		this.chestDefaultPositionTop = `${moueffe.chest.default.top * this.size}px`;

		this.chestElement2PositionLeft = `${this.chest.element2.left * this.size}px`;
		this.chestElement2PositionTop = `${this.chest.element2.top * this.size}px`;

		// Chest third element
		if (this.chest.element3) {
			this.hasChestLastElement = true;
			this.chestElement3PositionLeft = `${this.chest.element3.left * this.size}px`;
			this.chestElement3PositionTop = `${this.chest.element3.top * this.size}px`;
		}

		// Injuries
		if (this.hasInjury) {
			this.headInjuryPositionLeft = `${this.head[this.injuryType].left * this.size}px`;
			this.headInjuryPositionTop = `${this.head[this.injuryType].top * this.size}px`;

			this.chestInjury1PositionLeft = `${this.chest[this.injuryType][1].left * this.size}px`;
			this.chestInjury1PositionTop = `${this.chest[this.injuryType][1].top * this.size}px`;

			this.chestInjury2PositionLeft = `${this.chest[this.injuryType][2].left * this.size}px`;
			this.chestInjury2PositionTop = `${this.chest[this.injuryType][2].top * this.size}px`;

			// Chest third injury
			if (this.chest[this.injuryType][3]) {
				this.hasChestThirdInjury = true;
				this.chestInjury3PositionLeft = `${this.chest[this.injuryType][3].left * this.size}px`;
				this.chestInjury3PositionTop = `${this.chest[this.injuryType][3].top * this.size}px`;
			}

			// Legs injuries
			this.leftLegInjury1PositionLeft = `${this.leg.left[this.injuryType][1].left * this.size}px`;
			this.leftLegInjury1PositionTop = `${this.leg.left[this.injuryType][1].top * this.size}px`;

			this.rightLegInjury1PositionLeft = `${this.leg.right[this.injuryType][1].left * this.size}px`;
			this.rightLegInjury1PositionTop = `${this.leg.right[this.injuryType][1].top * this.size}px`;

			// Leg second injury
			if (this.leg.left[this.injuryType][2]) {
				this.hasLegSecondInjury = true;
				this.leftLegInjury2PositionLeft = `${this.leg.left[this.injuryType][2].left * this.size}px`;
				this.leftLegInjury2PositionTop = `${this.leg.left[this.injuryType][2].top * this.size}px`;

				this.rightLegInjury2PositionLeft = `${this.leg.right[this.injuryType][2].left * this.size}px`;
				this.rightLegInjury2PositionTop = `${this.leg.right[this.injuryType][2].top * this.size}px`;
			}

			// Leg third injury
			if (this.leg.right[this.injuryType][3]) {
				this.hasLegThirdInjury = true;
				this.rightLegInjury3PositionLeft = `${this.leg.right[this.injuryType][3].left * this.size}px`;
				this.rightLegInjury3PositionTop = `${this.leg.right[this.injuryType][3].top * this.size}px`;
			}

			// Arms injuries
			if (this.arm.left[this.injuryType]) {
				this.hasArmInjury = true;
				this.leftArmInjuryPositionLeft = `${this.arm.left[this.injuryType].left * this.size}px`;
				this.leftArmInjuryPositionTop = `${this.arm.left[this.injuryType].top * this.size}px`;

				this.rightArmInjuryPositionLeft = `${this.arm.right[this.injuryType].left * this.size}px`;
				this.rightArmInjuryPositionTop = `${this.arm.right[this.injuryType].top * this.size}px`;
			}
		}

		// Arms
		this.leftArmDefaultPositionLeft = `${this.arm.left.default.left * this.size}px`;
		this.leftArmDefaultPositionTop = `${this.arm.left.default.top * this.size}px`;

		// Arm special
		if (this.arm.left.dependentImage0) {
			this.hasArmSpecial = true;

			this.leftArmSpecialPositionLeft = `${this.arm.left.dependentImage0.left * this.size}px`;
			this.leftArmSpecialPositionTop = `${this.arm.left.dependentImage0.top * this.size}px`;
			this.leftArmSpecialPositionZIndex = `${this.arm.left.dependentImage0.zIndex}`;

			this.rightArmSpecialPositionLeft = `${this.arm.right.dependentImage0.left * this.size}px`;
			this.rightArmSpecialPositionTop = `${this.arm.right.dependentImage0.top * this.size}px`;

			// Arm special 1
			if (this.arm.left.dependentImage1) {
				this.hasArmSpecial1 = true;
				this.leftArmSpecial1PositionLeft = `${this.arm.left.dependentImage1.left * this.size}px`;
				this.leftArmSpecial1PositionTop = `${this.arm.left.dependentImage1.top * this.size}px`;

				this.rightArmSpecial1PositionLeft = `${this.arm.right.dependentImage1.left * this.size}px`;
				this.rightArmSpecial1PositionTop = `${this.arm.right.dependentImage1.top * this.size}px`;
				this.rightArmSpecial1ZIndex = `${this.arm.right.dependentImage1.zIndex}`;
			}

			// Arm special 2
			if (this.arm.left.dependentImage2) {
				this.hasArmSpecial2 = true;
				this.leftArmSpecial2PositionLeft = `${this.arm.left.dependentImage2[this.childOrAdult].left * this.size}px`;
				this.leftArmSpecial2PositionTop = `${this.arm.left.dependentImage2[this.childOrAdult].top * this.size}px`;

				this.rightArmSpecial2PositionLeft = `${this.arm.right.dependentImage2[this.childOrAdult].left * this.size}px`;
				this.rightArmSpecial2PositionTop = `${this.arm.right.dependentImage2[this.childOrAdult].top * this.size}px`;
			}

			// Arm special 3
			if (this.arm.right.dependentImage3) {
				this.hasArmSpecial3 = true;
				this.rightArmSpecial3PositionLeft = `${this.arm.right.dependentImage3.left * this.size}px`;
				this.rightArmSpecial3PositionTop = `${this.arm.right.dependentImage3.top * this.size}px`;
			}

			// Arm special 4
			if (this.arm.left.dependentImage4) {
				this.hasArmSpecial4 = true;
				this.leftArmSpecial4PositionLeft = `${this.arm.left.dependentImage4.left * this.size}px`;
				this.leftArmSpecial4PositionTop = `${this.arm.left.dependentImage4.top * this.size}px`;

				this.rightArmSpecial4PositionLeft = `${this.arm.right.dependentImage4.left * this.size}px`;
				this.rightArmSpecial4PositionTop = `${this.arm.right.dependentImage4.top * this.size}px`;
			}
		}

		// Right arm
		this.rightArmDefaultPositionLeft = `${this.arm.right.default.left * this.size}px`;
		this.rightArmDefaultPositionTop = `${this.arm.right.default.top * this.size}px`;

		// Legs
		this.leftLegDefaultPositionLeft = `${this.leg.left.default.left * this.size}px`;
		this.leftLegDefaultPositionTop = `${this.leg.left.default.top * this.size}px`;

		// Left leg nails
		this.leftLegNailPositionLeft = `${this.leg.left.nail.left * this.size}px`;
		this.leftLegNailPositionTop = `${this.leg.left.nail.top * this.size}px`;

		// Right leg
		this.rightLegDefaultPositionLeft = `${this.leg.right.default.left * this.size}px`;
		this.rightLegDefaultPositionTop = `${this.leg.right.default.top * this.size}px`;

		// Right leg nails
		this.rightLegNailPositionLeft = `${this.leg.right.nail.left * this.size}px`;
		this.rightLegNailPositionTop = `${this.leg.right.nail.top * this.size}px`;

		// Knees
		if (this.hasKnee) {
			this.leftLegKneeHornPositionLeft = `${this.leg.left.knee.horn.left * this.size}px`;
			this.leftLegKneeHornPositionTop = `${this.leg.left.knee.horn.top * this.size}px`;

			this.leftLegKneeSkinPositionLeft = `${this.leg.left.knee.skin.left * this.size}px`;
			this.leftLegKneeSkinPositionTop = `${this.leg.left.knee.skin.top * this.size}px`;

			this.rightLegKneeHornPositionLeft = `${this.leg.right.knee.horn.left * this.size}px`;
			this.rightLegKneeHornPositionTop = `${this.leg.right.knee.horn.top * this.size}px`;

			this.rightLegKneeSkinPositionLeft = `${this.leg.right.knee.skin.left * this.size}px`;
			this.rightLegKneeSkinPositionTop = `${this.leg.right.knee.skin.top * this.size}px`;
		}

		// Tail
		this.tailPositionLeft = `${this.chest.tail.left * this.size}px`;
		this.tailPositionTop = `${this.chest.tail.top * this.size}px`;

		this.tailSpecialPositionLeft = `${this.chest.tailSpecial.left * this.size}px`;
		this.tailSpecialPositionTop = `${this.chest.tailSpecial.top * this.size}px`;

		// Tail hair
		if (this.head.hair[this.hairNumber]?.hasTailHair) {
			this.hasTailHair = true;
			this.tailHairSize = this.chest.tailHair[this.hairNumber].size;
			this.tailHairPositionLeft = `${this.chest.tailHair[this.hairNumber].left * this.size}px`;
			this.tailHairPositionTop = `${this.chest.tailHair[this.hairNumber].top * this.size}px`;
			this.tailHairRotation = `${this.chest.tailHair[this.hairNumber].rotation * this.size}deg`;
		}

		// Hair (head and tail)
		if (this.hairNumber) {
			this.hasHair = true;

			this.hairPositionLeft = `${this.head.hair[this.hairNumber].left * this.size}px`;
			this.hairPositionTop = `${this.head.hair[this.hairNumber].top * this.size}px`;
			this.hairZIndex = `${this.head.hair[this.hairNumber].zIndex}`;

			// Complementary hair
			if (this.head.hair[this.hairNumber].dependentImage) {
				this.hasComplementaryHair = true;
				this.hair2PositionLeft = `${this.head.hair[this.hairNumber].dependentImage.left * this.size}px`;
				this.hair2PositionTop = `${this.head.hair[this.hairNumber].dependentImage.top * this.size}px`;
			}

			// Complementary hair 2
			if (this.head.hair[this.hairNumber].dependentImage2) {
				this.hasComplementaryHair2 = true;
				this.hair3PositionLeft = `${this.head.hair[this.hairNumber].dependentImage2.left * this.size}px`;
				this.hair3PositionTop = `${this.head.hair[this.hairNumber].dependentImage2.top * this.size}px`;
				this.hair3ZIndex = `${this.head.hair[this.hairNumber].dependentImage2.zIndex}`;
			}
		}

		// Tattoos
		if (this.hasTattoo) {
			// Head tattoo
			if (this.head.tattoo[this.tattooNumber] !== undefined) {
				this.hasHeadTattoo = true;
				this.headTattooPositionLeft = `${this.head.tattoo[this.tattooNumber].left * this.size}px`;
				this.headTattooPositionTop = `${this.head.tattoo[this.tattooNumber].top * this.size}px`;
			}

			// Arm tattoo
			if (this.hasTattoo && this.arm.right.tattoo) {
				this.hasArmTattoo = true;
				this.armTattooPositionLeft = `${this.arm.right.tattoo[this.tattooNumber].left * this.size}px`;
				this.armTattooPositionTop = `${this.arm.right.tattoo[this.tattooNumber].top * this.size}px`;
			}

			// Chest tattoo
			if (this.hasTattoo && this.chest.tattoo && this.tattoo.hasChestTattoo) {
				this.hasChestTattoo = true;
				this.chestTattooPositionLeft = `${this.chest.tattoo.left * this.size}px`;
				this.chestTattooPositionTop = `${this.chest.tattoo.top * this.size}px`;
			}
		}

		this.isLoading = false;
	}
});
</script>

<style lang="scss" scoped>
.dinoz {
	float: left;
	position: relative;
	top: 0px;
	left: 130px;
	-webkit-transform: scaleX(v-bind(flip));
	transform: scaleX(v-bind(flip));
}

.moueffe_head {
	position: absolute;
	top: v-bind(headDefaultPositionTop);
	left: v-bind(headDefaultPositionLeft);
}

.head {
	position: absolute;
	z-index: 2;
}

.head_special {
	position: absolute;
	top: v-bind(headSpecialPositionTop);
	left: v-bind(headSpecialPositionLeft);
	z-index: v-bind(headSpecialZIndexPosition);
}

.head_special_2 {
	position: absolute;
	top: v-bind(headSpecial2PositionTop);
	left: v-bind(headSpecial2PositionLeft);
	z-index: 2;
}

.eye {
	position: absolute;
	top: v-bind(eyePositionTop);
	left: v-bind(eyePositionLeft);
	z-index: 2;
}

.eye_retina {
	position: absolute;
	top: v-bind(eyeRetinaPositionTop);
	left: v-bind(eyeRetinaPositionLeft);
	z-index: 0;
}

.hair {
	position: absolute;
	top: v-bind(hairPositionTop);
	left: v-bind(hairPositionLeft);
	z-index: v-bind(hairZIndex);
}

.hair_2 {
	position: absolute;
	top: v-bind(hair2PositionTop);
	left: v-bind(hair2PositionLeft);
	z-index: 2;
}

.hair_3 {
	position: absolute;
	top: v-bind(hair3PositionTop);
	left: v-bind(hair3PositionLeft);
	z-index: v-bind(hair3ZIndex);
}

.moueffe_chest {
	position: absolute;
	top: v-bind(chestDefaultPositionTop);
	left: v-bind(chestDefaultPositionLeft);
}

.chest_element_1 {
	position: absolute;
}

.chest_element_2 {
	position: absolute;
	top: v-bind(chestElement2PositionTop);
	left: v-bind(chestElement2PositionLeft);
	z-index: 0;
}

.chest_element_3 {
	position: absolute;
	top: v-bind(chestElement3PositionTop);
	left: v-bind(chestElement3PositionLeft);
	z-index: 0;
}

.chest_injury_1 {
	position: absolute;
	top: v-bind(chestInjury1PositionTop);
	left: v-bind(chestInjury1PositionLeft);
}

.chest_injury_2 {
	position: absolute;
	top: v-bind(chestInjury2PositionTop);
	left: v-bind(chestInjury2PositionLeft);
}

.chest_injury_3 {
	position: absolute;
	top: v-bind(chestInjury3PositionTop);
	left: v-bind(chestInjury3PositionLeft);
}

.moueffe_left_arm {
	position: absolute;
	top: v-bind(leftArmDefaultPositionTop);
	left: v-bind(leftArmDefaultPositionLeft);
}

.left_arm {
	position: absolute;
	z-index: -1;
}

.left_arm_special {
	position: absolute;
	top: v-bind(leftArmSpecialPositionTop);
	left: v-bind(leftArmSpecialPositionLeft);
	z-index: v-bind(leftArmSpecialPositionZIndex);
}

.left_arm_special_1 {
	position: absolute;
	top: v-bind(leftArmSpecial1PositionTop);
	left: v-bind(leftArmSpecial1PositionLeft);
	z-index: -2;
}

.left_arm_special_2 {
	position: absolute;
	top: v-bind(leftArmSpecial2PositionTop);
	left: v-bind(leftArmSpecial2PositionLeft);
	z-index: -3;
}

.left_arm_special_4 {
	position: absolute;
	top: v-bind(leftArmSpecial4PositionTop);
	left: v-bind(leftArmSpecial4PositionLeft);
	z-index: -2;
}

.moueffe_right_arm {
	position: absolute;
	top: v-bind(rightArmDefaultPositionTop);
	left: v-bind(rightArmDefaultPositionLeft);
}

.right_arm {
	position: absolute;
	z-index: 1;
}

.right_arm_special {
	position: absolute;
	top: v-bind(rightArmSpecialPositionTop);
	left: v-bind(rightArmSpecialPositionLeft);
	z-index: 1;
}

.right_arm_special_1 {
	position: absolute;
	top: v-bind(rightArmSpecial1PositionTop);
	left: v-bind(rightArmSpecial1PositionLeft);
	z-index: v-bind(rightArmSpecial1ZIndex);
}

.right_arm_special_2 {
	position: absolute;
	top: v-bind(rightArmSpecial2PositionTop);
	left: v-bind(rightArmSpecial2PositionLeft);
	z-index: 2;
}

.right_arm_special_3 {
	position: absolute;
	top: v-bind(rightArmSpecial3PositionTop);
	left: v-bind(rightArmSpecial3PositionLeft);
	z-index: 1;
}

.right_arm_special_4 {
	position: absolute;
	top: v-bind(rightArmSpecial4PositionTop);
	left: v-bind(rightArmSpecial4PositionLeft);
}

.moueffe_left_leg {
	position: absolute;
	top: v-bind(leftLegDefaultPositionTop);
	left: v-bind(leftLegDefaultPositionLeft);
}

.left_leg {
	position: absolute;
	z-index: -1;
}

.left_leg_knee_horn {
	position: absolute;
	top: v-bind(leftLegKneeHornPositionTop);
	left: v-bind(leftLegKneeHornPositionLeft);
	z-index: 0;
}

.left_leg_knee_skin {
	position: absolute;
	top: v-bind(leftLegKneeSkinPositionTop);
	left: v-bind(leftLegKneeSkinPositionLeft);
	z-index: -1;
}

.left_leg_injury_1 {
	position: absolute;
	top: v-bind(leftLegInjury1PositionTop);
	left: v-bind(leftLegInjury1PositionLeft);
}

.left_leg_injury_2 {
	position: absolute;
	top: v-bind(leftLegInjury2PositionTop);
	left: v-bind(leftLegInjury2PositionLeft);
}

.left_leg_nail {
	position: absolute;
	top: v-bind(leftLegNailPositionTop);
	left: v-bind(leftLegNailPositionLeft);
	z-index: -2;
}

.moueffe_right_leg {
	position: absolute;
	top: v-bind(rightLegDefaultPositionTop);
	left: v-bind(rightLegDefaultPositionLeft);
}

.right_leg {
	position: absolute;
	z-index: 1;
}

.right_leg_knee_horn {
	position: absolute;
	top: v-bind(rightLegKneeHornPositionTop);
	left: v-bind(rightLegKneeHornPositionLeft);
	z-index: 2;
}

.right_leg_knee_skin {
	position: absolute;
	top: v-bind(rightLegKneeSkinPositionTop);
	left: v-bind(rightLegKneeSkinPositionLeft);
	z-index: 1;
}

.right_leg_injury_1 {
	position: absolute;
	top: v-bind(rightLegInjury1PositionTop);
	left: v-bind(rightLegInjury1PositionLeft);
	z-index: 1;
}

.right_leg_injury_2 {
	position: absolute;
	top: v-bind(rightLegInjury2PositionTop);
	left: v-bind(rightLegInjury2PositionLeft);
	z-index: 1;
}

.right_leg_injury_3 {
	position: absolute;
	top: v-bind(rightLegInjury3PositionTop);
	left: v-bind(rightLegInjury3PositionLeft);
	z-index: 1;
}

.right_leg_nail {
	position: absolute;
	top: v-bind(rightLegNailPositionTop);
	left: v-bind(rightLegNailPositionLeft);
	z-index: 1;
}

.tail {
	position: absolute;
	transform: rotate(-7deg);
	top: v-bind(tailPositionTop);
	left: v-bind(tailPositionLeft);
	z-index: -1;
}

.tailSpecial {
	position: absolute;
	top: v-bind(tailSpecialPositionTop);
	left: v-bind(tailSpecialPositionLeft);
	z-index: -1;
}

.tail_hair {
	position: absolute;
	transform: rotate(v-bind(tailHairRotation));
	top: v-bind(tailHairPositionTop);
	left: v-bind(tailHairPositionLeft);
	z-index: -1;
}

.head_injury {
	position: absolute;
	top: v-bind(headInjuryPositionTop);
	left: v-bind(headInjuryPositionLeft);
	z-index: 3;
}

.left_arm_injury {
	position: absolute;
	top: v-bind(leftArmInjuryPositionTop);
	left: v-bind(leftArmInjuryPositionLeft);
	z-index: 1;
}

.right_arm_injury {
	position: absolute;
	top: v-bind(rightArmInjuryPositionTop);
	left: v-bind(rightArmInjuryPositionLeft);
	z-index: 1;
}

.head_tattoo {
	position: absolute;
	top: v-bind(headTattooPositionTop);
	left: v-bind(headTattooPositionLeft);
	z-index: 2;
}

.arm_tattoo {
	position: absolute;
	top: v-bind(armTattooPositionTop);
	left: v-bind(armTattooPositionLeft);
	z-index: 1;
}

.chest_tattoo {
	position: absolute;
	top: v-bind(chestTattooPositionTop);
	left: v-bind(chestTattooPositionLeft);
	z-index: 1;
}
</style>
