<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<Transition>
		<div v-if="text" class="modal-background">
			<div class="box w-[95%] sm:w-[580px]">
				<div class="headerBox">
					<div class="name">{{ $t(`missions.npc.${npcName}`) }} :</div>
				</div>
				<div class="flex flex-col flex-wrap gap-8">
					<div class="dialog flex flex-wrap">
						<p class="pr-5">
							{{ $t(`missions.dialog.${text}`) }}
						</p>
					</div>
					<div class="mr-[25px] flex justify-end">
						<DZButton class="w-[130px]" @click="$emit('close')">{{ $t(`npc.continue`) }}</DZButton>
					</div>
				</div>
				<div class="footer"></div>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';

export default defineComponent({
	name: 'NPCModal',
	components: { DZButton },
	props: {
		text: String,
		npcName: String
	}
});
</script>

<style lang="scss" scoped>
.modal-background {
	background: transparentize(#09092d, 0.4);
	z-index: 999;
	transition: all 0.3s;
	.box {
		cursor: pointer;
		background-repeat: repeat-y;
		background-image: url('../../assets/background/dialog_bg_pix.webp');
		background-size: contain;
		.headerBox {
			background-image: url('../../assets/background/dialog_bg_header.webp');
			background-repeat: no-repeat;
			background-size: cover;
			min-height: 50px;
			.name {
				margin-left: 15px;
				padding-top: 15px;
				font-variant: small-caps;
				font-weight: bold;
				font-size: 10pt;
				color: #693118;
			}
		}
		.dialog {
			display: flex;
			flex-wrap: wrap;
			float: left;
			position: relative;
			margin-bottom: 10px;
			margin-left: 10px;
			color: #fff3b3;
			font-size: 10pt;
			font-style: italic;
			overflow: hidden;
		}
		.footer {
			min-height: 50px;
			padding: 1px;
			background-image: url('../../assets/background/dialog_bg_footer.webp');
			background-repeat: no-repeat;
			background-position: bottom left;
			background-size: contain;
			overflow: hidden;
		}
	}
}
</style>
