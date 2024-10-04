<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<footer>
		<div class="wrapper">
			<div class="box small devs">
				<h3>{{ $t('footer.developpers') }}</h3>
				<ul>
					<li v-for="dev in randomDev" :key="dev">{{ dev }}</li>
				</ul>
			</div>
			<div class="box description" id="eternaltwin">
				<div class="etwin-logo">
					<svg id="etwin-logo" x="0px" y="0px" width="63px" height="55px" viewBox="0 0 63 55" overflow="visible">
						<g>
							<g>
								<g>
									<path
										class="contour"
										d="M61.4,17.9c-0.8-0.8-1.8-1.3-2.9-1.3c-0.2,0-0.4,0-0.6,0c-0.1,0-0.7,0.1-1.4,0.3     c-2.1-3.3-5.4-5.7-9.3-6.8c-2.4-0.9-4.8-1.4-7.3-1.5l-1.7-5.5c-0.5-1.7-2.1-2.8-3.8-2.8h-5.7C25,0.4,22,3.4,22,7     c0,1.1,0.3,2.1,0.7,3c-1.9,1-3.2,3.1-3.3,5.4h-6.8c-3.8,0-6.8,3.1-6.8,6.8c0,0.7,0.1,1.5,0.3,2.1c-3.2,0.4-5.7,3.2-5.7,6.5     c0,3.6,3,6.6,6.7,6.6c0,0,4.3,0,4.4,0c1.3,0,2.6-0.4,3.6-1.1c0.2,0.1,0.4,0.2,0.5,0.3c-1.5,1.1-2.5,2.9-2.5,4.9     c0,0.5,0.1,0.9,0.1,1.3c-2.6,0.5-4.6,2.9-4.6,5.6c0,3.2,2.6,5.8,5.8,5.8h5.4c0.9,0,1.7-0.3,2.4-0.8l12-9.1l12,9.1     c0.7,0.5,1.6,0.8,2.4,0.8c0.8,0,1.6-0.2,2.3-0.7c1.4-1,2-2.8,1.5-4.5l-1.7-5.5c2.2-1.2,3.5-3.7,3.6-3.8c0.6-1.2,0.8-2.7,1-3.9     c2-2.4,3.2-5.3,3.6-8.3c0.3-0.3,0.5-0.6,0.8-0.8c2-2.6,2.6-4.8,2.7-5.3C62.7,20.2,62.3,18.9,61.4,17.9z"
									/>
								</g>
							</g>
							<g>
								<path
									class="white piou"
									d="M54.4,21.9c-1.3-4-4.6-6.9-8.5-8c-3.4-1.3-7.1-1.7-10.7-0.9c-3.3,0.7-6.1,2.3-8.4,4.5    c1.4,0.8,3,1.5,4.7,1.9c-2.2,2.2-3.7,4.8-4.4,7.6c1.2,0,2.5-0.1,3.7-0.4c0,0.5,0.1,1.1,0.2,1.6c1.4,6.3,7.4,10.4,13.7,9.5    c-1,2-2,4.7-1.8,5.4c0.2,0.8,2.4-1,2.9-1.6c0.6-0.9,1.2-2.8,1.4-4.4c0.5-0.2,0.9-0.4,1.4-0.6c-0.4,1.6-0.6,3.3-0.4,3.8    c0.3,0.7,2.2-1.3,2.6-2c0.4-0.8,0.6-2.4,0.7-3.8c2.3-2.3,3.6-5.4,3.6-8.7c0.6-0.4,1.2-0.9,1.5-1.4c1.6-2,1.9-3.6,1.9-3.6    S56.4,21,54.4,21.9 M51.5,21.9c-0.6-0.1-2.4-2.5-2.9-3.5c-0.1-0.3-0.6-1.3-0.3-1.3c0.8-0.1,2.8,1.8,3.3,2.8    C51.8,20.3,52,22.1,51.5,21.9"
								/>
								<path
									class="piou shadow"
									d="M52.4,33.3c-1,1-2,1.1-3.1,0.8c-9-2.5-15.6-9.9-15.6-18.5c0-0.6,0-1.1,0.1-1.7c0,0,0,0,0,0    c-0.2-0.2-0.1,0.6-0.8,0.8c-2.1,0.6-4.7,1.9-6.1,2.8c1.4,0.8,3,1.5,4.7,1.9c0.8,0.5,1.6,0.4,0.3,1.6c-3.5,3.2-4.6,6-4.6,6    c1.2,0,2.4-0.1,3.6-0.4c0,0.5,0.1,1.1,0.2,1.6c1.2,5.7,6.3,9.6,11.9,9.6c0.6,0,1.2,0,1.8-0.1c-1,2-2,4.7-1.8,5.4    c0,0.1,0.1,0.2,0.3,0.2c0.7,0,2.2-1.3,2.6-1.8c0.6-0.9,1.2-2.8,1.4-4.4c0.5-0.2,0.9-0.4,1.4-0.6c-0.4,1.6-0.6,3.3-0.4,3.8    c0.1,0.1,0.1,0.2,0.2,0.2c0.6,0,2-1.6,2.3-2.2c0.4-0.7,0.6-2.2,0.6-3.5c0,0,0,0,0,0c0-0.1,0-0.2,0-0.3    C51.8,34,52.1,33.6,52.4,33.3z M49.4,34.2c0.1,0,0.2,0,0.3,0.1C49.6,34.2,49.5,34.2,49.4,34.2z"
								/>
							</g>
						</g>
						<g>
							<path
								class="white star"
								d="M24.4,17.2c0.1-0.5,0.3-1,0.7-1.4c1-1,2-1.8,3.2-2.5h-2.6c-1.2,0-2.1,1-2.1,2.1   C23.5,16.2,23.9,16.8,24.4,17.2z"
							/>
							<path
								class="white star"
								d="M28.6,9.6h2.5l0,0c0.9,0,1.6,0.7,1.8,1.5c0.6-0.2,1.2-0.4,1.8-0.5c0.5-0.1,1-0.2,1.5-0.3l-1.9-6h-5.7   C27.2,4.4,26,5.6,26,7C26,8.4,27.2,9.6,28.6,9.6z"
							/>
							<path
								class="white star"
								d="M43.1,45.8c-0.2,0-0.3,0-0.5,0c0,0,0,0,0,0l6.1,4.6l-2-6.3C45.8,44.9,44.5,45.8,43.1,45.8z"
							/>
							<path
								class="white star"
								d="M14.1,30.9c0-1.4-1.2-2.6-2.6-2.6c-0.1,0-0.2,0-0.2,0v0H7.2v0c0,0,0,0-0.1,0c-1.4,0-2.6,1.2-2.6,2.6   c0,1.4,1.2,2.6,2.6,2.6c0,0,0.1,0,0.1,0h4.1v0c0.1,0,0.2,0,0.2,0C13,33.5,14.1,32.4,14.1,30.9z"
							/>
							<path
								class="white star"
								d="M40.5,43.8c-0.3-0.9,0-2.2,0.4-3.6c-5.7-0.8-10.6-4.9-12.2-10.7c-0.5,0-1.1,0.1-1.6,0.1c-0.8,0-1.5-0.4-2-1   c-0.5-0.6-0.6-1.4-0.4-2.2c0.6-2.1,1.5-4,2.6-5.8c-0.6-0.3-1.2-0.6-1.7-0.9c-0.2-0.1-0.3-0.2-0.4-0.3H12.7c-1.6,0-2.8,1.3-2.8,2.8   c0,1.6,1.3,2.8,2.8,2.8h2.5h6.3c0.9,0,1.7,0.8,1.7,1.7c0,0.7-0.4,1.3-1,1.5h-3.5c-1.4,0-2.6,1.2-2.6,2.6c0,1.4,1.2,2.6,2.6,2.6h4.5   c1.7,0,3.1,1.4,3.1,3.1c0,1.7-1.4,3.1-3.1,3.1h-0.1h-4.1c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h0.7c0.9,0,1.6,0.7,1.6,1.6   c0,0.9-0.7,1.6-1.6,1.6h-5.3c-1,0-1.8,0.8-1.8,1.8c0,1,0.8,1.8,1.8,1.8h5.4l14.4-10.9l6.4,4.8C40.6,44.2,40.5,44,40.5,43.8z"
							/>
						</g>
					</svg>
				</div>
				<p>
					<i18n-t keypath="footer.text1" tag="div" class="text">
						<template v-slot:DinoRPG>
							<a href="http://www.dinorpg.com/" target="_blank">DinoRPG</a>
						</template>
					</i18n-t>
					<i18n-t keypath="footer.text2" tag="div" class="text">
						<template v-slot:Gitlab>
							<a href="https://gitlab.com/eternaltwin/dinorpg/dinorpg/" target="_blank">Gitlab</a>
						</template>
					</i18n-t>
					<i18n-t keypath="footer.text3" tag="div" class="text">
						<template v-slot:EternalTwin>
							<a href="https://eternal-twin.net/" target="_blank">EternalTwin</a>
						</template>
						<template v-slot:OpenCollective>
							<a href="https://opencollective.com/eternaltwin" target="_blank">OpenCollective</a>
						</template>
					</i18n-t>
				</p>
				<div class="status">
					<span>
						<svg
							style="height: 11px; width: 11px"
							class="triangle"
							aria-hidden="true"
							focusable="false"
							data-prefix="fa"
							data-icon="exclamation-triangle"
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 576 512"
							data-fa-i2svg=""
						>
							<path
								fill="currentColor"
								d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
							></path>
						</svg>
						<b>Alpha Version.</b> {{ $t('alpha.issue') }}
						<a href="https://discord.gg/Jb8Nwjck6r" target="_blank">Discord</a>
					</span>
					<div class="versionId">
						<span>
							<svg
								style="height: 11px; width: 11px"
								aria-hidden="true"
								focusable="false"
								data-prefix="fas"
								data-icon="globe-europe"
								role="img"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 496 512"
								data-fa-i2svg=""
							>
								<path
									fill="currentColor"
									d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm200 248c0 22.5-3.9 44.2-10.8 64.4h-20.3c-4.3 0-8.4-1.7-11.4-4.8l-32-32.6c-4.5-4.6-4.5-12.1.1-16.7l12.5-12.5v-8.7c0-3-1.2-5.9-3.3-8l-9.4-9.4c-2.1-2.1-5-3.3-8-3.3h-16c-6.2 0-11.3-5.1-11.3-11.3 0-3 1.2-5.9 3.3-8l9.4-9.4c2.1-2.1 5-3.3 8-3.3h32c6.2 0 11.3-5.1 11.3-11.3v-9.4c0-6.2-5.1-11.3-11.3-11.3h-36.7c-8.8 0-16 7.2-16 16v4.5c0 6.9-4.4 13-10.9 15.2l-31.6 10.5c-3.3 1.1-5.5 4.1-5.5 7.6v2.2c0 4.4-3.6 8-8 8h-16c-4.4 0-8-3.6-8-8s-3.6-8-8-8H247c-3 0-5.8 1.7-7.2 4.4l-9.4 18.7c-2.7 5.4-8.2 8.8-14.3 8.8H194c-8.8 0-16-7.2-16-16V199c0-4.2 1.7-8.3 4.7-11.3l20.1-20.1c4.6-4.6 7.2-10.9 7.2-17.5 0-3.4 2.2-6.5 5.5-7.6l40-13.3c1.7-.6 3.2-1.5 4.4-2.7l26.8-26.8c2.1-2.1 3.3-5 3.3-8 0-6.2-5.1-11.3-11.3-11.3H258l-16 16v8c0 4.4-3.6 8-8 8h-16c-4.4 0-8-3.6-8-8v-20c0-2.5 1.2-4.9 3.2-6.4l28.9-21.7c1.9-.1 3.8-.3 5.7-.3C358.3 56 448 145.7 448 256zM130.1 149.1c0-3 1.2-5.9 3.3-8l25.4-25.4c2.1-2.1 5-3.3 8-3.3 6.2 0 11.3 5.1 11.3 11.3v16c0 3-1.2 5.9-3.3 8l-9.4 9.4c-2.1 2.1-5 3.3-8 3.3h-16c-6.2 0-11.3-5.1-11.3-11.3zm128 306.4v-7.1c0-8.8-7.2-16-16-16h-20.2c-10.8 0-26.7-5.3-35.4-11.8l-22.2-16.7c-11.5-8.6-18.2-22.1-18.2-36.4v-23.9c0-16 8.4-30.8 22.1-39l42.9-25.7c7.1-4.2 15.2-6.5 23.4-6.5h31.2c10.9 0 21.4 3.9 29.6 10.9l43.2 37.1h18.3c8.5 0 16.6 3.4 22.6 9.4l17.3 17.3c3.4 3.4 8.1 5.3 12.9 5.3H423c-32.4 58.9-93.8 99.5-164.9 103.1z"
								></path>
							</svg>
							<a :href="`https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/tags/${version}`" target="_blank">{{
								version
							}}</a>
						</span>
						<span>
							<svg
								style="height: 11px; width: 11px"
								aria-hidden="true"
								focusable="false"
								data-prefix="fas"
								data-icon="code-branch"
								role="img"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 384 512"
								data-fa-i2svg=""
							>
								<path
									fill="currentColor"
									d="M384 144c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 36.4 24.3 67.1 57.5 76.8-.6 16.1-4.2 28.5-11 36.9-15.4 19.2-49.3 22.4-85.2 25.7-28.2 2.6-57.4 5.4-81.3 16.9v-144c32.5-10.2 56-40.5 56-76.3 0-44.2-35.8-80-80-80S0 35.8 0 80c0 35.8 23.5 66.1 56 76.3v199.3C23.5 365.9 0 396.2 0 432c0 44.2 35.8 80 80 80s80-35.8 80-80c0-34-21.2-63.1-51.2-74.6 3.1-5.2 7.8-9.8 14.9-13.4 16.2-8.2 40.4-10.4 66.1-12.8 42.2-3.9 90-8.4 118.2-43.4 14-17.4 21.1-39.8 21.6-67.9 31.6-10.8 54.4-40.7 54.4-75.9zM80 64c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm0 384c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zm224-320c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16z"
								></path>
							</svg>
							<a :href="`https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/commit/${release}`" target="_blank">
								{{ release.substring(0, 8) }}
							</a>
						</span>
						<span>
							<svg
								style="height: 11px; width: 11px"
								aria-hidden="true"
								focusable="false"
								data-prefix="fa"
								data-icon="flask"
								role="img"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 448 512"
								data-fa-i2svg=""
							>
								<path
									fill="currentColor"
									d="M437.2 403.5L320 215V64h8c13.3 0 24-10.7 24-24V24c0-13.3-10.7-24-24-24H120c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h8v151L10.8 403.5C-18.5 450.6 15.3 512 70.9 512h306.2c55.7 0 89.4-61.5 60.1-108.5zM137.9 320l48.2-77.6c3.7-5.2 5.8-11.6 5.8-18.4V64h64v160c0 6.9 2.2 13.2 5.8 18.4l48.2 77.6h-172z"
								></path>
							</svg>
							{{ channel }}
						</span>
					</div>
				</div>
			</div>
			<div class="box small thanks">
				<h3>{{ $t('footer.thanks') }}</h3>
				<p>{{ randomHelpers }}</p>
			</div>
		</div>
	</footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { developers, helpers } from '../../constants/index.js';
