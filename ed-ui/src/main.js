import Vue from 'vue'
import VueResource from 'vue-resource'
import router from './router'
import VueSessionStorage from 'vue-sessionstorage'

Vue.config.productionTip = false
Vue.use(VueResource);
Vue.use(VueSessionStorage);

new Vue({
	el: '#app',
	router,
	render: h => h(require('./App.vue').default)
})
