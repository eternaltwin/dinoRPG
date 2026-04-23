<template>
	<TitleHeader :title="$t('pageTitle.default')" />
	<TopBar />
	<div id="dynamic">
		<ReportPlayer />
		<ReportClan />
		<Spinner />
		<ErrorMessage />
		<Messagerie />
		<!--		<Transition name="slide">-->
		<TwinoRightMenu />
		<DinozLeftMenu />
		<!--		</Transition>-->
	</div>
	<RouterView />
	<FooterComp />
	<Toast />
	<div class="impact verdana"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from './components/utils/TitleHeader.vue';
import FooterComp from './components/utils/Footer.vue';
import Spinner from './components/utils/Spinner.vue';
import ErrorMessage from './components/utils/ErrorMessage.vue';
import Toast from './components/utils/Toast.vue';
import ReportPlayer from './components/modal/ReportPlayerModal.vue';
import ReportClan from './components/modal/ReportClanModal.vue';
import Messagerie from './components/modal/MessagerieModal.vue';
import TopBar from './components/toolBar/TopBar.vue';
import TwinoRightMenu from './components/toolBar/TwinoRightMenu.vue';
import DinozLeftMenu from './components/toolBar/DinozLeftMenu.vue';

export default defineComponent({
	name: 'App',
	components: {
		TwinoRightMenu,
		TopBar,
		Messagerie,
		TitleHeader,
		FooterComp,
		Spinner,
		ErrorMessage,
		Toast,
		ReportPlayer,
		ReportClan,
		DinozLeftMenu
	}
});
</script>

<style lang="scss">
.impact {
	font-family: 'Impact';
	display: none;
}
.verdana {
	font-family: 'Verdana';
	display: none;
}
#dynamic {
	display: flex;
	justify-content: center;
	width: 100%;
	align-items: center;
	position: absolute;
	flex-direction: column;
	gap: 74px;
}

/* Styles pour l'animation slide */
.slide-enter-active,
.slide-leave-active {
	transition: all 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
	transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
	transform: translateX(0);
}
</style>
