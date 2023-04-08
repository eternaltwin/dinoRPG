<template>
	<div v-if="isError" class="modal-background">
		<div class="modal-box">
			<button class="modal-close" @click="dismiss">Close</button>
			{{ $t(`error`) }}
			<div class="details">
				Code : {{ errorDisplay.response.status }}<br />
				Description : {{ errorDisplay.response.data }}<br />
				Tried Url : {{ errorDisplay.response.config.url }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import EventBus from '../../events/index.js';
import { AxiosError } from 'axios';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'ErrorMessage',
	data() {
		return {
			errorDisplay: {} as AxiosError,
			isError: false as boolean
		};
	},
	methods: {
		dismiss(): void {
			EventBus.all.clear();
			this.isError = false;
		}
	},
	mounted(): void {
		EventBus.on('responseError', e => {
			this.errorDisplay = e;
			this.isError = true;
		});
	}
});
</script>

<style lang="scss" scoped>
.details {
	margin-top: 16px;
	font-size: 0.65em;
}
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

@keyframes blowUpModal {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}
</style>
