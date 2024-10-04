<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<Transition>
		<div v-if="text" class="modal-background">
			<div class="box">
				<div class="headerBox">
					<div class="name">{{ $t(`missions.npc.${npcName}`) }} :</div>
				</div>
				<div class="footer">
					<DZButton class="continue" @click="$emit('close')">{{ $t(`npc.continue`) }}</DZButton>
					<span class="dialog">
						{{ $t(`missions.dialog.${text}`) }}
					</span>
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
		min-width: 528px;
		background-repeat: repeat-y;
		background-image: url('../../assets/background/dialog_bg_pix.webp');

		.headerBox {
			background-image: url('../../assets/background/dialog_bg_header.webp');
			background-repeat: no-repeat;
			height: 30px;

			.name {
				margin-left: 15px;
				padding-top: 15px;
				font-variant: small-caps;
				font-weight: bold;
				font-size: 10pt;
				color: #693118;
			}
		}

		.footer {
			min-height: 148px;
			padding: 1px;
			background-image: url('../../assets/background/dialog_bg_footer.webp');
			background-repeat: no-repeat;
			background-position: bottom left;
			overflow: hidden;

			.continue {
				top: 100px;
				left: 15px;
			}

			.dialog {
				width: 390px;
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
