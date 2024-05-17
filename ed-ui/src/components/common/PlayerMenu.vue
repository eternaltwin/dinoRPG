<template>
	<div class="player-menu">
		<p>{{ $t('playerMenu.title')}}</p>
		<span class="dashed"></span>
		<div class="grid-menu">
			<div class="dinorpg">
				<img :src="getImgURL('icons', 'small_home')" alt="accountProfile" />
				<p>{{ $t('playerMenu.gridMenu.pDRPG') }}</p>
			</div>
			<div class="eternaltwin">
				<img :src="getImgURL('icons', 'small_eternaltwin')" alt="eternaltwinProfile" />
				<p>{{ $t('playerMenu.gridMenu.pEternal') }}</p>
			</div>
			<div class="contact">
				<img :src="getImgURL('icons', 'addContact')" alt="addContact" />
				<p>{{ $t('playerMenu.gridMenu.addContact') }}</p>
			</div>
			<div class="message">
				<img :src="getImgURL('icons', 'mail')" alt="sendMessage" />
				<p>{{ $t('playerMenu.gridMenu.sendMSG') }}</p>
			</div>
		</div>
		<div class="report">
			<p>{{ $t('playerMenu.report.signal') }}</p>
			<p>{{ $t('playerMenu.report.block') }}</p>
		</div>
		<span class="dashed"></span>
		<div class="profil">
			<div class="profil-info">
				<img :src="getImgURL('design', 'pigmou_01')" alt="profil" />
				<div></div>
			</div>
			<p class="contact">{{ $t('playerMenu.contact') }}</p>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'PlayerMenu'
});
</script>

<style lang="scss" scoped>
.player-menu {
	background-color: #c2381a;
	border-top: 1px solid #ff9200;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	border-radius: 4px;
	color: white;
	padding: 10px;
	position: absolute;
	top: 100%;
	left: 0;
	width: 300px;
	height: auto;
	z-index: 1000;
	.grid-menu {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		margin-top: 7px;
		& div {
			background-color: #e04b2b;
			border-radius: 4px;
			padding: 8px;
			text-align: center;
			cursor: pointer;
			transition: background-color 0.3s;
			& img {
				width: 16px;
				height: 16px;
			}
		}
		& div:hover {
			background-color: #ff9200;
		}
	}
	.report {
		padding: 8px;
		text-align: right;
		color: white;
		cursor: pointer;
		transition: background-color 0.3s;
		& p {
			cursor: pointer;
			transition: color 0.3s;
		}
		& p:hover {
			color: #ff9200;
		}
	}
	.profil {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 10px;
		.profil-info {
			display: flex;
			justify-content: space-between;
			& img {
				width: 50px;
				height: 50px;
				border-radius: 50%;
				position: relative;
				left: 10px;
			}
		}
		.contact {
			background-color: #fff;
			color: #c2381a;
			padding: 4px;
			border: 1px solid #ccc;
			border-radius: 4px;
		}
	}
	.dashed {
		border-top: 1px dashed #ff9200;
		margin-top: 2px;
		display: block;
	}
}
</style>
