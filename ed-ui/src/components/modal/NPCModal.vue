<template>
	<Transition>
		<div v-if="text" class="modal-background">
			<div class="box">
				<p class="name">{{ $t(`missions.npc.${npcName}`) }} :</p>
				<div class="content">
					<span class="dialog">
						{{ $t(`missions.dialog.${text}`) }}
					</span>
					<DZButton class="continue" @click="$emit('close')">{{ $t(`npc.continue`) }}</DZButton>
				</div>
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
	position: fixed;
	background: transparentize(#09092d, 0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;

	.box {
		cursor: pointer;
		background-repeat: repeat-y;
		max-width: 70%;
		min-height: 75px;
		//background-image: url('../../assets/background/dialog_bg_pix.webp');
		background: url('../../assets/background/dialog_bg_top_left.webp'),
			url('../../assets/background/dialog_bg_top_right.webp'), url('../../assets/background/dialog_bg_top_center.webp'),
			url('../../assets/background/dialog_bg_footer_left.webp'),
			url('../../assets/background/dialog_bg_footer_right.webp'),
			url('../../assets/background/dialog_bg_footer_center.webp'),
			url('../../assets/background/dialog_bg_center_left.webp'),
			url('../../assets/background/dialog_bg_center_right.webp'),
			url('../../assets/background/dialog_bg_center_center.webp');
		background-position-x: left, right, center, left, right, center, left, right, center;
		background-position-y: top, top, top, bottom, bottom, bottom, 40px, 40px, 40px;
		background-repeat: no-repeat, no-repeat, repeat-x, no-repeat, no-repeat, repeat-x, repeat-y, repeat-y, repeat;

		padding-right: 5px;
		padding-left: 5px;
		.name {
			margin-left: 15px;
			padding-top: 15px;
			font-variant: small-caps;
			font-weight: bold;
			font-size: 10pt;
			color: #693118;
		}
		.content {
			padding: 1px;
			background-repeat: no-repeat;
			background-position: bottom left;
			overflow: hidden;
			display: flex;
			justify-content: space-between;
			gap: 15px;
			.portrait {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 5px;
				width: fit-content;
			}

			.dialog {
				width: fit-content;
				float: left;
				position: relative;
				margin-bottom: 10px;
				margin-left: 10px;
				color: #fff3b3;
				font-size: 10pt;
				font-style: italic;
				overflow: hidden;
			}
		}
	}
}
</style>
