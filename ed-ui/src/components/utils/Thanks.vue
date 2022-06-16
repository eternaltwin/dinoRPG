<template>
	<div class="footer">
		<div class="wrapper">
			<strong>{{ $t('footer.dinorpg') }}</strong>
			<div class="content">
				<i18n-t keypath="footer.text1" tag="div" class="text">
					<template v-slot:DinoRPG>
						<a href="https://www.google.com/" target="_blank">
							DinoRPG
						</a>
					</template>
				</i18n-t>
				<i18n-t keypath="footer.text2" tag="div" class="text">
					<template v-slot:Gitlab>
						<a
							href="https://gitlab.com/eternaltwin/dinorpg/dinorpg/"
							target="_blank"
						>
							Gitlab
						</a>
					</template>
				</i18n-t>
				<i18n-t keypath="footer.text3" tag="div" class="text">
					<template v-slot:EternalTwin>
						<a href="https://eternal-twin.net/" target="_blank">
							EternalTwin
						</a>
					</template>
					<template v-slot:OpenCollective>
						<a href="https://opencollective.com/eternaltwin" target="_blank">
							OpenCollective
						</a>
					</template>
				</i18n-t>
			</div>
		</div>
		<div class="wrapper">
			<strong>{{ $t('footer.thanks') }}</strong>
			<div class="content">
				<p>{{ randomHelpers }}</p>
			</div>
		</div>
		<div class="wrapper">
			<strong>{{ $t('footer.developpers') }}</strong>
			<div class="content">
				<p v-for="dev in randomDev" :key="dev">{{ dev }}</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { developers, helpers } from '@/constants';

export default defineComponent({
	name: 'Thanks',
	data() {
		return {
			developers: developers,
			randomDev: [] as Array<string>,
			helpers: helpers,
			randomHelpers: '' as string
		};
	},
	mounted() {
		this.randomDev = this.developers.sort(() => 0.5 - Math.random());
		this.randomHelpers = this.helpers
			.sort(() => 0.5 - Math.random())
			.toString();
	}
});
</script>

<style lang="scss" scoped>
.text {
	text-align: justify;
	padding: 0.5em;
}
.wrapper {
	font-family: Nunito, Century Gothic, Arial, Trebuchet MS, Verdana, Open Sans,
		sans-serif;
	background: rgba(0, 0, 0, 0.33);
	margin-bottom: 5px;
	font-size: 11px;
	font-variant: small-caps;
	padding: 0 0 5px;
	text-align: center;
	width: 29%;
	height: fit-content;
	color: black;
	text-shadow: #8e3e26;
	& strong {
		display: block;
		background: rgba(0, 0, 0, 0.5);
	}
}
.footer {
	box-sizing: border-box;
	margin-top: 15px;
	color: rgb(250, 227, 206);
	justify-content: space-around;
	display: flex;
	float: left;
	font-family: Nunito, Century Gothic, Arial, Trebuchet MS, Verdana, Open Sans,
		sans-serif;
	font-size: 11px;
	position: relative;
	top: -40px;
	bottom: 10px;
	left: 10px;
	width: 98%;
}
</style>
