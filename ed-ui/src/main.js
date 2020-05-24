import Vue from 'vue'
import VueResource from 'vue-resource'
import router from './router'

Vue.config.productionTip = false
Vue.use(VueResource);

new Vue({
	el: '#app',
	router,
	render: h => h(require('./App.vue').default)
})
