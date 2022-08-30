<template>
	<div class="modal-background">
		<div class="modal-box">
			<button class="modal-close" @click="closePopin()">Close</button>
			<span>
				{{ $t(`import.disclaimer1`) }} <br /><br />
				{{ $t(`import.disclaimer2`) }} <br /><br />
				{{ $t(`import.disclaimer3`) }} <br /><br />
			</span>
			<div class="buttonLand">
				<p class="smallbutton" @click="selectImport('fr')">Français</p>
				<p class="smallbutton" @click="selectImport('en')">English</p>
				<p class="smallbutton" @click="selectImport('es')">Español</p>
				<p class="smallbutton" @click="selectImport('de')">Deutsch</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '@/events';
import { PlayerService } from '@/services';
import { errorHandler } from '@/utils';
import { sessionStore } from '@/store';

export default defineComponent({
	name: 'ImportAccount',
	emits: ['closePopin'],
	data() {
		return {
			sessionStore: sessionStore()
		};
	},
	methods: {
		closePopin(): void {
			this.$emit('closePopin');
		},
		async selectImport(lang: string): Promise<void> {
			EventBus.emit('isLoading', true);
			this.$emit('closePopin');
			try {
				await PlayerService.requestImport(lang);
				this.sessionStore.setDinozList([]);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
			this.$router.go(0);
		}
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

	.modal-box {
		width: 400px;
		position: absolute;
		padding: 2em;
		font-size: 1.1em;
		background-color: #fff0d1;
		border-radius: 3px;
		border: 1px solid #efbf86;
		box-shadow: 0 0 0 1px #aa885f, 0 0 5px 1px #aa885f;
		animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;

		span {
			border-collapse: collapse;
			border-spacing: 0px 0px;
			color: rgb(142, 62, 38);
			font-family: 'Trebuchet MS', Arial, sans-serif;
			font-size: 12px;
			font-variant: small-caps;
			font-weight: 700;
			height: 20px;
			line-height: 14.6667px;
			text-align: left;
		}
	}
}

.modal-close {
	cursor: pointer;
	position: absolute;
	text-align: center;
	right: 0;
	top: 0;
	padding: 5px;
	background-color: #fadcb0;
	color: transparentize(brown, 0.4);
	font-size: 0.85em;
	letter-spacing: 0.03em;
	text-decoration: none;
	font-variant: small-caps;
	transition: all 0.15s;

	&:hover,
	&:focus,
	&:active {
		color: black;
	}
}

.buttonLand {
	align-items: flex-start;
	flex-grow: row;
	justify-content: space-around;
	flex-wrap: wrap;
	display: flex;
	left: 25px;
	width: 400px;
	height: auto;
	margin: auto;
	margin-bottom: auto;
	align-items: center;
	margin-bottom: 5px;
}
.smallbutton {
	background-image: url('@/assets/design/button_small.gif');
	padding-top: 4px;
	font-size: 9pt;
	line-height: 7pt;
	width: 80px;
	padding-top: 5px;
	padding-right: 5px;
	color: white;
	font-weight: normal;
	font-variant: small-caps;
	text-align: center;
	height: 24px;
	margin-top: 3px;
	margin-bottom: 2px;
	padding-left: 10px;
	cursor: pointer;
	&:hover {
		background-image: url('@/assets/design/button_small_hover.gif');
	}
}
</style>
