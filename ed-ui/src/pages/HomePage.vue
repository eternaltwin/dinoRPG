<template>
	<div id="nav" align="center">
		<table>
			<tbody>
				<tr>
					<td class="left" valign="top" />
					<td valign="top" align="center">
						<div class="centerHeader" valign="top" />
						<div class="menusky">
							<authentication-page></authentication-page>
						</div>
						<div class="homepage-container">
							<div class="box">
								<p>
									{{ $t('alpha.homepage.part1') }}<br /><br />
									{{ $t('alpha.homepage.part2') }}
									<a href="https://discord.gg/ERc3svy">Discord</a>
									{{ $t('alpha.homepage.part3') }}
									<a href="https://eternal-twin.net/forum">{{
										$t('alpha.homepage.part4')
									}}</a
									>.<br /><br />
									{{ $t('alpha.homepage.part5') }}
									<a href="https://eternal-twin.net">Eternal-Twin</a
									>.<br /><br />
									{{ $t('alpha.homepage.part6') }}
									<a href="https://eternal-twin.net/">Eternal-Twin</a>
									{{ $t('alpha.homepage.part7') }}
									<a href="https://discord.gg/ERc3svy">Discord</a>.
								</p>
							</div>
						</div>
					</td>
					<td class="right" valign="top" />
				</tr>
			</tbody>
		</table>
		<div class="footer" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AuthenticationPage from '@/pages/AuthenticationPage.vue';

export default defineComponent({
	name: 'HomePage',
	components: {
		AuthenticationPage
	}
});
</script>

<style lang="scss" scoped>
#nav {
	.homepage-container {
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-self: center;
		max-width: 1280px;
		margin: 1em 3vw;

		.box {
			position: relative;
			max-width: calc(640px - 2em);
			margin: 3em 1em;
			padding: 1em 1.5em;

			@include corner-bezel(18.5px);

			box-shadow: inset 0 0 2.1em 1.2em #b4e0ff;
			background-color: #52b6ff;
		}

		p {
			text-align: justify;
			font-size: 15px;
			line-height: 1.4em;
			font-family: trebuchet ms, arial;
			color: #016390;
		}

		img {
			width: auto;
			height: auto;
			margin: 0.6em auto 0.1em;
			padding: 0.6em;
			border-radius: 0.4em;
			background-color: rgba(15, 15, 67, 0.5);
		}

		a {
			color: #016390;
			font-weight: bold;
			text-decoration: none;
			font-variant: small-caps;
			text-shadow: 0 1px 0 #a5d9ff, 0 -1px 0 #a5d9ff,
				1px 0 0 #a5d9ff, -1px 0 0 #a5d9ff, 1px 1px 0 #a5d9ff,
				-1px -1px 0 #a5d9ff, -1px 1px 0 #a5d9ff, 1px -1px 0 #a5d9ff,
				0px 2px 2px #0076cc;
			&:hover {
				color: #52b6ff;
				text-shadow: 0 1px 0 white, 0 -1px 0 white, 1px 0 0 white,
					-1px 0 0 white, 1px 1px 0 white, -1px -1px 0 white,
					-1px 1px 0 white, 1px -1px 0 white, 0 2px 2px #0076cc;
			}
		}
		em {
			color: #01c3df;
			font-size: 1.2em;
			font-style: normal;
			font-weight: bold;

			//    &.red { color: #ff4e64; }
			&.red {
				color: inherit;
				text-decoration: underline;
				text-decoration-color: #ff4e64;
			}
		}
	}
	.menusky {
		display: flex;
		justify-content: center;
		position: relative;
		margin-top: -12em;
	}
	td {
		text-align: center;
	}
	table {
		border-collapse: collapse;
		border-spacing: 0;
	}
	.right {
		background-position: left top;
		background-image: url('../assets/background/bg_ciel.jpg');
		width: 50%;
		background-repeat: repeat-x;
	}
	.left {
		background-position: right top;
		background-image: url('../assets/background/bg_ciel.jpg');
		width: 50%;
		background-repeat: repeat-x;
	}
	.centerHeader {
		background-image: url('../assets/background/sky_headerbg.jpg');
		background-repeat: no-repeat;
		width: 1008px;
		height: 510px;
		margin: 0;
		padding: 0;
	}
	.sign {
		position: inherit;
		font-family: trebuchet ms, arial;
		font-size: 25px;
		color: #016390;
		font-weight: bold;
		text-decoration: none;
		cursor: pointer;
		margin-left: 10px;
		text-shadow: 0 1px 0 #a5d9ff, 0 -1px 0 #a5d9ff, 1px 0 0 #a5d9ff,
			-1px 0 0 #a5d9ff, 1px 1px 0 #a5d9ff, -1px -1px 0 #a5d9ff,
			-1px 1px 0 #a5d9ff, 1px -1px 0 #a5d9ff, 0 2px 2px #0076cc;
	}
	.sign:hover {
		color: #52b6ff;
		background-color: transparent;
		text-shadow: 0 1px 0 white, 0 -1px 0 white, 1px 0 0 white,
			-1px 0 0 white, 1px 1px 0 white, -1px -1px 0 white,
			-1px 1px 0 white, 1px -1px 0 white, 0 2px 2px #0076cc;
	}
	.bloc {
		width: 53em;
		height: 19em;
		margin-top: 21.5em;
		background-position: left top;
		position: absolute;
	}
}
.footer {
	background-image: url('../assets/background/sky_footer_blue.jpg');
	height: 4em;
	width: 100%;
	background-repeat: repeat-x;
	background-position: center bottom;
	bottom: 0;
	position: fixed;
}
</style>
