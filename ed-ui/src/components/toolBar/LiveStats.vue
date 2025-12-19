<template>
	<div class="parameters">
		<span class="title" v-html="formatContent($t('topBar.rightMenu.stats'))"></span>
		<div class="parameter">
			<span class="param" v-html="formatContent($t('topBar.rightMenu.connectedPlayers'))"></span>
			<label class="switch">
				{{ liveStats.connectedPlayers }}
			</label>
		</div>
		<div class="parameter">
			<span class="param" v-html="formatContent($t('topBar.rightMenu.totalPlayers'))"></span>
			<label class="switch">
				{{ liveStats.totalPlayers }}
			</label>
		</div>
		<div class="parameter">
			<span class="param" v-html="formatContent($t('topBar.rightMenu.totalDinoz'))"></span>
			<label class="switch">
				{{ liveStats.totalDinoz }}
			</label>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { sessionStore } from '../../store';

export default defineComponent({
	name: 'LiveStats',
	data() {
		return {
			liveStats: sessionStore().getLiveStats
		};
	},
	watch: {}
});
</script>

<style scoped lang="scss">
.parameters {
	display: flex;
	flex-direction: column;
	margin-top: auto;
	.title {
		box-sizing: border-box;
		list-style: none;
		color: rgba(255, 255, 255, 0.7);
		font-family: arial, sans-serif;
		font-weight: 500;
		padding: 8px 16px;
		position: sticky;
		top: 0px;
		z-index: 1;
		background-color: rgb(15, 25, 36);
		line-height: inherit;
	}
	.parameter {
		display: flex;
		-moz-box-pack: start;
		justify-content: space-evenly;
		-moz-box-align: center;
		align-items: center;
		position: relative;
		text-decoration: none;
		width: 100%;
		box-sizing: border-box;
		text-align: left;
		padding: 4px 16px;
		.param {
			margin: 0px;
			font-family: arial, sans-serif;
			font-weight: 400;
			font-size: 1.2rem;
			line-height: 1.43;
			width: 202px;
			padding-left: 7px;
			display: block;
		}
		/* The switch - the box around the slider */
		.switch {
			position: relative;
			display: inline-block;
			width: 45px;
			height: 15px;
			font-family: arial, sans-serif;
			font-weight: 400;
			font-size: 1.2rem;
			line-height: 1.43;
			margin-left: auto;
			text-align: end;
		}

		/* The slider */
		.slider {
			position: relative;
			width: 45px;
			height: 15px;
			display: block;
			cursor: pointer;
			top: -20px;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #ccc;
			-webkit-transition: 0.4s;
			transition: 0.4s;
		}

		.slider:before {
			position: absolute;
			content: '';
			height: 20px;
			width: 20px;
			//left: 4px;
			bottom: -2px;
			background-color: white;
			-webkit-transition: 0.4s;
			transition: 0.4s;
		}

		input:checked + .slider {
			background-color: #2196f3;
		}

		input:focus + .slider {
			box-shadow: 0 0 1px #2196f3;
		}

		input:checked + .slider:before {
			-webkit-transform: translateX(26px);
			-ms-transform: translateX(26px);
			transform: translateX(26px);
		}

		/* Rounded sliders */
		.slider.round {
			border-radius: 34px;
		}

		.slider.round:before {
			border-radius: 50%;
		}
	}
}

.svgIcon {
	user-select: none;
	width: 1em;
	height: 1em;
	display: inline-block;
	fill: currentcolor;
	flex-shrink: 0;
	transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 2rem;
}
</style>
