import Vue from 'vue';
import VueResource from 'vue-resource';
import router from '@/router';
import i18n from '@/helpers/i18n.js';
import store from '@/store/store.js';
import '@/helpers/filters';

Vue.config.productionTip = false;

Vue.use(VueResource);

new Vue({
	el: '#app',
	i18n,
	store,
	router,
	render: h => h(require('./App.vue').default)
});
