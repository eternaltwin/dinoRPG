import Vue from 'vue';
import VueResource from 'vue-resource';
import router from '@/router';
import i18n from '@/helpers/i18n.js';
import store from '@/store/store.js';
import '@/helpers/filters';

init();

function init() {

	const isProduction = process.env.NODE_ENV === 'production';

	Vue.config.productionTip = !isProduction;

	Vue.use(VueResource);

	new Vue({
		el: '#app',
		i18n,
		store,
		router,
		render: h => h(require('./App.vue').default)
	});
}