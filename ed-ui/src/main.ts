import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import './css/main.scss';
import { plugin as VueTippy } from 'vue-tippy';
import { mixin } from './mixin/mixin.js';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { initI18n } from './i18n/index.js';
import ToastPlugin from 'vue-toast-notification';
import Loading from './components/utils/Loading.vue';
import clickOutside from './directives/clickOutside.js';

const vueTippyProps = {
	directive: 'tippy',
	component: 'Tippy',
	defaultProps: {
		placement: 'bottom-start',
		followCursor: true,
		allowHTML: true,
		inlinePositioning: true,
		duration: [50, 50],
		hideOnClick: false,
		offset: [10, 20]
	}
};

const vueToastProps = {
	position: 'bottom',
	duration: 10000
};

const app = createApp(App);
const pnia = createPinia().use(piniaPluginPersistedstate);
app.use(pnia);
app.use(await initI18n());
app.use(router);
app.mixin(mixin);
app.use(VueTippy, vueTippyProps);
app.use(ToastPlugin, vueToastProps);
app.directive('clickOutside', clickOutside);

app.component('Loading', Loading);

app.mount('#app');
