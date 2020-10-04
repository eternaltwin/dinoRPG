import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
	mode: 'history',
	routes: [
	{
		path: '/',
		name: 'Accueil',
		component: resolve => require(['@/pages/Accueil.vue'], resolve)
	}, {
		path: '/dino/:id',
		name: 'dinozFiche',
		component: resolve => require(['@/pages/dinoz/dinozFiche.vue'], resolve)
	}, {
		path: '/shop/dinoz',
		name: 'dinozShop',
		component: resolve => require(['@/pages/shop/dinozShop.vue'], resolve)
	},
	{
		path: '*',
		redirect: '/'
	}]
})
