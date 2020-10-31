import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './router';
import i18n from './i18n.js';

Vue.config.productionTip = false;

Vue.use(VueResource);

new Vue({
	el: '#app',
	i18n,
	router,
	render: h => h(require('./App.vue').default)
});
