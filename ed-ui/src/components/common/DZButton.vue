<template>
	<a
		:class="{
			'button-component': true,
			[size]: true
		}"
	>
		<span>
			<slot />
		</span>
	</a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'DZButton',
	props: {
		size: {
			type: String,
			default: 'normal'
		}
	}
});
</script>

<style lang="scss" scoped>
.button-component {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 9pt;
	font-variant: small-caps;
	line-height: 7pt;
	cursor: pointer;

	&.small {
		border-color: #c5482c;
		border-style: double;
		background-clip: padding-box;
		background-color: #c5482c;
		color: #ffee92;
		padding: 2px 4px;

		&:hover {
			background-color: #ffee92;
			color: #c5482c;
		}
	}

	&.normal {
		min-width: 95px;
		height: 28px;
		color: #fff1ad;
		background-image: url('../../assets/button/button-left.webp'), url('../../assets/button/button-right.webp'),
			url('../../assets/button/button-middle.webp');
		background-repeat: no-repeat, no-repeat, repeat-x;
		background-position:
			left top,
			right top,
			center top;

		&:hover {
			background-image: url('../../assets/button/button-hover-left.webp'),
				url('../../assets/button/button-hover-right.webp'), url('../../assets/button/button-hover-middle.webp');
			color: white;
		}

		span {
			padding: 4px 8px;

			&:first-letter {
				color: white;
			}
		}
	}
}
</style>
