import Vue from 'vue'
import Router from 'vue-router'
import Accueil from '@/components/Accueil'

Vue.use(Router);

require(['@/components/Accueil.vue'], function(accueil){
	console.log(accueil);
});

export default new Router({
	mode: 'history',
	routes: [
	{
		path: '/',
		name: 'Accueil',
		component: resolve => require(['@/components/Accueil.vue'], resolve)
	}, {
		path: '*',
		redirect: '/'
	}]
})
