import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import './css/main.scss';
import { plugin as VueTippy } from 'vue-tippy';
import { mixin } from './mixin/mixin.js';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { initI18n } from './i18n/index.js';

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

createApp(App)
	.use(createPinia().use(piniaPluginPersistedstate))
	.use(await initI18n())
	.use(router)
	.mixin(mixin)
	.use(VueTippy, vueTippyProps)
	.mount('#app');
