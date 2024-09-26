<template>
	<TitleHeader :title="$t('pageTitle.default')" />
	<div id="dynamic">
		<Report />
		<Spinner />
		<ErrorMessage />
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
import Report from './components/modal/ReportModal.vue';

export default defineComponent({
	name: 'App',
	components: {
		TitleHeader,
		FooterComp,
		Spinner,
		ErrorMessage,
		Toast,
		Report
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
</style>