import { utils } from '../../utils';

export default defineComponent({
	name: 'FooterComp',
	data() {
		return {
			developers: developers,
			randomDev: [] as Array<string>,
			helpers: helpers,
			randomHelpers: '' as string,
			version: import.meta.env.VERSION as string,
			release: import.meta.env.VITE_API_RELEASE_COMMIT as string,
			channel: import.meta.env.VITE_API_RELEASE_CHANNEL as string
		};
	},
	mounted() {
		this.randomDev = utils.shuffle(this.developers);
		this.randomHelpers = utils.shuffle(this.helpers).join(', ');
	}
});
</script>

<style lang="scss" scoped>
$footer-bg-color: transparent;
$box-bg-color: #fffcf4;
$box-border-color: #bd7e49;
$text-color: #701000;
$link-color: #c54508;
footer {
	margin: auto 0 0 0;
	font-size: 1.4rem;
	line-height: 1.6rem;
	min-width: 100%;
	color: $text-color;
	p:not(.box) {
		margin: 0;
		padding: 0;
	}
	a,
	button {
		color: $link-color;

		&:hover,
		&:focus,
		&:active {
			color: $text-color;
		}
	}
	h3 {
		font-size: 1em;
		margin: 0 0 0.25em 0;
	}
	ul {
		padding: 0;
		margin: 0;
		list-style-type: none;
	}
}
.wrapper {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	align-items: stretch;
	padding: 3.9rem 1.35rem 6rem;
	background-image: url('../../assets/background/sky_footer_blue.webp');
	background-repeat: repeat-x;
	background-position: bottom center;
}
.box {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	flex-direction: column;
	flex: 1 0 90%;
	min-width: 152px;
	order: 1;
	margin: 7px 4px;
	padding: 1.4em;
	background: $box-bg-color;
	border-radius: 4px;
	border: 1px solid $box-border-color;
	border-bottom-width: 4px;
	&.small {
		flex: 1 1 40%;
	}
	& ul {
		font-size: 1rem;
	}
}
.box.description {
	order: 0;
	padding-top: 2.2em;
}
.etwin-logo {
	// position and colorate the etwin logo
	position: absolute;
	width: 63px;
	height: 55px;
	top: 0;
	left: 50%;
	transform: translate(-50%, -60%);
	.contour {
		fill: $box-border-color;
	}
	.white {
		fill: white;
	}
	.shadow {
		fill: lighten($box-border-color, 39%);
	}
}
.status {
	margin-top: 1em;
	border-top: 2px solid $box-border-color;
	padding-top: 1em;
	width: 100%;
	a {
		text-decoration: none;
	}
	svg {
		height: 0.9em;
		margin-right: 0.3em;
	}
}
.versionId {
	flex-direction: row;
	span {
		margin-right: 1.6em;
	}
}
@media only screen and (min-width: 768px) {
	.box {
		order: initial;
		min-width: 0;
		max-width: 392px;

		&.small {
			max-width: 152px;
		}
	}
}
</style>
