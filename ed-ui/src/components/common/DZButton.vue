<template>
	<a
		:class="{
			'button-component': true,
			[size]: true,
			back
		}"
	>
		<img v-if="back && size === 'normal'" :src="getImgURL('button', 'button-back-arrow')" alt="button-back" />
		<span class="content">
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
		},
		back: {
			type: Boolean,
			default: false
		}
	}
});
</script>

<style lang="scss" scoped>
.button-component {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 9pt;
	font-variant: small-caps;
	line-height: 7pt;
	cursor: pointer;
	text-decoration: none;
	max-width: 95%;

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

		.content {
			padding: 4px 8px;

			&:first-letter {
				color: white;
			}
		}

		&.back {
			margin-left: 15px;

			img {
				position: absolute;
				left: -15px;
				top: 0;
			}
		}
	}
}
</style>
